import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, RefreshCw, BarChart2, Activity, AlertCircle, Star, Clock } from 'lucide-react';

interface StockQuote {
  symbol: string; name: string; price: number; change: number; changePct: number;
  open: number; high: number; low: number; prevClose: number;
  volume: number; marketCap: number; week52High: number; week52Low: number; currency: string;
}
interface HistPoint { date: string; close: number; }

// ── 4-proxy fallback chain ─────────────────────────────────────────
// Tries each proxy in order until one returns valid data
async function fetchYahoo(symbol: string, interval: string, range: string) {
  const base = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`;

  const proxies = [
    // Proxy 1: corsproxy.io
    async () => {
      const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(base)}`);
      const j = await r.json();
      return j?.chart?.result?.[0] ?? null;
    },
    // Proxy 2: allorigins (wraps response in {contents:"..."})
    async () => {
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(base)}`);
      const w = await r.json();
      const j = JSON.parse(w.contents ?? '{}');
      return j?.chart?.result?.[0] ?? null;
    },
    // Proxy 3: codetabs
    async () => {
      const r = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(base)}`);
      const j = await r.json();
      return j?.chart?.result?.[0] ?? null;
    },
    // Proxy 4: thingproxy
    async () => {
      const r = await fetch(`https://thingproxy.freeboard.io/fetch/${base}`);
      const j = await r.json();
      return j?.chart?.result?.[0] ?? null;
    },
  ];

  for (const tryProxy of proxies) {
    try {
      const result = await Promise.race([
        tryProxy(),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 7000)),
      ]);
      if (result && result.meta?.regularMarketPrice) return result;
    } catch {
      continue; // try next proxy
    }
  }
  return null;
}

async function fetchQuote(symbol: string): Promise<StockQuote | null> {
  const result = await fetchYahoo(symbol, '1d', '5d');
  if (!result) return null;
  const m = result.meta ?? {};
  const price = m.regularMarketPrice ?? 0;
  const prev  = m.chartPreviousClose ?? m.previousClose ?? price;
  return {
    symbol: m.symbol ?? symbol,
    name: m.longName ?? m.shortName ?? symbol,
    price, change: price - prev, changePct: prev ? ((price - prev) / prev) * 100 : 0,
    open: m.regularMarketOpen ?? price, high: m.regularMarketDayHigh ?? price,
    low: m.regularMarketDayLow ?? price, prevClose: prev,
    volume: m.regularMarketVolume ?? 0, marketCap: m.marketCap ?? 0,
    week52High: m.fiftyTwoWeekHigh ?? 0, week52Low: m.fiftyTwoWeekLow ?? 0,
    currency: m.currency ?? 'INR',
  };
}

async function fetchHistory(symbol: string, range: string): Promise<HistPoint[]> {
  const ivMap: Record<string,string> = { '1d':'5m','5d':'15m','1mo':'1d','3mo':'1d','6mo':'1wk','1y':'1wk','5y':'1mo' };
  const result = await fetchYahoo(symbol, ivMap[range] ?? '1d', range);
  if (!result) return [];
  const ts: number[] = result.timestamp ?? [];
  const cl: number[] = result.indicators?.quote?.[0]?.close ?? [];
  return ts.map((t,i) => ({
    date: new Date(t*1000).toLocaleDateString('en-IN', { month:'short', day:'numeric' }),
    close: cl[i] ?? 0,
  })).filter(p => p.close > 0);
}

const POPULAR = [
  { sym:'RELIANCE.NS', label:'Reliance' }, { sym:'TCS.NS', label:'TCS' },
  { sym:'HDFCBANK.NS', label:'HDFC Bank' }, { sym:'INFY.NS', label:'Infosys' },
  { sym:'WIPRO.NS', label:'Wipro' }, { sym:'SBIN.NS', label:'SBI' },
];
const DEFAULT_WATCH = ['TCS.NS','HDFCBANK.NS','INFY.NS','WIPRO.NS'];

function StockChart({ data, color }: { data: HistPoint[]; color: string }) {
  if (!data.length) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'#3d5166',fontFamily:'DM Mono,monospace',fontSize:12 }}>
      No chart data
    </div>
  );
  const closes = data.map(d => d.close);
  const min = Math.min(...closes), max = Math.max(...closes), rng = max-min||1;
  const W=800,H=220,p={t:16,r:16,b:36,l:64};
  const iW=W-p.l-p.r, iH=H-p.t-p.b;
  const pts = data.map((d,i) => ({ x:p.l+(i/Math.max(data.length-1,1))*iW, y:p.t+(1-(d.close-min)/rng)*iH, d }));
  const path = pts.map((pt,i) => `${i===0?'M':'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
  const area = path + ` L${pts[pts.length-1].x},${p.t+iH} L${pts[0].x},${p.t+iH} Z`;
  const yLbls = [0,.25,.5,.75,1].map(f => ({ val:min+f*rng, y:p.t+(1-f)*iH }));
  const step = Math.max(1,Math.floor(data.length/6));
  const xLbls = pts.filter((_,i) => i%step===0||i===pts.length-1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%',height:'100%' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {yLbls.map((l,i) => (
        <g key={i}>
          <line x1={p.l} y1={l.y} x2={W-p.r} y2={l.y} stroke="rgba(255,255,255,.05)" strokeWidth="1" strokeDasharray="4,4"/>
          <text x={p.l-8} y={l.y+4} textAnchor="end" style={{ fontFamily:'DM Mono,monospace',fontSize:10,fill:'#3d5166' }}>
            {l.val>=1000?`₹${(l.val/1000).toFixed(1)}K`:`₹${l.val.toFixed(0)}`}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#cg)"/>
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {xLbls.map((pt,i) => (
        <text key={i} x={pt.x} y={H-10} textAnchor="middle" style={{ fontFamily:'DM Mono,monospace',fontSize:9,fill:'#3d5166' }}>
          {pt.d.date}
        </text>
      ))}
      <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="5" fill={color} stroke="#080c10" strokeWidth="2"/>
    </svg>
  );
}

function Spark({ pts, color }: { pts: number[]; color: string }) {
  if (pts.length < 2) return null;
  const mn=Math.min(...pts),mx=Math.max(...pts),r=mx-mn||1;
  const W=60,H=22;
  const coords = pts.map((v,i) => `${((i/(pts.length-1))*W).toFixed(1)},${(H-((v-mn)/r)*(H-4)-2).toFixed(1)}`).join(' ');
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width:60,height:22 }}><polyline points={coords} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/></svg>;
}

function getSignal(q: StockQuote, hist: HistPoint[]) {
  if (!hist.length) return { label:'N/A',color:'#7a8fa3',bg:'rgba(122,143,163,.1)',desc:'Insufficient data' };
  const prices=hist.map(h=>h.close);
  const avg20=prices.slice(-20).reduce((a,b)=>a+b,0)/Math.min(20,prices.length);
  const avg50=prices.slice(-50).reduce((a,b)=>a+b,0)/Math.min(50,prices.length);
  const cur=q.price, f52=q.week52Low?((cur-q.week52Low)/q.week52Low)*100:0;
  if (cur>avg20&&cur>avg50&&f52>20) return { label:'STRONG BUY',color:'#00ff88',bg:'rgba(0,255,136,.12)',desc:'Above 20 & 50-day avg. Strong uptrend.' };
  if (cur>avg20&&q.changePct>0)     return { label:'BUY',color:'#00ff88',bg:'rgba(0,255,136,.08)',desc:'Above 20-day avg. Positive momentum.' };
  if (cur<avg20&&cur<avg50)         return { label:'STRONG SELL',color:'#ff4d6a',bg:'rgba(255,77,106,.12)',desc:'Below key averages. Downtrend detected.' };
  if (cur<avg20&&q.changePct<-1)    return { label:'SELL',color:'#ff4d6a',bg:'rgba(255,77,106,.08)',desc:'Below 20-day avg. Negative momentum.' };
  return { label:'HOLD',color:'#f5c842',bg:'rgba(245,200,66,.10)',desc:'Neutral zone. Monitor closely.' };
}

const inr = (n: number) => n ? `₹${n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}` : '—';
const fmt = (n: number, pre='₹') => !n?'—':n>=1e7?`${pre}${(n/1e7).toFixed(2)}Cr`:n>=1e5?`${pre}${(n/1e5).toFixed(2)}L`:n>=1e3?`${pre}${(n/1e3).toFixed(2)}K`:`${pre}${n.toFixed(2)}`;

const StockAnalyzer = () => {
  const [query,setQuery]     = useState('');
  const [symbol,setSymbol]   = useState('RELIANCE.NS');
  const [quote,setQuote]     = useState<StockQuote|null>(null);
  const [history,setHistory] = useState<HistPoint[]>([]);
  const [range,setRange]     = useState('3mo');
  const [loading,setLoading] = useState(false);
  const [error,setError]     = useState('');
  const [proxyMsg,setProxyMsg] = useState('');
  const [watched,setWatched] = useState<string[]>(DEFAULT_WATCH);
  const [wData,setWData]     = useState<Record<string,StockQuote>>({});
  const [wHist,setWHist]     = useState<Record<string,number[]>>({});
  const addRef = useRef<HTMLInputElement>(null);
  const RANGES = ['1d','5d','1mo','3mo','6mo','1y','5y'];

  const loadMain = async (sym: string, rng: string) => {
    setLoading(true); setError(''); setProxyMsg('Trying proxy 1/4…'); setQuote(null); setHistory([]);
    const [q,h] = await Promise.all([fetchQuote(sym), fetchHistory(sym,rng)]);
    setProxyMsg('');
    if (!q) setError(`Could not load "${sym}". All proxies failed. Check internet connection or try again.`);
    else { setQuote(q); setHistory(h); }
    setLoading(false);
  };

  const loadWatch = async () => {
    const qs = await Promise.all(watched.map(s => fetchQuote(s)));
    const hs = await Promise.all(watched.map(s => fetchHistory(s,'1mo')));
    const qm: Record<string,StockQuote>={}, hm: Record<string,number[]>={};
    watched.forEach((s,i) => { if(qs[i]) qm[s]=qs[i]!; hm[s]=hs[i].map(p=>p.close); });
    setWData(qm); setWHist(hm);
  };

  useEffect(() => { loadMain(symbol,range); }, [symbol,range]);
  useEffect(() => { loadWatch(); }, [watched]);

  const handleSearch = () => { const s=query.trim().toUpperCase(); if(!s) return; setSymbol(s); setQuery(''); };
  const addWatch = () => {
    const v=(addRef.current?.value??'').trim().toUpperCase();
    if(v&&!watched.includes(v)) { setWatched(p=>[...p,v]); if(addRef.current) addRef.current.value=''; }
  };

  const isUp=((quote?.changePct??0)>=0), accent=isUp?'#00ff88':'#ff4d6a';
  const signal=quote?getSignal(quote,history):null;
  const c=(extra:React.CSSProperties={}):React.CSSProperties=>({background:'#0e1318',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,...extra});
  const mono:React.CSSProperties={fontFamily:'DM Mono,monospace'};
  const lbl:React.CSSProperties={fontFamily:'DM Mono,monospace',fontSize:9,letterSpacing:1.2,textTransform:'uppercase',color:'#3d5166'};

  return (
    <div style={{ height:'calc(100vh - 2rem)',padding:20,fontFamily:'Syne,sans-serif',display:'flex',flexDirection:'column',gap:14,overflow:'hidden' }}>

      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',gap:12,flexShrink:0,flexWrap:'wrap' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginRight:4 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:'rgba(0,255,136,.1)',border:'1px solid rgba(0,255,136,.25)',display:'flex',alignItems:'center',justifyContent:'center',color:'#00ff88' }}>
            <BarChart2 size={18}/>
          </div>
          <div>
            <div style={{ fontSize:15,fontWeight:700,color:'#eef2f7' }}>Stock Analyzer</div>
            <div style={{ ...mono,fontSize:9,color:'#3d5166',letterSpacing:.5 }}>Live NSE/BSE · Yahoo Finance</div>
          </div>
        </div>

        <div style={{ display:'flex',gap:8,flex:1,maxWidth:420 }}>
          <div style={{ flex:1,position:'relative' }}>
            <Search size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'#3d5166' }}/>
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()}
              placeholder="RELIANCE.NS, TCS.NS…"
              style={{ width:'100%',padding:'9px 12px 9px 32px',background:'#080c10',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,color:'#eef2f7',fontFamily:'Syne,sans-serif',fontSize:13,outline:'none',transition:'border-color .2s' }}
              onFocus={e=>e.currentTarget.style.borderColor='rgba(0,255,136,.4)'}
              onBlur={e=>e.currentTarget.style.borderColor='rgba(255,255,255,.08)'}/>
          </div>
          <button onClick={handleSearch} style={{ padding:'9px 18px',background:'#00ff88',color:'#000',border:'none',borderRadius:10,fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer' }}>Analyze</button>
          <button onClick={()=>loadMain(symbol,range)} style={{ padding:'9px 12px',background:'transparent',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,color:'#7a8fa3',cursor:'pointer',display:'flex',alignItems:'center' }}>
            <RefreshCw size={13} style={{ animation:loading?'spin .7s linear infinite':'none' }}/>
          </button>
        </div>

        <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
          {POPULAR.map(p=>(
            <button key={p.sym} onClick={()=>setSymbol(p.sym)} style={{ padding:'5px 12px',background:symbol===p.sym?'rgba(0,255,136,.1)':'rgba(255,255,255,.03)',border:`1px solid ${symbol===p.sym?'rgba(0,255,136,.3)':'rgba(255,255,255,.07)'}`,borderRadius:8,color:symbol===p.sym?'#00ff88':'#7a8fa3',fontFamily:'DM Mono,monospace',fontSize:11,cursor:'pointer',transition:'all .15s' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div style={{ padding:'10px 16px',borderRadius:12,flexShrink:0,background:'rgba(255,77,106,.08)',border:'1px solid rgba(255,77,106,.2)',color:'#ff4d6a',display:'flex',alignItems:'center',gap:8,fontSize:13 }}>
          <AlertCircle size={14}/> {error}
        </div>
      )}
      {loading && (
        <div style={{ padding:'10px 16px',borderRadius:12,flexShrink:0,background:'rgba(0,255,136,.06)',border:'1px solid rgba(0,255,136,.15)',color:'#00ff88',display:'flex',alignItems:'center',gap:8,fontSize:13 }}>
          <RefreshCw size={14} style={{ animation:'spin .7s linear infinite' }}/>
          <span style={mono}>{proxyMsg || `Fetching live data for ${symbol}…`}</span>
        </div>
      )}

      {/* Main grid */}
      <div style={{ flex:1,display:'grid',gridTemplateColumns:'1fr 260px',gap:14,overflow:'hidden',minHeight:0 }}>

        {/* Left panel */}
        <div style={{ display:'flex',flexDirection:'column',gap:12,overflow:'hidden' }}>

          {quote&&!loading&&(
            <div style={{ ...c({padding:'18px 22px',border:`1px solid ${accent}22`,flexShrink:0}),display:'flex',alignItems:'center',gap:20 }}>
              <div style={{ flex:1 }}>
                <div style={{ ...mono,fontSize:10,color:'#3d5166',letterSpacing:1,marginBottom:4 }}>{quote.symbol}</div>
                <div style={{ fontSize:17,fontWeight:800,color:'#eef2f7',letterSpacing:-.3,marginBottom:8 }}>
                  {quote.name.length>34?quote.name.slice(0,34)+'…':quote.name}
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
                  <span style={{ padding:'3px 10px',borderRadius:20,background:signal?.bg,color:signal?.color,fontFamily:'DM Mono,monospace',fontSize:11,fontWeight:700,border:`1px solid ${signal?.color}33` }}>{signal?.label}</span>
                  <span style={{ fontSize:11,color:'#3d5166',fontFamily:'DM Mono,monospace' }}>{signal?.desc}</span>
                </div>
              </div>
              <div style={{ textAlign:'right',flexShrink:0 }}>
                <div style={{ fontSize:28,fontWeight:800,letterSpacing:-1,color:accent }}>{inr(quote.price)}</div>
                <div style={{ display:'flex',alignItems:'center',gap:5,justifyContent:'flex-end',marginTop:4 }}>
                  {isUp?<TrendingUp size={13} style={{ color:accent }}/>:<TrendingDown size={13} style={{ color:accent }}/>}
                  <span style={{ ...mono,fontSize:12,color:accent }}>{isUp?'+':''}{quote.change.toFixed(2)} ({isUp?'+':''}{quote.changePct.toFixed(2)}%)</span>
                </div>
                <div style={{ ...mono,fontSize:10,color:'#3d5166',marginTop:4 }}>Prev: {inr(quote.prevClose)}</div>
              </div>
            </div>
          )}

          <div style={{ ...c({padding:'14px 18px'}),flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,flexShrink:0 }}>
              <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                <Activity size={13} style={{ color:'#00ff88' }}/>
                <span style={{ fontSize:12,fontWeight:700,color:'#eef2f7' }}>Price Chart</span>
                {quote&&<span style={{ ...mono,fontSize:10,color:'#3d5166' }}> {quote.symbol}</span>}
              </div>
              <div style={{ display:'flex',gap:4 }}>
                {RANGES.map(r=>(
                  <button key={r} onClick={()=>setRange(r)} style={{ padding:'3px 9px',background:range===r?'#00ff88':'rgba(255,255,255,.04)',border:`1px solid ${range===r?'#00ff88':'rgba(255,255,255,.07)'}`,borderRadius:6,color:range===r?'#000':'#7a8fa3',fontFamily:'DM Mono,monospace',fontSize:10,fontWeight:range===r?700:400,cursor:'pointer',transition:'all .15s' }}>{r}</button>
                ))}
              </div>
            </div>
            <div style={{ flex:1,minHeight:0 }}>
              {loading
                ? <div style={{ height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,color:'#3d5166' }}>
                    <RefreshCw size={24} style={{ color:'#00ff88',animation:'spin .7s linear infinite' }}/>
                    <span style={{ ...mono,fontSize:11 }}>Loading chart data…</span>
                  </div>
                : <StockChart data={history} color={accent}/>
              }
            </div>
          </div>

          {quote&&!loading&&(
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,flexShrink:0 }}>
              {[
                {label:'High',val:inr(quote.high),color:'#00ff88'},
                {label:'Low',val:inr(quote.low),color:'#ff4d6a'},
                {label:'52W High',val:inr(quote.week52High),color:'#4d9fff'},
                {label:'52W Low',val:inr(quote.week52Low),color:'#f5c842'},
                {label:'Open',val:inr(quote.open),color:'#eef2f7'},
                {label:'Prev Close',val:inr(quote.prevClose),color:'#eef2f7'},
                {label:'Volume',val:fmt(quote.volume,''),color:'#eef2f7'},
                {label:'Mkt Cap',val:fmt(quote.marketCap),color:'#a78bfa'},
              ].map(s=>(
                <div key={s.label} style={c({padding:'11px 14px'})}>
                  <div style={{ ...lbl,marginBottom:5 }}>{s.label}</div>
                  <div style={{ ...mono,fontSize:13,fontWeight:700,color:s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel - Watchlist */}
        <div style={{ display:'flex',flexDirection:'column',gap:12,overflow:'hidden' }}>
          <div style={{ ...c({}),flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>
            <div style={{ padding:'13px 14px',borderBottom:'1px solid rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
              <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                <Star size={13} style={{ color:'#f5c842' }}/>
                <span style={{ fontSize:12,fontWeight:700,color:'#eef2f7' }}>Watchlist</span>
              </div>
              <span style={{ ...mono,fontSize:9,color:'#3d5166' }}>{watched.length} stocks</span>
            </div>

            <div style={{ flex:1,overflowY:'auto',padding:8 }}>
              {watched.map(sym=>{
                const q=wData[sym], hs=wHist[sym]??[], up=(q?.changePct??0)>=0;
                return (
                  <div key={sym} onClick={()=>setSymbol(sym)}
                    style={{ padding:'9px 10px',borderRadius:10,cursor:'pointer',marginBottom:4,display:'flex',alignItems:'center',justifyContent:'space-between',background:symbol===sym?'rgba(0,255,136,.06)':'transparent',border:`1px solid ${symbol===sym?'rgba(0,255,136,.15)':'transparent'}`,transition:'all .15s' }}
                    onMouseEnter={e=>{if(symbol!==sym)(e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,.03)';}}
                    onMouseLeave={e=>{if(symbol!==sym)(e.currentTarget as HTMLDivElement).style.background='transparent';}}
                  >
                    <div>
                      <div style={{ ...mono,fontSize:12,fontWeight:700,color:symbol===sym?'#00ff88':'#eef2f7' }}>{sym.replace('.NS','').replace('.BO','')}</div>
                      <div style={{ ...mono,fontSize:10,color:'#3d5166',marginTop:2 }}>{q?inr(q.price):<span style={{ color:'#2a3a4a' }}>loading…</span>}</div>
                    </div>
                    <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3 }}>
                      {q&&<span style={{ ...mono,fontSize:11,color:up?'#00ff88':'#ff4d6a' }}>{up?'+':''}{q.changePct.toFixed(2)}%</span>}
                      {hs.length>1&&<Spark pts={hs} color={up?'#00ff88':'#ff4d6a'}/>}
                      <button onClick={e=>{e.stopPropagation();setWatched(p=>p.filter(x=>x!==sym));}}
                        style={{ background:'transparent',border:'none',color:'#2a3a4a',cursor:'pointer',fontSize:11,...mono,padding:'0 2px',transition:'color .15s' }}
                        onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color='#ff4d6a'}
                        onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#2a3a4a'}
                      >✕</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding:'10px 12px',borderTop:'1px solid rgba(255,255,255,.06)',flexShrink:0 }}>
              <div style={{ display:'flex',gap:6 }}>
                <input ref={addRef} placeholder="e.g. TATAMOTORS.NS" onKeyDown={e=>e.key==='Enter'&&addWatch()}
                  style={{ flex:1,padding:'7px 10px',background:'#080c10',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,color:'#eef2f7',fontFamily:'DM Mono,monospace',fontSize:11,outline:'none' }}/>
                <button onClick={addWatch} style={{ padding:'7px 10px',background:'rgba(0,255,136,.08)',border:'1px solid rgba(0,255,136,.2)',borderRadius:8,color:'#00ff88',fontFamily:'DM Mono,monospace',fontSize:11,cursor:'pointer' }}>+ Add</button>
              </div>
              <div style={{ ...mono,fontSize:9,color:'#2a3a4a',marginTop:5 }}>Always use .NS suffix for NSE stocks</div>
            </div>
          </div>

          <div style={{ background:'rgba(0,255,136,.04)',border:'1px solid rgba(0,255,136,.12)',borderRadius:14,padding:'13px 15px',flexShrink:0 }}>
            <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:7 }}>
              <Clock size={11} style={{ color:'#00ff88' }}/>
              <span style={{ ...mono,fontSize:9,color:'#00ff88',letterSpacing:1,textTransform:'uppercase' }}>Buffett's Rule</span>
            </div>
            <p style={{ fontSize:12,color:'#7a8fa3',lineHeight:1.6,fontStyle:'italic',margin:0 }}>
              "Be fearful when others are greedy and greedy when others are fearful."
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
};

export default StockAnalyzer;
