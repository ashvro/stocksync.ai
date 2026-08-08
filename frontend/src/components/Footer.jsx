import React from 'react';
import {
  Footprints, MapPin, Phone, Mail, Clock,
  Instagram, Facebook, Twitter, ShieldCheck, Truck, RotateCcw, Send, Lock, LogIn
} from 'lucide-react';
import { STORE_INFO } from '../data/mockData';

const S = {
  label: { fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#FF6A35' },
};

export default function Footer({ setActiveTab, isAdmin, onOpenSignIn }) {
  return (
    <footer style={{ background:'#0D0D0D', borderTop:'1px solid #1A1A1A', color:'#666' }}>

      {/* Top value props */}
      <div style={{ borderBottom:'1px solid #1A1A1A', padding:'32px 0' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }} className="footer-props-grid">
          {[
            { icon:ShieldCheck, label:'100% Authentic',         desc:'Handpicked premium leather & genuine footwear brands.', accent:'#FF4500' },
            { icon:Truck,       label:'Express Nationwide',     desc:'Fast delivery with real-time package tracking.',        accent:'#FF4500' },
            { icon:RotateCcw,   label:'30-Day Exchange',        desc:'Hassle-free size replacement & trial in-store.',        accent:'#FF4500' },
          ].map(({ icon:Icon, label, desc, accent }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:16, background:'#111', border:'1px solid #1A1A1A', borderRadius:6, padding:18 }}>
              <div style={{ width:40, height:40, borderRadius:4, background:'rgba(255,69,0,0.1)', border:'1px solid rgba(255,69,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon style={{ width:18, height:18, color:accent }} />
              </div>
              <div>
                <h4 style={{ color:'#F0F0F0', fontWeight:700, fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:3 }}>{label}</h4>
                <p style={{ fontSize:'0.72rem', lineHeight:1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer body */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'48px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr', gap:40 }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <div style={{ width:36, height:36, borderRadius:3, background:'#FF4500', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Footprints style={{ width:19, height:19, color:'#fff', transform:'rotate(-12deg)' }} />
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

          {/* Newsletter */}
          <div>
            <h3 style={{ ...S.label, color:'#FF4500', marginBottom:16, paddingBottom:8, borderBottom:'1px solid #1A1A1A' }}>Stay Updated</h3>
            <p style={{ fontSize:'0.73rem', lineHeight:1.6, marginBottom:14 }}>
              Subscribe for limited drops, seasonal clearouts, and store news.
            </p>
            <form onSubmit={e => { e.preventDefault(); alert('Subscribed!'); }} style={{ position:'relative' }}>
              <input
                type="email" required placeholder="your@email.com"
                style={{ width:'100%', padding:'9px 44px 9px 12px', fontSize:'0.73rem', borderRadius:3, background:'#111', border:'1px solid #252525', color:'#F0F0F0', fontFamily:"'Space Grotesk', sans-serif" }}
              />
              <button
                type="submit"
                style={{ position:'absolute', right:4, top:'50%', transform:'translateY(-50%)', background:'#FF4500', border:'none', borderRadius:2, padding:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
              >
                <Send style={{ width:13, height:13, color:'#fff' }} />
              </button>
            </form>
            <p style={{ fontSize:'0.62rem', marginTop:8, color:'#444' }}>We respect your privacy. Unsubscribe anytime.</p>
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
