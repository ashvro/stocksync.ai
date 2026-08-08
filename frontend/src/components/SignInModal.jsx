import React, { useState } from 'react';
import { X, Lock, User, LogIn, ShieldCheck } from 'lucide-react';
import { loginAdmin } from '../services/auth';

const S = {
  input: { width:'100%', padding:'10px 12px 10px 34px', fontSize:'0.8rem', borderRadius:3, background:'#0D0D0D', border:'1px solid #252525', color:'#F0F0F0', fontFamily:"'Space Grotesk', sans-serif" },
  label: { display:'block', color:'#555', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 },
};

export default function SignInModal({ open, onClose, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (await loginAdmin(username.trim(), password)) {
      setUsername('');
      setPassword('');
      onLogin();
      onClose();
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(5,5,5,0.92)', backdropFilter:'blur(12px)' }}
      className="animate-fadeIn"
      onClick={onClose}
    >
      <div
        style={{ background:'#111', border:'1px solid #252525', borderRadius:6, maxWidth:380, width:'100%', padding:28, position:'relative' }}
        className="animate-popIn"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position:'absolute', top:16, right:16, background:'#1A1A1A', border:'1px solid #252525', borderRadius:3, padding:6, color:'#888', cursor:'pointer' }}
        >
          <X style={{ width:14, height:14 }} />
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <div style={{ width:40, height:40, borderRadius:4, background:'rgba(255,69,0,0.1)', border:'1px solid rgba(255,69,0,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ShieldCheck style={{ width:20, height:20, color:'#FF4500' }} />
          </div>
          <div>
            <h3 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.5rem', textTransform:'uppercase', color:'#F0F0F0', lineHeight:1 }}>Admin Access</h3>
            <p style={{ color:'#444', fontSize:'0.65rem', letterSpacing:'0.06em', textTransform:'uppercase' }}>Store management portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14, marginTop:18 }}>
          <div>
            <label style={S.label}>Username</label>
            <div style={{ position:'relative' }}>
              <User style={{ width:13, height:13, position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#444' }} />
              <input
                type="text" autoFocus required
                value={username} onChange={e => { setUsername(e.target.value); setError(''); }}
                style={S.input}
              />
            </div>
          </div>
          <div>
            <label style={S.label}>Password</label>
            <div style={{ position:'relative' }}>
              <Lock style={{ width:13, height:13, position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#444' }} />
              <input
                type="password" required
                value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                style={S.input}
              />
            </div>
          </div>

          {error && (
            <p style={{ padding:'10px 12px', fontSize:'0.72rem', borderRadius:3, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171' }}>{error}</p>
          )}

          <button type="submit" className="btn-primary" style={{ justifyContent:'center', padding:'11px 16px' }}>
            <LogIn style={{ width:14, height:14 }} /> Sign In
          </button>

          <p style={{ fontSize:'0.65rem', color:'#444', textAlign:'center', marginTop:2 }}>
            Authorized personnel only. All changes sync to the store database.
          </p>
        </form>
      </div>
    </div>
  );
}
