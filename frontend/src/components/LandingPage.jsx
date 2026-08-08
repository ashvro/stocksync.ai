import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight, Eye, X, Phone, Mail, MapPin, Clock, Send, Check, Zap
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────
   LANDING PAGE — Street Fashion Aesthetic
   ──────────────────────────────────────────────────────────── */
/* ── Ad-style crossfade reel ─────────────────────────────
   Plays clip 1 (man tightening his sneakers before running)
   then fades into clip 2 (runner in the city) and loops.
   Muted + no controls, so it runs like an ad background. */
const HERO_CLIPS = [
  { src: 'https://assets.mixkit.co/videos/15059/15059-720.mp4', label: 'TIE THE FIT' },
  { src: 'https://assets.mixkit.co/videos/608/608-720.mp4', label: 'RUN THE CITY' },
];

function HeroReel() {
  const [active, setActive] = useState(0);
  const videoRefs = [useRef(null), useRef(null)];

  useEffect(() => {
    videoRefs.forEach((ref, i) => {
      const v = ref.current;
      if (!v) return;
      if (i === active) v.play().catch(() => {});
      else { v.pause(); v.currentTime = 0; }
    });
  }, [active]);

  return (
    <>
      {HERO_CLIPS.map((clip, i) => (
        <video
          key={clip.src}
          ref={videoRefs[i]}
          src={clip.src}
          muted playsInline loop={false} preload="auto"
          onEnded={() => setActive(a => (a + 1) % HERO_CLIPS.length)}
          style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', display:'block', pointerEvents:'none',
            opacity: active === i ? 1 : 0,
            transition:'opacity 0.9s ease',
          }}
        />
      ))}
    </>
  );
}

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

  const handleInquiry = e => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => { setInquirySubmitted(false); setFormData({ name:'', email:'', message:'' }); }, 4000);
  };

  /* ── Shared style tokens ── */
  const S = {
    card: { background:'#111', border:'1px solid #1A1A1A', borderRadius:6 },
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
        display:'flex', flexDirection:'column',
        minHeight:'clamp(520px, 75vh, 780px)',
        marginBottom:24,
      }}>
        {/* BG diagonal stripe — subtle theme shading */}
        <div style={{
          position:'absolute', top:0, right:0, width:'45%', height:'100%',
          background:'linear-gradient(135deg, transparent 0%, rgba(255,69,0,0.04) 100%)',
          borderLeft:'1px solid #1A1A1A', pointerEvents:'none',
        }} />

        {/* Top half — full-bleed video, equal to text half */}
        <div style={{ position:'relative', zIndex:2, flex:0.96, minHeight:0 }}>
          <div style={{
            position:'absolute', inset:0, overflow:'hidden',
            borderTopLeftRadius:6, borderTopRightRadius:6,
            borderBottom:'1px solid #1A1A1A',
            background:'#0D0D0D',
            boxShadow:'0 30px 70px -35px rgba(255,69,0,0.35)',
          }}>
            <HeroReel />
            <div style={{
              position:'absolute', inset:0, pointerEvents:'none',
              background:'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.6) 100%)',
            }} />
            <div style={{ position:'absolute', left:14, bottom:12, display:'flex', alignItems:'center', gap:8 }}>
              <span className="tag tag-orange">RUN IN MOTION</span>
              <span className="tag tag-muted">A.S FOOTWEAR</span>
            </div>
          </div>
        </div>

        {/* Bottom half — headline, equal to video half */}
        <div style={{
          position:'relative', zIndex:2, flex:1.04,
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'clamp(24px,4vw,48px) clamp(20px,5vw,64px)',
          textAlign:'center',
        }}>
          <h1 style={{
            fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900,
            fontSize:'clamp(3rem,7.5vw,6.5rem)', textTransform:'uppercase',
            lineHeight:0.88, letterSpacing:'-0.01em', color:'#F0F0F0',
          }}>
            Crafted for<br />
            <span style={{ color:'#FF4500' }}>the Street.</span>
          </h1>
        </div>
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
          .pillars-grid  { grid-template-columns: 1fr 1fr !important; }
          .catalogue-grid{ grid-template-columns: 1fr 1fr !important; }
          .contact-grid  { grid-template-columns: 1fr !important; }
        }
        @media (max-width:600px) {
          .pillars-grid  { grid-template-columns: 1fr !important; }
          .catalogue-grid{ grid-template-columns: 1fr !important; }
          .specs-grid    { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
