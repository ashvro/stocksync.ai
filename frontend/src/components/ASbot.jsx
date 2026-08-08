import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Sparkles, RotateCcw, Zap, Circle, X
} from 'lucide-react';
import { sendChatMessage } from '../services/chat';

const S = {
  label: { fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#FF6A35' },
  card: { background:'#111', border:'1px solid #1A1A1A', borderRadius:6 },
};

export default function ASbot({ inventory, orderHistory }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Yo, I'm ASbot 🤖 — your AI stock assistant for A.S Footwear. Ask me anything about inventory, stock levels, prices, or restocking." },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState(null);
  const [hasError, setHasError] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput('');
    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setBusy(true);
    setHasError(false);
    try {
      const res = await sendChatMessage(next, inventory, orderHistory);
      setSource(res.source);
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (e) {
      setHasError(true);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Try again in a moment.' }]);
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    setMessages([
      { role: 'assistant', content: "Chat cleared. Fire away — stock, prices, restock plans — I've got you. 👟" },
    ]);
    setSource(null);
    setHasError(false);
  };

  return (
    <div style={{ paddingTop:32, paddingBottom:80 }}>
      {/* Header */}
      <div style={{ ...S.card, overflow:'hidden' }}>
        <div style={{
          padding:'24px 28px',
          display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16,
          background:'linear-gradient(120deg, #0D0D0D 0%, #14100E 100%)',
          borderBottom:'1px solid #1A1A1A',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{
              width:46, height:46, borderRadius:4, flexShrink:0,
              background:'rgba(255,69,0,0.12)', border:'1px solid rgba(255,69,0,0.25)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 20px -6px rgba(255,69,0,0.5)',
            }}>
              <Bot style={{ width:24, height:24, color:'#FF4500' }} />
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <h2 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.8rem', textTransform:'uppercase', color:'#F0F0F0', lineHeight:1 }}>
                  A.S<span style={{ color:'#FF4500' }}>bot</span>
                </h2>
                <span className="tag tag-orange"><Sparkles style={{ width:10, height:10 }} /> AI</span>
              </div>
              <p style={{ ...S.label, marginTop:6 }}>
                Stock · Invoices · Analytics · {inventory.length} SKUs loaded
              </p>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span
              className="tag"
              style={{
                background: source === 'local' ? 'rgba(255,200,0,0.1)' : 'rgba(34,197,94,0.1)',
                border: `1px solid ${source === 'local' ? 'rgba(255,200,0,0.25)' : 'rgba(34,197,94,0.25)'}`,
                color: source === 'local' ? '#fbbf24' : '#4ade80',
                display:'flex', alignItems:'center', gap:6,
              }}
            >
              <Circle style={{ width:8, height:8, fill:'currentColor' }} />
              {source === 'local' ? 'OFFLINE MODE' : 'GROQ ONLINE'}
            </span>
            <button className="btn-ghost" style={{ padding:'8px 12px', display:'flex', alignItems:'center', gap:6 }} onClick={clear}>
              <RotateCcw style={{ width:13, height:13 }} /> Clear
            </button>
          </div>
        </div>

        {/* Chat body */}
        <div style={{ background:'#0A0A0A', padding:'24px 28px', minHeight: 460, display:'flex', flexDirection:'column' }}>
          <div ref={scrollRef} style={{ flex:1, display:'flex', flexDirection:'column', gap:14, maxHeight:520, overflowY:'auto', paddingRight:8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap:10 }}>
                {m.role === 'assistant' && (
                  <div style={{ width:30, height:30, borderRadius:3, flexShrink:0, background:'rgba(255,69,0,0.12)', border:'1px solid rgba(255,69,0,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Bot style={{ width:15, height:15, color:'#FF4500' }} />
                  </div>
                )}
                <div
                  style={{
                    maxWidth:'min(70%, 560px)',
                    padding:'11px 15px',
                    borderRadius: m.role === 'user' ? '6px 6px 2px 6px' : '6px 6px 6px 2px',
                    background: m.role === 'user' ? '#FF4500' : '#111',
                    border: m.role === 'user' ? '1px solid #FF4500' : '1px solid #1A1A1A',
                    color: m.role === 'user' ? '#fff' : '#DDD',
                    fontSize:'0.8rem', lineHeight:1.65,
                    whiteSpace:'pre-wrap', wordBreak:'break-word',
                    fontFamily:"'Space Grotesk', sans-serif",
                    boxShadow: m.role === 'user' ? '0 4px 20px -8px rgba(255,69,0,0.5)' : 'none',
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {busy && (
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:30, height:30, borderRadius:3, background:'rgba(255,69,0,0.12)', border:'1px solid rgba(255,69,0,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Bot style={{ width:15, height:15, color:'#FF4500' }} />
                </div>
                <div style={{ display:'flex', gap:4, padding:'12px 15px', background:'#111', border:'1px solid #1A1A1A', borderRadius:'6px 6px 6px 2px' }}>
                  {[0,1,2].map(i => (
                    <span key={i} className="typing-dot" style={{ width:6, height:6, borderRadius:'50%', background:'#FF6A35' }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ position:'relative', flex:1 }}>
              <Zap style={{ width:14, height:14, position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#FF4500' }} />
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send(); }}
                placeholder="Ask about stock, prices, SKUs, restocking..."
                disabled={busy}
                style={{
                  width:'100%', padding:'11px 44px 11px 36px', fontSize:'0.8rem', borderRadius:3,
                  background:'#111', border:'1px solid #252525', color:'#F0F0F0',
                  fontFamily:"'Space Grotesk', sans-serif",
                }}
              />
            </div>
            <button
              onClick={() => send()}
              disabled={busy || !input.trim()}
              className="btn-primary"
              style={{ padding:'0 20px', display:'flex', alignItems:'center', gap:8, opacity: busy || !input.trim() ? 0.5 : 1 }}
            >
              <Send style={{ width:14, height:14 }} /> Send
            </button>
          </div>

          {hasError && (
            <p style={{ color:'#e03d00', fontSize:'0.7rem', marginTop:10 }}>
              <X style={{ width:11, height:11, verticalAlign:'-2' }} /> Couldn't reach the Groq brain — check the backend server and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
