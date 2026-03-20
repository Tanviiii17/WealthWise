import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Brain, BarChart2, ArrowRight, Zap, Target, Activity } from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Real-Time Market Insights',
    description: 'Live NIFTY, SENSEX updates with AI-driven predictions tailored for Indian markets.',
    color: '#00ff88',
  },
  {
    icon: Shield,
    title: 'Smart Portfolio Management',
    description: 'Personalized investment suggestions based on your risk profile and financial goals.',
    color: '#4d9fff',
  },
  {
    icon: Brain,
    title: 'Learn & Grow',
    description: 'Educational resources to improve your financial literacy and investment knowledge.',
    color: '#f5c842',
  },
  {
    icon: BarChart2,
    title: 'Deep Market Analysis',
    description: 'AI-powered analysis of stock trends, sectoral movements and market predictions.',
    color: '#a78bfa',
  },
  {
    icon: Zap,
    title: 'Instant AI Advisor',
    description: 'Chat with your personal AI financial advisor anytime, anywhere — powered by Gemini.',
    color: '#00ff88',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set financial milestones and watch your progress with visual goal dashboards.',
    color: '#4d9fff',
  },
];

const stats = [
  { value: '₹10Cr+', label: 'Assets Analyzed' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '5000+', label: 'Active Users' },
  { value: '24/7', label: 'AI Support' },
];

const Home = () => {
  return (
    <div className="ww-home">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .ww-home {
          min-height: 100vh;
          background: #080c10;
          color: #eef2f7;
          font-family: 'Syne', sans-serif;
          overflow-x: hidden;
        }

        /* ── Grid BG ── */
        .ww-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 120px 0 80px;
          overflow: hidden;
        }
        .ww-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }
        .ww-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }
        .ww-orb-1 { width: 600px; height: 600px; background: rgba(0,255,136,.07); top: -200px; left: -100px; }
        .ww-orb-2 { width: 500px; height: 500px; background: rgba(77,159,255,.06); bottom: -100px; right: -100px; }
        .ww-orb-3 { width: 300px; height: 300px; background: rgba(167,139,250,.05); top: 30%; right: 20%; }

        /* ── Hero Content ── */
        .ww-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .ww-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(0,255,136,.1);
          border: 1px solid rgba(0,255,136,.25);
          border-radius: 20px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #00ff88;
          letter-spacing: 1px;
          margin-bottom: 24px;
          animation: fadeUp .6s ease both;
        }
        .ww-tag-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00ff88;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

        .ww-hero-title {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
          animation: fadeUp .6s .1s ease both;
        }
        .ww-accent { color: #00ff88; }
        .ww-accent-blue { color: #4d9fff; }

        .ww-hero-sub {
          font-size: 16px;
          line-height: 1.7;
          color: #7a8fa3;
          margin-bottom: 36px;
          max-width: 480px;
          animation: fadeUp .6s .2s ease both;
        }

        .ww-cta-row {
          display: flex;
          gap: 14px;
          align-items: center;
          animation: fadeUp .6s .3s ease both;
        }
        .ww-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          background: #00ff88;
          color: #000;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all .2s;
          border: none;
          cursor: pointer;
        }
        .ww-btn-primary:hover {
          background: #00e07a;
          box-shadow: 0 0 30px rgba(0,255,136,.35);
          transform: translateY(-2px);
          color: #000;
          text-decoration: none;
        }
        .ww-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          background: transparent;
          color: #7a8fa3;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,.1);
          transition: all .2s;
        }
        .ww-btn-ghost:hover {
          border-color: rgba(0,255,136,.3);
          color: #00ff88;
          text-decoration: none;
        }

        /* ── Stats ── */
        .ww-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          animation: fadeUp .6s .4s ease both;
        }
        .ww-stat-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          padding: 20px;
          transition: all .2s;
        }
        .ww-stat-card:hover {
          border-color: rgba(0,255,136,.2);
          background: rgba(0,255,136,.04);
        }
        .ww-stat-val {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -1px;
          color: #00ff88;
          margin-bottom: 4px;
        }
        .ww-stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #3d5166;
          letter-spacing: .5px;
          text-transform: uppercase;
        }

        /* ── Right visual panel ── */
        .ww-hero-visual {
          position: relative;
          animation: fadeUp .6s .2s ease both;
        }
        .ww-terminal {
          background: #0e1318;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,.5);
        }
        .ww-terminal-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 18px;
          background: #131a21;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .ww-dot { width: 10px; height: 10px; border-radius: 50%; }
        .ww-dot-r { background: #ff5f57; }
        .ww-dot-y { background: #febc2e; }
        .ww-dot-g { background: #28c840; }
        .ww-terminal-title {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #3d5166;
          margin-left: 8px;
        }
        .ww-terminal-body { padding: 24px; }

        .ww-ticker-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .ww-ticker-row:last-child { border-bottom: none; }
        .ww-ticker-sym { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 700; }
        .ww-ticker-name { font-size: 11px; color: #3d5166; margin-top: 2px; }
        .ww-ticker-price { font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 700; }
        .ww-ticker-chg {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 20px;
        }
        .ww-up { background: rgba(0,255,136,.12); color: #00ff88; }
        .ww-dn { background: rgba(255,77,106,.12); color: #ff4d6a; }

        .ww-ai-box {
          margin-top: 16px;
          padding: 14px;
          background: rgba(0,255,136,.06);
          border: 1px solid rgba(0,255,136,.15);
          border-radius: 12px;
        }
        .ww-ai-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #00ff88;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .ww-ai-text { font-size: 13px; line-height: 1.6; color: #7a8fa3; }
        .ww-ai-text strong { color: #eef2f7; }

        /* ── Section ── */
        .ww-section {
          padding: 100px 0;
          position: relative;
        }
        .ww-section-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .ww-section-tag {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #00ff88;
          margin-bottom: 14px;
        }
        .ww-section-title {
          font-size: clamp(1.8rem, 3vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -1px;
          margin-bottom: 14px;
          line-height: 1.15;
        }
        .ww-section-sub {
          font-size: 16px;
          color: #7a8fa3;
          max-width: 520px;
          line-height: 1.7;
          margin-bottom: 56px;
        }

        /* ── Features grid ── */
        .ww-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .ww-feat-card {
          background: #0e1318;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 18px;
          padding: 28px;
          transition: all .25s;
          position: relative;
          overflow: hidden;
        }
        .ww-feat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--fc, transparent) 0%, transparent 60%);
          opacity: 0;
          transition: opacity .3s;
        }
        .ww-feat-card:hover { transform: translateY(-4px); border-color: var(--fc, rgba(0,255,136,.2)); }
        .ww-feat-card:hover::before { opacity: .07; }
        .ww-feat-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          font-size: 20px;
        }
        .ww-feat-title {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 10px;
          color: #eef2f7;
        }
        .ww-feat-desc { font-size: 13px; color: #7a8fa3; line-height: 1.7; }

        /* ── CTA Strip ── */
        .ww-cta-strip {
          background: #0e1318;
          border-top: 1px solid rgba(255,255,255,.06);
          border-bottom: 1px solid rgba(255,255,255,.06);
          padding: 80px 0;
        }
        .ww-cta-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }
        .ww-cta-title { font-size: 2rem; font-weight: 800; letter-spacing: -.5px; max-width: 480px; line-height: 1.2; }
        .ww-cta-sub { font-size: 14px; color: #7a8fa3; margin-top: 10px; }

        /* ── How it works ── */
        .ww-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; position: relative; }
        .ww-steps::before {
          content: '';
          position: absolute;
          top: 32px;
          left: 16%;
          right: 16%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,255,136,.3), transparent);
        }
        .ww-step { text-align: center; padding: 0 24px; }
        .ww-step-num {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: #0e1318;
          border: 1px solid rgba(0,255,136,.25);
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 18px;
          font-weight: 700;
          color: #00ff88;
          margin: 0 auto 20px;
        }
        .ww-step-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
        .ww-step-desc { font-size: 13px; color: #7a8fa3; line-height: 1.6; }

        /* ── Footer bar ── */
        .ww-footer {
          border-top: 1px solid rgba(255,255,255,.06);
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
        }
        .ww-footer-brand { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 800; }
        .ww-footer-brand-icon { color: #00ff88; font-size: 20px; }
        .ww-footer-copy { font-family: 'DM Mono', monospace; font-size: 11px; color: #3d5166; }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .ww-hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .ww-hero-visual { max-width: 520px; }
          .ww-features-grid { grid-template-columns: repeat(2, 1fr); }
          .ww-cta-inner { flex-direction: column; text-align: center; }
        }
        @media (max-width: 640px) {
          .ww-hero { padding: 100px 0 60px; }
          .ww-features-grid { grid-template-columns: 1fr; }
          .ww-steps { grid-template-columns: 1fr; gap: 40px; }
          .ww-steps::before { display: none; }
          .ww-stats { grid-template-columns: repeat(2, 1fr); }
          .ww-cta-row { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="ww-hero">
        <div className="ww-grid-bg" />
        <div className="ww-orb ww-orb-1" />
        <div className="ww-orb ww-orb-2" />
        <div className="ww-orb ww-orb-3" />

        <div className="ww-hero-inner">
          {/* Left */}
          <div>
            <div className="ww-tag">
              <span className="ww-tag-dot" />
              AI-POWERED · INDIAN MARKETS
            </div>

            <h1 className="ww-hero-title">
              Your Smartest<br />
              <span className="ww-accent">Investment</span><br />
              Partner
            </h1>

            <p className="ww-hero-sub">
              Make smarter decisions in Indian markets with real-time NIFTY &amp; SENSEX analysis,
              AI-driven insights, and personalized portfolio recommendations — all in one place.
            </p>

            <div className="ww-cta-row">
              <Link to="/sign-up" className="ww-btn-primary">
                Start Investing Free <ArrowRight size={16} />
              </Link>
              <Link to="/portfolio/learn" className="ww-btn-ghost">
                See How It Works
              </Link>
            </div>
          </div>

          {/* Right — Live terminal visual */}
          <div className="ww-hero-visual">
            <div className="ww-terminal">
              <div className="ww-terminal-bar">
                <span className="ww-dot ww-dot-r" />
                <span className="ww-dot ww-dot-y" />
                <span className="ww-dot ww-dot-g" />
                <span className="ww-terminal-title">wealthwise — live market feed</span>
              </div>
              <div className="ww-terminal-body">
                {[
                  { sym: 'NIFTY 50', name: 'National Index', price: '22,147.90', chg: '+0.76%', up: true },
                  { sym: 'SENSEX', name: 'BSE Index', price: '73,198.10', chg: '+0.82%', up: true },
                  { sym: 'RELIANCE', name: 'Reliance Industries', price: '₹2,891.40', chg: '+1.24%', up: true },
                  { sym: 'TCS', name: 'Tata Consultancy', price: '₹3,890.70', chg: '-0.43%', up: false },
                  { sym: 'HDFC BANK', name: 'HDFC Bank Ltd.', price: '₹1,642.30', chg: '+0.91%', up: true },
                ].map((t) => (
                  <div className="ww-ticker-row" key={t.sym}>
                    <div>
                      <div className="ww-ticker-sym">{t.sym}</div>
                      <div className="ww-ticker-name">{t.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="ww-ticker-price">{t.price}</div>
                      <span className={`ww-ticker-chg ${t.up ? 'ww-up' : 'ww-dn'}`}>
                        {t.up ? '▲' : '▼'} {t.chg}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="ww-ai-box">
                  <div className="ww-ai-label">⬡ AI Insight</div>
                  <div className="ww-ai-text">
                    <strong>Markets bullish today.</strong> IT sector showing recovery — TCS correction
                    may present a buying opportunity. NIFTY resistance at 22,400.
                  </div>
                </div>
              </div>
            </div>

            {/* Stats below terminal */}
            <div className="ww-stats" style={{ marginTop: 16 }}>
              {stats.map((s) => (
                <div className="ww-stat-card" key={s.label}>
                  <div className="ww-stat-val">{s.value}</div>
                  <div className="ww-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="ww-section" style={{ background: '#0a0e13' }}>
        <div className="ww-section-inner">
          <div className="ww-section-tag">How It Works</div>
          <h2 className="ww-section-title">Three steps to <span className="ww-accent">smarter</span> investing</h2>
          <div className="ww-steps">
            {[
              { n: '01', title: 'Connect Your Goals', desc: 'Tell us your investment goals, risk appetite, and financial situation in minutes.' },
              { n: '02', title: 'AI Analyses Markets', desc: 'Our Gemini-powered engine scans NIFTY, SENSEX and thousands of Indian stocks in real time.' },
              { n: '03', title: 'Get Personalized Advice', desc: 'Receive actionable recommendations, alerts and insights tailored specifically to you.' },
            ].map((s) => (
              <div className="ww-step" key={s.n}>
                <div className="ww-step-num">{s.n}</div>
                <div className="ww-step-title">{s.title}</div>
                <div className="ww-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="ww-section">
        <div className="ww-section-inner">
          <div className="ww-section-tag">Features</div>
          <h2 className="ww-section-title">Everything you need to<br /><span className="ww-accent-blue">grow your wealth</span></h2>
          <p className="ww-section-sub">
            A complete toolkit for the modern Indian investor — from real-time data to AI-powered portfolio management.
          </p>

          <div className="ww-features-grid">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  className="ww-feat-card"
                  key={i}
                  style={{ '--fc': f.color + '20' } as React.CSSProperties}
                >
                  <div
                    className="ww-feat-icon"
                    style={{ background: f.color + '15', color: f.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="ww-feat-title">{f.title}</div>
                  <div className="ww-feat-desc">{f.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <div className="ww-cta-strip">
        <div className="ww-cta-inner">
          <div>
            <div className="ww-cta-title">
              Ready to make <span className="ww-accent">smarter</span> financial decisions?
            </div>
            <p className="ww-cta-sub">Join 5000+ investors already using WealthWise to grow their wealth.</p>
          </div>
          <div style={{ display: 'flex', gap: 14, flexShrink: 0 }}>
            <Link to="/sign-up" className="ww-btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link to="/sign-in" className="ww-btn-ghost" style={{ fontSize: 15, padding: '14px 28px' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="ww-footer">
          <div className="ww-footer-brand">
            <Activity size={20} style={{ color: '#00ff88' }} />
            WealthWise
          </div>
          <div className="ww-footer-copy">
            © {new Date().getFullYear()} WealthWise · AI-Powered Indian Market Advisor
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
