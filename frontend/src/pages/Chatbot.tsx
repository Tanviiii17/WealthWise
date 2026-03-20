import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Volume2, VolumeX, Mic, MicOff, X } from 'lucide-react';
import axios from 'axios';
import { SERVER_URL } from '../utils';

interface Message {
  type: 'user' | 'bot';
  content: string | string[];
  timestamp: Date;
  isThinking?: boolean;
  isTyping?: boolean;
}

const thinkingPhrases = [
  "Analyzing your financial data...",
  "Crunching the numbers...",
  "Reviewing market trends...",
  "Calculating optimal solutions...",
  "Processing financial insights...",
  "Examining investment patterns...",
  "Evaluating market conditions...",
  "Generating personalized advice..."
];

const defaultPrompts = [
  "what is the stock price of Adani green",
  "give me last week return of tata motors",
  "give me last 3days stock price of tata consultancy services"
];

const Chatbot = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: "Hello! I'm your AI financial assistant powered by Llama 3. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput]               = useState('');
  const [isTyping, setIsTyping]         = useState(false);
  const [currentThinkingIndex, setCurrentThinkingIndex] = useState(0);
  const [isSpeaking, setIsSpeaking]     = useState<number | null>(null);
  const [isListening, setIsListening]   = useState(false);
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
  const [transcript, setTranscript]     = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    let thinkingInterval: number;
    if (isTyping) {
      thinkingInterval = setInterval(() => {
        setCurrentThinkingIndex(prev => {
          const nextIndex = (prev + 1) % thinkingPhrases.length;
          setMessages(msgs => {
            const last = msgs[msgs.length - 1];
            if (last.isThinking) {
              const current = Array.isArray(last.content) ? last.content : [last.content];
              return [...msgs.slice(0, -1), { ...last, content: [...current, thinkingPhrases[nextIndex]] }];
            }
            return msgs;
          });
          return nextIndex;
        });
      }, 2000);
    }
    return () => { if (thinkingInterval) clearInterval(thinkingInterval); };
  }, [isTyping]);

  const speak = (text: string, messageIndex: number) => {
    window.speechSynthesis.cancel();
    if (isSpeaking === messageIndex) { setIsSpeaking(null); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(null);
    setIsSpeaking(messageIndex);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => { return () => window.speechSynthesis.cancel(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { type: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const question = input;
    setInput('');
    setIsTyping(true);
    setCurrentThinkingIndex(0);

    // Add thinking message
    setMessages(prev => [...prev, {
      type: 'bot',
      content: [thinkingPhrases[0]],
      timestamp: new Date(),
      isThinking: true
    }]);

    try {
      const formData = new FormData();
      formData.append('input', question);

      const response = await axios.request({
        method: 'post',
        maxBodyLength: Infinity,
        url: `${SERVER_URL}/agent`,
        data: formData
      });

      setIsTyping(false);

      const outputText = response.data.output || response.data.response || response.data || "I couldn't get a response. Please try again.";
      const thoughtText = response.data.thought || '';

      // Show thought process if available
      if (thoughtText) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last.isThinking) {
            return [
              ...prev.slice(0, -1),
              {
                type: 'bot',
                content: [
                  "🤔 Analyzing Your Request:",
                  "───────────────",
                  thoughtText,
                  "───────────────",
                ],
                timestamp: new Date()
              }
            ];
          }
          return prev;
        });
      } else {
        // Remove thinking message
        setMessages(prev => prev[prev.length - 1].isThinking ? prev.slice(0, -1) : prev);
      }

      // Typing effect for the answer
      let displayedText = '';
      let charIndex = 0;

      setMessages(prev => [...prev, {
        type: 'bot', content: '', timestamp: new Date(), isTyping: true
      }]);

      const typingInterval = setInterval(() => {
        if (charIndex < outputText.length) {
          displayedText += outputText[charIndex];
          charIndex++;
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = {
              type: 'bot', content: displayedText, timestamp: new Date()
            };
            return newMsgs;
          });
        } else {
          clearInterval(typingInterval);
        }
      }, 20);

    } catch (error: any) {
      console.error(error);
      setIsTyping(false);
      const errMsg = error?.response?.data?.error || "Sorry, I encountered an error. Please check if the backend is running.";
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last.isThinking || last.isTyping) {
          return [...prev.slice(0, -1), { type: 'bot', content: errMsg, timestamp: new Date() }];
        }
        return [...prev, { type: 'bot', content: errMsg, timestamp: new Date() }];
      });
    }
  };

  const handlePromptClick = (prompt: string) => setInput(prompt);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      recognition.onstart  = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const t = Array.from(event.results).map((r: any) => r[0].transcript).join('');
        setTranscript(t);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend   = () => setIsListening(false);
      recognition.start();
      return recognition;
    }
  };

  const SpeechModal = () => {
    if (!isSpeechModalOpen) return null;
    return (
      <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
        <div style={{ background:'#0e1318',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:28,width:'100%',maxWidth:400,position:'relative' }}>
          <button onClick={() => { setIsSpeechModalOpen(false); setIsListening(false); setTranscript(''); }}
            style={{ position:'absolute',top:16,right:16,background:'transparent',border:'none',color:'#7a8fa3',cursor:'pointer' }}>
            <X size={18}/>
          </button>
          <div style={{ textAlign:'center' }}>
            <h3 style={{ fontSize:16,fontWeight:700,color:'#eef2f7',marginBottom:20,fontFamily:'Syne,sans-serif' }}>Voice Input</h3>
            <button
              onClick={() => isListening ? setIsListening(false) : startListening()}
              style={{ padding:16,borderRadius:'50%',background:isListening?'rgba(255,77,106,0.15)':'rgba(0,255,136,0.1)',border:`1px solid ${isListening?'rgba(255,77,106,0.3)':'rgba(0,255,136,0.25)'}`,color:isListening?'#ff4d6a':'#00ff88',cursor:'pointer',marginBottom:20 }}>
              {isListening ? <MicOff size={24}/> : <Mic size={24}/>}
            </button>
            <div style={{ minHeight:80,padding:14,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,color:'#7a8fa3',fontSize:13,marginBottom:16,fontFamily:'Syne,sans-serif' }}>
              {transcript || 'Start speaking…'}
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={() => { setInput(transcript); setIsSpeechModalOpen(false); setIsListening(false); setTranscript(''); }}
                style={{ flex:1,padding:'10px',background:'#00ff88',border:'none',borderRadius:10,color:'#000',fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer' }}>
                Use Text
              </button>
              <button onClick={() => setTranscript('')}
                style={{ flex:1,padding:'10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,color:'#7a8fa3',fontFamily:'Syne,sans-serif',fontSize:13,cursor:'pointer' }}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ height:'calc(100vh - 2rem)', padding:24, fontFamily:'Syne,sans-serif' }}>
      <div style={{ background:'#0e1318', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'18px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
          <div style={{ width:42,height:42,background:'rgba(0,255,136,0.1)',border:'1px solid rgba(0,255,136,0.25)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',color:'#00ff88' }}>
            <Bot size={20}/>
          </div>
          <div>
            <h2 style={{ fontSize:16,fontWeight:700,color:'#eef2f7',margin:0 }}>AI Financial Assistant</h2>
            <p style={{ fontSize:11,color:'#3d5166',margin:0,fontFamily:'DM Mono,monospace',letterSpacing:.5 }}>Ask me anything about your finances</p>
          </div>
          <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:6,padding:'4px 12px',background:'rgba(0,255,136,0.08)',border:'1px solid rgba(0,255,136,0.2)',borderRadius:20,fontFamily:'DM Mono,monospace',fontSize:10,color:'#00ff88' }}>
            <span style={{ width:6,height:6,borderRadius:'50%',background:'#00ff88',animation:'pulse 2s ease-in-out infinite' }}/>
            ONLINE
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1,overflowY:'auto',padding:24,display:'flex',flexDirection:'column',gap:16 }}>
          {messages.map((message, index) => (
            <motion.div key={index} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}
              style={{ display:'flex', justifyContent:message.type==='user'?'flex-end':'flex-start' }}>
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, maxWidth:'80%', flexDirection:message.type==='user'?'row-reverse':'row' }}>

                {/* Avatar */}
                <div style={{ width:32,height:32,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:message.type==='user'?'rgba(77,159,255,0.15)':'rgba(0,255,136,0.1)',border:`1px solid ${message.type==='user'?'rgba(77,159,255,0.25)':'rgba(0,255,136,0.25)'}`,color:message.type==='user'?'#4d9fff':'#00ff88' }}>
                  {message.type==='user' ? <User size={14}/> : <Bot size={14}/>}
                </div>

                {/* Bubble */}
                <div style={{ padding:'12px 16px', borderRadius:message.type==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px', background:message.type==='user'?'#4d9fff':'#131a21', border:message.type==='user'?'none':'1px solid rgba(255,255,255,0.07)', color:message.type==='user'?'#000':'#eef2f7', fontSize:13, lineHeight:1.6 }}>
                  <div style={{ whiteSpace:'pre-line' }}>
                    {Array.isArray(message.content) ? (
                      message.content.map((line, i) => (
                        <motion.div key={i} initial={message.isThinking?{opacity:0}:{opacity:1}} animate={{opacity:1}} transition={{duration:0.5}}
                          style={{ color: line.startsWith('🤔')?'#00ff88': line.startsWith('───')?'#3d5166': message.isThinking&&i===message.content.length-1?'#7a8fa3':'inherit', fontFamily: line.startsWith('───')?'DM Mono,monospace':'inherit', fontSize: line.startsWith('───')?10:13 }}>
                          {line}
                        </motion.div>
                      ))
                    ) : (
                      message.content
                    )}
                  </div>
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:6 }}>
                    <span style={{ fontSize:10,opacity:.5,fontFamily:'DM Mono,monospace' }}>
                      {message.timestamp.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                    </span>
                    {message.type==='bot' && !message.isThinking && (
                      <button onClick={() => speak(Array.isArray(message.content)?message.content.join('\n'):message.content as string, index)}
                        style={{ marginLeft:8,padding:4,background:'transparent',border:'none',color:isSpeaking===index?'#00ff88':'#3d5166',cursor:'pointer',borderRadius:'50%',display:'flex',alignItems:'center' }}>
                        {isSpeaking===index ? <VolumeX size={13}/> : <Volume2 size={13}/>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef}/>
        </div>

        {/* Input area */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          {/* Quick prompts */}
          <div style={{ display:'flex',flexWrap:'wrap',gap:8,marginBottom:14 }}>
            {defaultPrompts.map((prompt,index) => (
              <button key={index} onClick={() => handlePromptClick(prompt)}
                style={{ padding:'6px 14px',fontSize:12,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,color:'#7a8fa3',cursor:'pointer',fontFamily:'Syne,sans-serif',transition:'all .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='rgba(0,255,136,0.3)'; (e.currentTarget as HTMLButtonElement).style.color='#00ff88'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color='#7a8fa3'; }}>
                {prompt}
              </button>
            ))}
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} style={{ display:'flex',gap:10,alignItems:'center' }}>
            <input
              type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type your message…"
              style={{ flex:1,padding:'11px 16px',background:'#080c10',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,color:'#eef2f7',fontFamily:'Syne,sans-serif',fontSize:13,outline:'none',transition:'border-color .2s' }}
              onFocus={e  => e.currentTarget.style.borderColor='rgba(0,255,136,0.35)'}
              onBlur={e   => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}
            />
            <button type="button" onClick={() => setIsSpeechModalOpen(true)}
              style={{ padding:11,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,color:'#7a8fa3',cursor:'pointer',display:'flex',alignItems:'center' }}>
              <Mic size={16}/>
            </button>
            <button type="submit"
              style={{ padding:'11px 20px',background:'#00ff88',border:'none',borderRadius:12,color:'#000',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700 }}>
              <Send size={15}/>
            </button>
          </form>
        </div>
      </div>

      <SpeechModal/>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  );
};

export default Chatbot;
