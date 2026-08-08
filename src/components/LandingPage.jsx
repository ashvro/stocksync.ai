import React, { useState } from 'react';
import {
  ArrowRight, ShieldCheck, Truck, RefreshCw, Award,
  ChevronRight, Eye, X, Phone, Mail, MapPin, Clock, Send, Check, Zap
} from 'lucide-react';
import { STORE_INFO } from '../data/mockData';
import Shoe3D from './Shoe3D';

/* ────────────────────────────────────────────────────────────
   LANDING PAGE — Street Fashion Aesthetic
   ──────────────────────────────────────────────────────────── */
export default function LandingPage({ inventory, setActiveTab, onSelectShoeForInvoice, isAdmin }) {
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  // Landing catalogue: ALL inventory items, but featured shoes are pinned
  // to the top permanently. New (unfeatured) additions go to the bottom and
  // never displace the pinned shoes.
  const featuredShoes = [...inventory].sort((a, b) => {
    const af = a.featured ? 0 : 1;
    const bf = b.featured ? 0 : 1;
    if (af !== bf) return af - bf;
    return String(a.id || a.sku_id).localeCompare(String(b.id || b.sku_id));
  });

  // Hero is PERMANENT — a fixed showcase shoe that never changes, no matter
  // what is added to or removed from inventory. It only feeds the 3D model's
  // fallback image; the 3D shoe itself is always the same model.
  const HERO_SHOE = {
    name: 'Air Stealth Pro Runner',
    brand: 'A.S Apex',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
    description: 'Handcrafted with premium lightweight mesh upper and max-cushion responsive foam.',
  };

  const handleInquiry = e => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => { setInquirySubmitted(false); setFormData({ name:'', email:'', message:'' }); }, 4000);
  };

  /* ── Shared style tokens ── */
  const S = {
    card: { background:'#111', border:'1px solid #1A1A1A', borderRadius:6 },
    cardHover: { transition:'border-color 0.2s, transform 0.2s, box-shadow 0.2s' },
    label: { fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#FF6A35' },
    sectionTitle: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'clamp(1.8rem,4vw,3rem)', textTransform:'uppercase', lineHeight:0.92, color:'#F0F0F0' },
    muted: { color:'#666', fontSize:'0.8rem' },
  };

  return (
    <div style={{ paddingTop:32, paddingBottom:80 }}>

      {/* ════ HERO ════ */}
      <section style={{
        ...S.card,
        position:'relative', overflow:'hidden',
        padding:'clamp(28px,5vw,64px)',
        marginBottom:24,
      }}>
        {/* BG diagonal stripe */}
        <div style={{
          position:'absolute', top:0, right:0, width:'45%', height:'100%',
          background:'linear-gradient(135deg, transparent 0%, rgba(255,69,0,0.04) 100%)',
          borderLeft:'1px solid #1A1A1A', pointerEvents:'none',
        }} />
        {/* Big background text */}
        <div style={{
          position:'absolute', bottom: -10, left:16,
          fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900,
          fontSize:'clamp(5rem,12vw,10rem)', textTransform:'uppercase',
          color:'transparent', WebkitTextStroke:'1px rgba(255,255,255,0.04)',
          lineHeight:1, userSelect:'none', pointerEvents:'none',
          letterSpacing:'-0.02em',
        }}>FOOTWEAR</div>

        <div style={{ display:'grid', gridTemplateColumns:'1.05fr 0.95fr', gap:40, position:'relative', zIndex:2, alignItems:'center' }}
          className="hero-grid">
          {/* Left */}
          <div style={{ maxWidth:560 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
              <span className="tag tag-orange">A.S FOOTWEAR</span>
              <span className="tag tag-muted">SS 2025 COLLECTION</span>
            </div>

            <h1 style={{
              fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900,
              fontSize:'clamp(3rem,8vw,6.5rem)', textTransform:'uppercase',
              lineHeight:0.88, letterSpacing:'-0.01em', color:'#F0F0F0',
              marginBottom:20,
            }}>
              Crafted for<br />
              <span style={{ color:'#FF4500' }}>the Street.</span>
            </h1>

            <p style={{ color:'#666', fontSize:'0.875rem', lineHeight:1.7, maxWidth:420, marginBottom:28 }}>
              Heritage leather artistry meets precision street performance. Discover our curated catalogue and issue POS invoices directly.
            </p>

            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:36 }}>
              <button className="btn-primary" onClick={isAdmin ? () => setActiveTab('inventory') : () => document.getElementById('catalogue')?.scrollIntoView({ behavior:'smooth' })}>
                Browse Inventory
                <ArrowRight style={{width:14,height:14}} />
              </button>
              {isAdmin && (
                <button className="btn-ghost" onClick={() => setActiveTab('invoice')}>
                  Issue POS Invoice
                </button>
              )}
            </div>

            {/* Metrics */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, borderTop:'1px solid #1A1A1A', paddingTop:24, maxWidth:380 }}>
              {[
                { val:'1,500+', label:'Pairs Delivered' },
                { val:'100%', label:'Genuine Leather' },
                { val:'4.9 ★', label:'Store Rating', accent:true },
              ].map(m => (
                <div key={m.label}>
                  <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.8rem', color: m.accent ? '#FF4500' : '#F0F0F0', lineHeight:1 }}>{m.val}</p>
                  <p style={{ fontSize:'0.65rem', color:'#555', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:4 }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — 3D animated shoe stage */}
          <div className="shoe-stage" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div className="shoe-glow" />
            <div className="shoe-halo" />
            <div className="shoe-3d">
              <Shoe3D fallbackImage={HERO_SHOE.image} fallbackAlt={HERO_SHOE.name} />
            </div>
            <span className="shoe-spark shoe-spark-1" />
            <span className="shoe-spark shoe-spark-2" />
            <span className="shoe-spark shoe-spark-3" />
            <span className="shoe-spark shoe-spark-4" />
            <span className="shoe-spark shoe-spark-5" />
          </div>
        </div>
      </section>


      {/* ════ BRAND PILLARS ════ */}
      <section style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:24 }} className="pillars-grid">
        {[
          { icon: ShieldCheck, title:'Authentic Guarantee', desc:'Handpicked premium full-grain leathers and genuine brand footwear.' },
          { icon: Truck,       title:'Nationwide Express',  desc:'Rapid nationwide dispatch with end-to-end order tracking.' },
          { icon: RefreshCw,   title:'30-Day Fit Guarantee',desc:'Hassle-free size replacement and complimentary in-store trials.' },
          { icon: Award,       title:'Goodyear Welted',     desc:'Built with re-soleable craftsmanship for multi-year durability.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} style={{ ...S.card, padding:20 }} className="card-hover">
            <div style={{
              width:36, height:36, borderRadius:4,
              background:'rgba(255,69,0,0.1)', border:'1px solid rgba(255,69,0,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14,
            }}>
              <Icon style={{ width:17, height:17, color:'#FF4500' }} />
            </div>
            <h4 style={{ fontFamily:"'Space Grotesk', sans-serif", fontWeight:700, fontSize:'0.82rem', color:'#F0F0F0', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.03em' }}>{title}</h4>
            <p style={{ color:'#555', fontSize:'0.75rem', lineHeight:1.55 }}>{desc}</p>
          </div>
        ))}
      </section>


      {/* ════ CATALOGUE ════ */}
      <section id="catalogue" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', borderBottom:'1px solid #1A1A1A', paddingBottom:16, marginBottom:24 }}>
          <div>
            <span style={S.label}>// CATALOGUE SELECTION</span>
            <h2 style={{ ...S.sectionTitle, marginTop:8, fontSize:'2.5rem' }}>Full Collection</h2>
          </div>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('inventory')}
              style={{ display:'flex', alignItems:'center', gap:6, color:'#555', fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', background:'none', border:'none', cursor:'pointer', transition:'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color='#F0F0F0'}
              onMouseLeave={e => e.currentTarget.style.color='#555'}
            >
              Manage Stock <ChevronRight style={{width:14,height:14}} />
            </button>
          )}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }} className="catalogue-grid">
          {featuredShoes.map(shoe => (
            <div key={shoe.id || shoe.sku_id}
              style={{ ...S.card, display:'flex', flexDirection:'column' }}
              className="card-hover"
            >
              {/* Image */}
              <div style={{ background:'#0D0D0D', padding:20, position:'relative', borderRadius:'6px 6px 0 0' }}>
                <img src={shoe.image} alt={shoe.name} style={{ width:'100%', height:180, objectFit:'contain' }} />
                <span className="tag tag-muted" style={{ position:'absolute', top:10, left:10 }}>
                  {shoe.sku_id || shoe.id}
                </span>
                <span className="tag tag-orange" style={{ position:'absolute', top:10, right:10 }}>
                  {shoe.category}
                </span>
              </div>
              {/* Info */}
              <div style={{ padding:'16px 18px', flex:1, display:'flex', flexDirection:'column' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <span style={{ color:'#555', fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{shoe.brand}</span>
                </div>
                <h3 style={{ fontWeight:700, color:'#F0F0F0', fontSize:'0.95rem', marginBottom:12, flex:1 }}>{shoe.name}</h3>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid #1A1A1A', paddingTop:12 }}>
                  <div>
                    <span style={{ display:'block', color:'#444', fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>Retail</span>
                    <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.4rem', color:'#F0F0F0' }}>₹{shoe.price.toFixed(2)}</span>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      onClick={() => setSelectedShoe(shoe)}
                      style={{ padding:8, background:'#1A1A1A', border:'1px solid #252525', borderRadius:3, color:'#888', cursor:'pointer', transition:'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color='#F0F0F0'}
                      onMouseLeave={e => e.currentTarget.style.color='#888'}
                    >
                      <Eye style={{width:14,height:14}} />
                    </button>
                    {isAdmin && (
                      <button className="btn-primary btn-sm" onClick={() => onSelectShoeForInvoice(shoe)}>
                        Bill
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ════ MATERIAL SPECS ════ */}
      <section style={{ ...S.card, padding:'clamp(24px,4vw,48px)', marginBottom:24 }}>
        <div style={{ borderBottom:'1px solid #1A1A1A', paddingBottom:16, marginBottom:24 }}>
          <span style={S.label}>// QUALITY BENCHMARK</span>
          <h2 style={{ ...S.sectionTitle, marginTop:8, fontSize:'2rem' }}>Footwear Specifications</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }} className="specs-grid">
          {[
            { title:'Full-Grain Italian Leather', desc:'Grade-A vegetable-tanned leather from Tuscan tanneries, developing a rich patina over time.' },
            { title:'Air-Foam Cushioning', desc:'Multi-density EVA midsoles engineered to absorb foot strike pressure for long daily wear.' },
            { title:'Goodyear Welt Construction', desc:'Precision lock-stitch perimeter welt binding upper to sole for maximum moisture resistance.' },
          ].map(s => (
            <div key={s.title} style={{ background:'#0D0D0D', border:'1px solid #1A1A1A', borderRadius:4, padding:20 }}>
              <div style={{ width:8, height:8, borderRadius:0, background:'#FF4500', marginBottom:12 }} />
              <h4 style={{ fontWeight:700, color:'#F0F0F0', fontSize:'0.82rem', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>{s.title}</h4>
              <p style={{ color:'#555', fontSize:'0.75rem', lineHeight:1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ════ CONTACT & INQUIRY ════ */}
      <section style={{ ...S.card, padding:'clamp(24px,4vw,48px)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:40, alignItems:'start' }} className="contact-grid">
          {/* Info */}
          <div>
            <span style={S.label}>// GET IN TOUCH</span>
            <h2 style={{ ...S.sectionTitle, fontSize:'2rem', marginTop:8, marginBottom:12 }}>Store Hub</h2>
            <p style={{ color:'#555', fontSize:'0.8rem', lineHeight:1.65, marginBottom:24 }}>
              Visit our flagship store or send an inquiry regarding bulk orders, custom fitting sessions, or wholesale queries.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { icon: MapPin, text:'Anjanapura Main Rd, Beershwar Nagar, New Bank Colony, Konankunte, Bengaluru 560062' },
                { icon: Phone, text:'+91 9845088426' },
                { icon: Mail,  text:'asfootwear655@gmail.com' },
                { icon: Clock, text:'Mon–Sat: 9:30 AM – 9:00 PM (EST)' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <Icon style={{ width:14, height:14, color:'#FF4500', flexShrink:0, marginTop:2 }} />
                  <span style={{ color:'#888', fontSize:'0.78rem', lineHeight:1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ background:'#0D0D0D', border:'1px solid #1A1A1A', borderRadius:6, padding:28 }}>
            <h3 style={{ fontWeight:700, color:'#F0F0F0', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:20 }}>Send Store Inquiry</h3>

            {inquirySubmitted ? (
              <div style={{ padding:16, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:4, color:'#4ade80', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:8 }}>
                <Check style={{width:14,height:14}} />
                Thank you! Your inquiry has been sent to A.S Footwear management.
              </div>
            ) : (
              <form onSubmit={handleInquiry} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { key:'name', label:'Your Name', type:'text', ph:'e.g. John Doe' },
                    { key:'email', label:'Email', type:'email', ph:'john@example.com' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display:'block', color:'#555', fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>{f.label}</label>
                      <input
                        type={f.type} required placeholder={f.ph}
                        value={formData[f.key]}
                        onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                        style={{ width:'100%', padding:'9px 12px', fontSize:'0.78rem', borderRadius:3, background:'#111', border:'1px solid #252525', color:'#F0F0F0', fontFamily:"'Space Grotesk', sans-serif" }}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ display:'block', color:'#555', fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Message</label>
                  <textarea
                    rows={3} required
                    placeholder="Details about size availability, wholesale, or store visit..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    style={{ width:'100%', padding:'9px 12px', fontSize:'0.78rem', borderRadius:3, background:'#111', border:'1px solid #252525', color:'#F0F0F0', fontFamily:"'Space Grotesk', sans-serif", resize:'vertical' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf:'flex-start' }}>
                  <Send style={{width:12,height:12}} /> Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </section>


      {/* ════ DETAIL MODAL ════ */}
      {selectedShoe && (
        <div
          style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(5,5,5,0.88)', backdropFilter:'blur(12px)' }}
          className="animate-fadeIn"
          onClick={() => setSelectedShoe(null)}
        >
          <div
            style={{ background:'#111', border:'1px solid #252525', borderRadius:6, maxWidth:440, width:'100%', padding:28, position:'relative' }}
            className="animate-popIn"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedShoe(null)}
              style={{ position:'absolute', top:16, right:16, background:'#1A1A1A', border:'1px solid #252525', borderRadius:3, padding:6, color:'#888', cursor:'pointer' }}
            >
              <X style={{width:14,height:14}} />
            </button>

            <div style={{ background:'#0D0D0D', borderRadius:4, padding:24, marginBottom:20, display:'flex', justifyContent:'center' }}>
              <img src={selectedShoe.image} alt={selectedShoe.name} style={{ width:'100%', height:220, objectFit:'contain' }} />
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <span className="tag tag-orange">{selectedShoe.brand}</span>
                <span className="tag tag-muted">{selectedShoe.category}</span>
              </div>
              <h3 style={{ fontWeight:700, color:'#F0F0F0', fontSize:'1.15rem', marginBottom:6 }}>{selectedShoe.name}</h3>
              <p style={{ color:'#555', fontSize:'0.78rem', lineHeight:1.6 }}>{selectedShoe.description}</p>
            </div>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid #1A1A1A', paddingTop:16 }}>
              <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'2rem', color:'#F0F0F0' }}>₹{selectedShoe.price.toFixed(2)}</span>
              {isAdmin && (
                <button className="btn-primary" onClick={() => { onSelectShoeForInvoice(selectedShoe); setSelectedShoe(null); }}>
                  <Zap style={{width:13,height:13}} /> POS Billing
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Responsive grid overrides ── */}
      <style>{`
        @media (max-width:900px) {
          .hero-grid     { grid-template-columns: 1fr !important; }
          .hero-card     { max-width: 100% !important; }
          .shoe-stage    { min-height: 320px; }
          .pillars-grid  { grid-template-columns: 1fr 1fr !important; }
          .catalogue-grid{ grid-template-columns: 1fr 1fr !important; }
          .contact-grid  { grid-template-columns: 1fr !important; }
        }
        @media (max-width:600px) {
          .shoe-stage    { min-height: 260px; }
          .pillars-grid  { grid-template-columns: 1fr !important; }
          .catalogue-grid{ grid-template-columns: 1fr !important; }
          .specs-grid    { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
