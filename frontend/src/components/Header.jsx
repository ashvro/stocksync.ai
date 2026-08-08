import React, { useState } from 'react';
import {
  Home, Package, Receipt, TrendingUp,
  Clock, Bell, Search, Menu, X, Zap, LogOut, Bot
} from 'lucide-react';

const tabs = [
  { id: 'landing',   label: 'Home',      icon: Home },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'invoice',   label: 'POS',       icon: Receipt },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'history',   label: 'History',   icon: Clock },
  { id: 'alerts',    label: 'Alerts',    icon: Bell },
  { id: 'asbot',     label: 'ASbot',     icon: Bot },
];

export default function Header({ activeTab, setActiveTab, alertCount, searchQuery, setSearchQuery, onQuickInvoice, isAdmin, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleTabs = isAdmin ? tabs : tabs.filter(t => t.id === 'landing');

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1A1A1A',
      }}
    >
      {/* ── Ticker bar ── */}
      <div style={{
        background: '#FF4500', color: '#fff',
        fontSize: '0.6rem', fontFamily: "'Space Mono', monospace",
        letterSpacing: '0.1em', fontWeight: 700,
        padding: '5px 0', overflow: 'hidden',
      }}>
        <div className="marquee-wrap">
          <div className="marquee-track">
            {/* doubled for seamless loop */}
            {[1,2].map(k =>
              <span key={k} style={{ display:'flex', gap:'4rem', whiteSpace:'nowrap' }}>
                {['A.S FOOTWEAR', '★ NEW AUTUMN STOCK', '// STREET EDITION', '★ PREMIUM LEATHER', '// FRESH DROPS', '★ GOODYEAR WELTED', '// ORDER NOW', '★ EXCLUSIVE SIZES', '// LIMITED RUN'].map((t, i) => (
                  <span key={i}>{t}</span>
                ))}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main nav row ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height: 68 }}>

          {/* Logo */}
          <button
            onClick={() => setActiveTab('landing')}
            style={{ display:'flex', alignItems:'center', gap:12, background:'none', border:'none', cursor:'pointer', padding:0 }}
          >
            <div style={{
              width:40, height:40, borderRadius:4, overflow:'hidden',
              background:'#111', border:'1px solid #252525',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 20px -4px rgba(255,69,0,0.5)',
            }}>
              <img src="/aslogo.jpeg" alt="A.S Footwear logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{
                fontFamily:"'Barlow Condensed', sans-serif",
                fontSize: '1.5rem', fontWeight: 900, color:'#F0F0F0',
                letterSpacing:'-0.01em', lineHeight:1,
                textTransform:'uppercase',
              }}>
                A.S <span style={{ color:'#FF4500' }}>FOOTWEAR</span>
              </div>
              <div style={{
                fontFamily:"'Space Mono', monospace", fontSize:'0.55rem',
                color:'#555', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:2,
              }}>Premium · Store System</div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav style={{ display:'flex', alignItems:'center', gap:2 }} className="hidden-mobile">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    position:'relative', display:'flex', alignItems:'center', gap:6,
                    padding:'7px 14px', borderRadius:3, border:'none', cursor:'pointer',
                    fontFamily:"'Space Grotesk', sans-serif",
                    fontWeight: active ? 700 : 500,
                    fontSize:'0.75rem',
                    letterSpacing:'0.04em', textTransform:'uppercase',
                    background: active ? '#FF4500' : 'transparent',
                    color: active ? '#fff' : '#888',
                    transition:'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color='#F0F0F0'; e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color='#888'; e.currentTarget.style.background='transparent'; }}}
                >
                  <Icon style={{ width:14, height:14, flexShrink:0 }} />
                  {tab.label}
                  {tab.id === 'alerts' && alertCount > 0 && (
                    <span style={{
                      position:'absolute', top:4, right:4,
                      background: active ? '#fff' : '#e03d00',
                      color: active ? '#FF4500' : '#fff',
                      borderRadius:'50%', width:14, height:14,
                      fontSize:'0.5rem', fontWeight:700,
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }} className="animate-pulse-dot">
                      {alertCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Search (admin only) */}
            {isAdmin && (
              <div style={{ position:'relative' }} className="hidden-mobile">
                <Search style={{ width:14, height:14, position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#555' }} />
                <input
                  type="text"
                  placeholder="Search SKU, brand..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => { if (activeTab === 'landing') setActiveTab('inventory'); }}
                  style={{
                    paddingLeft:32, paddingRight:12, paddingTop:8, paddingBottom:8,
                    fontSize:'0.72rem', width:180, borderRadius:3,
                    background:'#111', border:'1px solid #252525', color:'#F0F0F0',
                    fontFamily:"'Space Grotesk', sans-serif",
                  }}
                />
              </div>
            )}
            {isAdmin && (
              <>
                <button
                  onClick={() => onQuickInvoice ? onQuickInvoice() : setActiveTab('invoice')}
                  className="btn-primary"
                  style={{ padding:'8px 16px' }}
                >
                  <Zap style={{ width:13, height:13 }} />
                  New Invoice
                </button>
                <button
                  onClick={onLogout}
                  className="btn-ghost"
                  style={{ padding:'8px 12px', display:'flex', alignItems:'center', gap:6 }}
                  title="Sign out"
                >
                  <LogOut style={{ width:13, height:13 }} />
                  <span className="hidden-mobile">Sign Out</span>
                </button>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display:'none', padding:8, background:'#111', border:'1px solid #252525',
                borderRadius:3, color:'#F0F0F0', cursor:'pointer',
              }}
              className="mobile-menu-btn"
            >
              {mobileOpen ? <X style={{width:18,height:18}} /> : <Menu style={{width:18,height:18}} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div style={{
          background:'#0D0D0D', borderTop:'1px solid #1A1A1A',
          padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8,
        }} className="animate-slideDown mobile-nav-drawer">
          {/* Mobile search (admin only) */}
          {isAdmin && (
            <div style={{ gridColumn:'1/-1', position:'relative', marginBottom:4 }}>
              <Search style={{ width:13, height:13, position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#555' }} />
              <input
                type="text" placeholder="Search inventory..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width:'100%', paddingLeft:30, paddingRight:12, paddingTop:8, paddingBottom:8, fontSize:'0.72rem', borderRadius:3, background:'#111', border:'1px solid #252525', color:'#F0F0F0', fontFamily:"'Space Grotesk', sans-serif" }}
              />
            </div>
          )}
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileOpen(false); }}
                style={{
                  display:'flex', alignItems:'center', gap:8, padding:'10px 12px',
                  borderRadius:3, border: active ? '1px solid #FF4500' : '1px solid #1A1A1A',
                  background: active ? 'rgba(255,69,0,0.12)' : '#111',
                  color: active ? '#FF6A35' : '#888', cursor:'pointer',
                  fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.72rem', fontWeight:600,
                  textTransform:'uppercase', letterSpacing:'0.06em',
                }}
              >
                <Icon style={{width:14,height:14}} />
                {tab.label}
                {tab.id === 'alerts' && alertCount > 0 && (
                  <span style={{marginLeft:'auto', background:'#e03d00', color:'#fff', borderRadius:10, padding:'1px 6px', fontSize:'0.55rem', fontWeight:700}}>{alertCount}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 640px) {
          .mobile-nav-drawer { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </header>
  );
}
