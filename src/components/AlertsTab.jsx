import React, { useState } from 'react';
import { Bell, RefreshCw, CheckCircle, ArrowRight, X } from 'lucide-react';

const S = {
  label: { fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#FF6A35' },
};

export default function AlertsTab({ inventory, onRestockShoe, setActiveTab }) {
  const [filter, setFilter] = useState('All');
  const [restockShoe, setRestockShoe] = useState(null);
  const [restockQty, setRestockQty] = useState(25);

  const outOfStock = inventory.filter(i => i.stock === 0);
  const lowStock   = inventory.filter(i => i.stock > 0 && i.stock <= i.minStock);
  const total = outOfStock.length + lowStock.length;

  const handleRestock = e => {
    e.preventDefault();
    if (!restockShoe) return;
    onRestockShoe(restockShoe.id || restockShoe.sku_id, parseInt(restockQty, 10));
    setRestockShoe(null); setRestockQty(25);
  };

  const filterBtns = [
    { id:'All',     label:`All (${total})`,         bg:'#FF4500', color:'#fff' },
    { id:'Urgent',  label:`Out of Stock (${outOfStock.length})`, bg:'#ef4444', color:'#fff' },
    { id:'Warning', label:`Low Stock (${lowStock.length})`, bg:'#f59e0b', color:'#0A0A0A' },
  ];

  const AlertCard = ({ shoe, isUrgent }) => (
    <div style={{
      background:'#111',
      border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
      borderRadius:6, padding:20, display:'flex', flexDirection:'column', gap:16,
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
        <img src={shoe.image} alt={shoe.name} style={{ width:56, height:56, objectFit:'contain', background:'#0D0D0D', padding:6, borderRadius:4, flexShrink:0 }} />
        <div>
          <span className="tag" style={isUrgent
            ? { background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.25)' }
            : { background:'rgba(245,158,11,0.1)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.25)' }
          }>
            {isUrgent ? '🔴 CRITICAL — OUT OF STOCK' : '⚠ WARNING — LOW STOCK'}
          </span>
          <h4 style={{ fontWeight:700, color:'#F0F0F0', fontSize:'0.95rem', marginTop:6, marginBottom:2 }}>{shoe.name}</h4>
          <p style={{ color:'#555', fontSize:'0.72rem' }}>{shoe.brand} · {shoe.category} · {shoe.id}</p>
        </div>
      </div>

      <div style={{ background:'#0D0D0D', border:'1px solid #1A1A1A', borderRadius:4, padding:'10px 14px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        {[
          { label:'Current', val: isUrgent ? '0 Units' : `${shoe.stock} Units`, color: isUrgent ? '#f87171' : '#fbbf24' },
          { label:'Min Threshold', val:`${shoe.minStock} Units`, color:'#F0F0F0' },
          { label:'Retail Price', val:`₹${shoe.price.toFixed(2)}`, color:'#FF6A35' },
        ].map(d => (
          <div key={d.label}>
            <span style={{ display:'block', fontSize:'0.58rem', color:'#444', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>{d.label}</span>
            <span style={{ fontWeight:700, color:d.color, fontSize:'0.85rem' }}>{d.val}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setRestockShoe(shoe)}
        style={{
          width:'100%', padding:'10px 0',
          background: isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.12)',
          border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
          borderRadius:3, color: isUrgent ? '#f87171' : '#fbbf24',
          fontFamily:"'Space Grotesk', sans-serif", fontWeight:700, fontSize:'0.72rem',
          textTransform:'uppercase', letterSpacing:'0.07em', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          transition:'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = isUrgent ? 'rgba(239,68,68,0.22)' : 'rgba(245,158,11,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.12)'}
      >
        <RefreshCw style={{ width:14, height:14 }} />
        Restock {shoe.name.split(' ').slice(0,3).join(' ')}
      </button>
    </div>
  );

  return (
    <div style={{ padding:'24px 0 80px' }}>

      {/* Header */}
      <div style={{ background:'#111', border:'1px solid #1A1A1A', borderRadius:6, padding:'20px 24px', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:16 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
            <Bell style={{ width:14, height:14, color:'#f87171' }} className="animate-pulse-dot" />
            <span style={S.label}>STOCK MONITORING</span>
          </div>
          <h2 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'2.2rem', textTransform:'uppercase', color:'#F0F0F0', lineHeight:1 }}>
            Restock Alert Hub
          </h2>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color:'#555', fontSize:'0.72rem' }}>Active Alerts:</span>
          <span className="tag" style={{ background:'rgba(239,68,68,0.12)', color:'#f87171', border:'1px solid rgba(239,68,68,0.25)', fontSize:'0.72rem', padding:'4px 12px' }}>
            {total} Critical
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ background:'#111', border:'1px solid #1A1A1A', borderRadius:6, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div style={{ display:'flex', gap:8 }}>
          {filterBtns.map(b => (
            <button key={b.id} onClick={()=>setFilter(b.id)}
              style={{
                padding:'6px 14px', borderRadius:3, border:'none', cursor:'pointer',
                fontFamily:"'Space Grotesk', sans-serif", fontWeight:700, fontSize:'0.7rem',
                textTransform:'uppercase', letterSpacing:'0.06em',
                background: filter===b.id ? b.bg : '#1A1A1A',
                color: filter===b.id ? b.color : '#555',
                transition:'all 0.15s',
              }}
            >{b.label}</button>
          ))}
        </div>
        <button
          onClick={()=>setActiveTab('inventory')}
          style={{ display:'flex', alignItems:'center', gap:6, color:'#FF6A35', fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', background:'none', border:'none', cursor:'pointer' }}
        >
          View Inventory <ArrowRight style={{width:12,height:12}} />
        </button>
      </div>

      {/* Cards */}
      {total === 0 ? (
        <div style={{ background:'#111', border:'1px solid #1A1A1A', borderRadius:6, padding:60, textAlign:'center' }}>
          <CheckCircle style={{ width:40, height:40, color:'#4ade80', margin:'0 auto 12px' }} />
          <h3 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.8rem', textTransform:'uppercase', color:'#F0F0F0', marginBottom:8 }}>All Stocks Healthy!</h3>
          <p style={{ color:'#444', fontSize:'0.8rem' }}>No items are below minimum stock threshold.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }} className="alerts-grid">
          {(filter==='All'||filter==='Urgent') && outOfStock.map(shoe=><AlertCard key={shoe.id} shoe={shoe} isUrgent={true} />)}
          {(filter==='All'||filter==='Warning') && lowStock.map(shoe=><AlertCard key={shoe.id} shoe={shoe} isUrgent={false} />)}
        </div>
      )}

      {/* Restock Modal */}
      {restockShoe && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(5,5,5,0.9)', backdropFilter:'blur(12px)' }} className="animate-fadeIn">
          <div style={{ background:'#111', border:'1px solid #252525', borderRadius:6, maxWidth:420, width:'100%', padding:28, position:'relative' }} className="animate-popIn">
            <button onClick={()=>setRestockShoe(null)} style={{ position:'absolute', top:16, right:16, background:'#1A1A1A', border:'1px solid #252525', borderRadius:3, padding:6, color:'#888', cursor:'pointer' }}>
              <X style={{width:14,height:14}} />
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid #1A1A1A', paddingBottom:16, marginBottom:20 }}>
              <img src={restockShoe.image} alt={restockShoe.name} style={{ width:48, height:48, objectFit:'contain', background:'#0D0D0D', padding:6, borderRadius:4 }} />
              <div>
                <h3 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.5rem', textTransform:'uppercase', color:'#F0F0F0' }}>Restock Inventory</h3>
                <p style={{ color:'#FF6A35', fontSize:'0.75rem', fontWeight:600 }}>{restockShoe.name}</p>
              </div>
            </div>
            <form onSubmit={handleRestock} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', color:'#444', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Add Stock Quantity (Units)</label>
                <input type="number" min="1" required value={restockQty} onChange={e=>setRestockQty(e.target.value)}
                  style={{ width:'100%', padding:'10px 14px', fontSize:'0.9rem', fontWeight:700, borderRadius:3, background:'#0D0D0D', border:'1px solid #252525', color:'#F0F0F0', fontFamily:"'Space Grotesk', sans-serif" }} />
              </div>
              <div style={{ background:'#0D0D0D', border:'1px solid #1A1A1A', borderRadius:4, padding:14 }}>
                {[
                  ['Current Stock', `${restockShoe.stock} units`, '#888'],
                  ['Adding', `+${restockQty} units`, '#4ade80'],
                  ['New Total', `${restockShoe.stock + (parseInt(restockQty,10)||0)} units`, '#F0F0F0'],
                ].map(([l,v,c]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'0.78rem' }}>
                    <span style={{ color:'#444' }}>{l}</span>
                    <span style={{ fontWeight:700, color:c }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
                <button type="button" onClick={()=>setRestockShoe(null)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">Confirm Restock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 700px) { .alerts-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
