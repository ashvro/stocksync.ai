import React from 'react';
import {
  MapPin, Phone, Mail, Clock,
  Instagram, Facebook, Twitter, ShieldCheck, Lock, LogIn
} from 'lucide-react';
import { STORE_INFO } from '../data/mockData';

const S = {
  label: { fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#FF6A35' },
};

export default function Footer({ setActiveTab, isAdmin, onOpenSignIn }) {
  return (
    <footer style={{ background:'#0D0D0D', borderTop:'1px solid #1A1A1A', color:'#666' }}>

      {/* Main footer body */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'48px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr', gap:40 }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <div style={{ width:36, height:36, borderRadius:3, overflow:'hidden', background:'#111', border:'1px solid #252525', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <img src="/aslogo.jpeg" alt="A.S Footwear logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.4rem', textTransform:'uppercase', color:'#F0F0F0', letterSpacing:'-0.01em' }}>
                A.S <span style={{ color:'#FF4500' }}>FOOTWEAR</span>
              </span>
            </div>
            <p style={{ fontSize:'0.75rem', lineHeight:1.7, maxWidth:220, marginBottom:20 }}>
              Crafting premium steps and state-of-the-art POS management for sneakers, formal leather, athletics, and luxury boots.
            </p>
            <div style={{ display:'flex', gap:8 }}>
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" style={{ width:34, height:34, borderRadius:3, background:'#111', border:'1px solid #1A1A1A', display:'flex', alignItems:'center', justifyContent:'center', color:'#555', transition:'color 0.15s, border-color 0.15s', textDecoration:'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color='#FF4500'; e.currentTarget.style.borderColor='rgba(255,69,0,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color='#555'; e.currentTarget.style.borderColor='#1A1A1A'; }}
                >
                  <Icon style={{ width:14, height:14 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ ...S.label, color:'#FF4500', marginBottom:16, paddingBottom:8, borderBottom:'1px solid #1A1A1A' }}>Contact</h3>
            <ul style={{ listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { Icon:MapPin, text: STORE_INFO.address },
                { Icon:Phone,  text: STORE_INFO.phone },
                { Icon:Mail,   text: STORE_INFO.email },
                { Icon:Clock,  text: STORE_INFO.hours?.weekdays || 'Mon–Sat: 9:30AM–9PM' },
              ].map(({ Icon, text }) => (
                <li key={text} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <Icon style={{ width:13, height:13, color:'#FF4500', flexShrink:0, marginTop:2 }} />
                  <span style={{ fontSize:'0.73rem', lineHeight:1.5 }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Modules */}
          <div>
            <h3 style={{ ...S.label, color:'#FF4500', marginBottom:16, paddingBottom:8, borderBottom:'1px solid #1A1A1A' }}>System</h3>
            <ul style={{ listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:10 }}>
              {[
                ['landing',   'Home Showcase'],
                ['inventory', 'Inventory'],
                ['invoice',   'POS Billing'],
                ['analytics', 'Analytics'],
                ['history',   'Order History'],
                ['alerts',    'Restock Alerts'],
                ['asbot',     'AI Assistant'],
              ].map(([id, label]) => (
                <li key={id}>
                  <button
                    onClick={isAdmin ? () => setActiveTab(id) : undefined}
                    style={{ color:'#555', fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.73rem', background:'none', border:'none', cursor: isAdmin ? 'pointer' : 'default', padding:0, transition:'color 0.15s', display:'flex', alignItems:'center', gap:6 }}
                    onMouseEnter={e => { if (isAdmin) e.currentTarget.style.color='#F0F0F0'; }}
                    onMouseLeave={e => { if (isAdmin) e.currentTarget.style.color='#555'; }}
                  >
                    <span style={{ color:'#FF4500', fontWeight:700 }}>›</span> {label}
                    {!isAdmin && <Lock style={{ width:10, height:10, color:'#333' }} />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ marginTop:48, paddingTop:20, borderTop:'1px solid #1A1A1A', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <p style={{ fontSize:'0.7rem', color:'#333' }}>© {new Date().getFullYear()} A.S Footwear Store & Management System. All rights reserved.</p>
          <div style={{ display:'flex', gap:20, alignItems:'center' }}>
            {isAdmin ? (
              <span style={{ fontSize:'0.7rem', color:'#FF6A35', display:'flex', alignItems:'center', gap:6 }}>
                <ShieldCheck style={{ width:12, height:12 }} /> Admin signed in
              </span>
            ) : (
              <button
                onClick={onOpenSignIn}
                style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', fontSize:'0.7rem', color:'#555', padding:0, transition:'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color='#FF4500'}
                onMouseLeave={e => e.currentTarget.style.color='#555'}
              >
                <LogIn style={{ width:11, height:11 }} /> Staff Login
              </button>
            )}
            {['Privacy Policy', 'Terms of Service', 'Store Location'].map(l => (
              <span key={l} style={{ fontSize:'0.7rem', color:'#333', cursor:'pointer', transition:'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color='#888'}
                onMouseLeave={e => e.currentTarget.style.color='#333'}
              >{l}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-props-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
