import React, { useState } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, BarChart3, Award, CalendarRange } from 'lucide-react';

const S = {
  label: { fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#FF6A35' },
  card: { background:'#111', border:'1px solid #1A1A1A', borderRadius:6 },
};

const PERIODS = {
  weekly:  { label:'Weekly',   days: 7,   sub:'Last 7 days' },
  monthly: { label:'Monthly',  days: 30,  sub:'Last 30 days' },
  yearly:  { label:'Yearly',   days: 365, sub:'Last 12 months' },
  custom:  { label:'Custom',   custom:true, sub:'Custom range' },
};

const dateInputStyle = {
  background:'#0D0D0D', border:'1px solid #252525', borderRadius:3,
  color:'#F0F0F0', fontSize:'0.72rem', padding:'6px 8px',
  fontFamily:"'Space Grotesk', sans-serif", colorScheme:'dark', width:'138px',
};

const parseDate = d => {
  const m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return new Date(d);
  let h = parseInt(m[4], 10);
  const p = m[6] ? m[6].toUpperCase() : '';
  if (p === 'PM' && h < 12) h += 12;
  if (p === 'AM' && h === 12) h = 0;
  return new Date(m[1], parseInt(m[2], 10) - 1, parseInt(m[3], 10), h, parseInt(m[5], 10));
};

const shoeCategory = (inventory, itemId) => {
  const shoe = inventory.find(i => (i.id || i.sku_id) === (itemId || ''));
  return shoe ? shoe.category : 'Other';
};

export default function AnalyticsTab({ inventory, orderHistory }) {
  const [period, setPeriod] = useState('weekly');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const { days, sub: periodSub } = PERIODS[period];

  const sub = period === 'custom'
    ? (customRange.from && customRange.to ? `${customRange.from} → ${customRange.to}` : 'Select a date range')
    : periodSub;

  const cutoff = Date.now() - (days || 0) * 86400000;
  const filtered = orderHistory.filter(o => {
    const t = parseDate(o.date).getTime();
    if (period === 'custom') {
      if (!customRange.from || !customRange.to) return false;
      const from = new Date(`${customRange.from}T00:00:00`).getTime();
      const to = new Date(`${customRange.to}T23:59:59.999`).getTime();
      return t >= from && t <= to;
    }
    return t >= cutoff;
  });

  const totalRevenue = filtered.reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders  = filtered.length;
  const totalUnitsSold = filtered.reduce((s, o) => s + (o.items || []).reduce((a, i) => a + (i.qty || 0), 0), 0);
  const avgOrderValue  = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const categoryRevenue = {};
  filtered.forEach(o => (o.items || []).forEach(it => {
    const cat = shoeCategory(inventory, it.id || it.footwear_id);
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (Number(it.price) * Number(it.qty));
  }));
  const maxCat = Math.max(...Object.values(categoryRevenue), 0);

  const soldByShoe = {};
  filtered.forEach(o => (o.items || []).forEach(it => {
    const key = it.id || it.footwear_id || it.name;
    if (!soldByShoe[key]) soldByShoe[key] = { id: key, name: it.name, units: 0, revenue: 0 };
    soldByShoe[key].units += Number(it.qty) || 0;
    soldByShoe[key].revenue += (Number(it.price) * Number(it.qty)) || 0;
  }));
  const topShoes = Object.values(soldByShoe).sort((a, b) => b.units - a.units).slice(0, 5);
  const maxUnits = Math.max(...topShoes.map(s => s.units), 1);

  const metrics = [
    { label:'Total Revenue',   val:`₹${totalRevenue.toLocaleString('en-IN',{maximumFractionDigits:0})}`, sub: sub, accent:'#FF4500', icon:DollarSign },
    { label:'Invoices Issued', val:`${totalOrders} Orders`,           sub:`${totalUnitsSold} pairs sold`, accent:'#4ade80', icon:ShoppingBag },
    { label:'Avg Order Value', val:`₹${avgOrderValue.toFixed(2)}`,    sub:'Per transaction', accent:'#E5FF00', icon:TrendingUp },
    { label:'Stock Alerts',    val:`${inventory.filter(i=>i.stock>0&&i.stock<=i.minStock).length}`, sub:'Low stock items', accent:'#f87171', icon:BarChart3 },
  ];

  return (
    <div style={{ padding:'24px 0 80px' }}>

      {/* Header + period selector */}
      <div style={{ ...S.card, padding:'20px 24px', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:16 }}>
        <div>
          <span style={S.label}>// Sales Performance</span>
          <h2 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'2.2rem', textTransform:'uppercase', color:'#F0F0F0', marginTop:4, lineHeight:1 }}>Analytics</h2>
          <p style={{ color:'#555', fontSize:'0.7rem', marginTop:6 }}>Live figures computed from order history · {sub}</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#0D0D0D', border:'1px solid #1A1A1A', borderRadius:4, padding:'4px', flexWrap:'wrap' }}>
          <CalendarRange style={{ width:14, height:14, color:'#FF6A35', marginLeft:8 }} />
          {Object.keys(PERIODS).map(p => (
            <button key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding:'7px 16px', borderRadius:3, border:'none', cursor:'pointer',
                fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.7rem', fontWeight:700,
                textTransform:'uppercase', letterSpacing:'0.06em',
                background: period === p ? '#FF4500' : 'transparent',
                color: period === p ? '#fff' : '#666',
                transition:'all 0.15s',
              }}
            >
              {PERIODS[p].label}
            </button>
          ))}

          {period === 'custom' && (
            <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:6, flexWrap:'wrap' }}>
              <input
                type="date"
                value={customRange.from}
                max={customRange.to || undefined}
                onChange={e => setCustomRange(c => ({ ...c, from: e.target.value }))}
                style={dateInputStyle}
              />
              <span style={{ color:'#555', fontSize:'0.7rem' }}>→</span>
              <input
                type="date"
                value={customRange.to}
                min={customRange.from || undefined}
                onChange={e => setCustomRange(c => ({ ...c, to: e.target.value }))}
                style={dateInputStyle}
              />
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {totalOrders === 0 && (
        <div style={{ ...S.card, padding:'40px 24px', textAlign:'center', marginBottom:16 }}>
          <BarChart3 style={{ width:28, height:28, color:'#333', margin:'0 auto 10px' }} />
          <h3 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.5rem', textTransform:'uppercase', color:'#888' }}>No Sales in This Period</h3>
          <p style={{ color:'#555', fontSize:'0.78rem', marginTop:6 }}>Analytics reset to zero — figures will update as soon as an invoice is completed in the POS.</p>
        </div>
      )}

      {/* Metric cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }} className="analytics-metric-grid">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} style={{ ...S.card, padding:22, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <p style={{ fontSize:'0.62rem', color:'#444', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>{m.label}</p>
                <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'2rem', color:'#F0F0F0', lineHeight:1 }}>{m.val}</p>
                <span style={{ fontSize:'0.65rem', color:'#555' }}>{m.sub}</span>
              </div>
              <div style={{ width:44, height:44, borderRadius:4, background:'rgba(255,69,0,0.08)', border:'1px solid rgba(255,69,0,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon style={{ width:20, height:20, color: m.accent }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:16 }} className="analytics-charts-grid">

        {/* Revenue by category (from sales history) */}
        <div style={{ ...S.card, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1A1A1A', paddingBottom:14, marginBottom:20 }}>
            <div>
              <span style={S.label}>// Revenue Mix</span>
              <h3 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.6rem', textTransform:'uppercase', color:'#F0F0F0', marginTop:4 }}>Revenue by Category</h3>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', background:'#0D0D0D', border:'1px solid #1A1A1A', borderRadius:3 }}>
              <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', color:'#555' }}>{sub.toUpperCase()}</span>
            </div>
          </div>

          {Object.keys(categoryRevenue).length === 0 ? (
            <p style={{ color:'#444', fontSize:'0.78rem', padding:'20px 0', textAlign:'center' }}>No sales recorded for this period.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {Object.entries(categoryRevenue).sort((a,b)=>b[1]-a[1]).map(([cat, val]) => {
                const pct = Math.round((val/maxCat)*100);
                return (
                  <div key={cat}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontWeight:600, color:'#F0F0F0', fontSize:'0.8rem' }}>{cat}</span>
                      <span style={{ fontFamily:"'Space Mono', monospace", color:'#FF6A35', fontSize:'0.75rem', fontWeight:700 }}>₹{val.toLocaleString('en-IN',{maximumFractionDigits:0})}</span>
                    </div>
                    <div style={{ height:6, background:'#0D0D0D', borderRadius:0, overflow:'hidden' }}>
                      <div style={{
                        height:'100%',
                        width:`${pct}%`,
                        background: pct > 75 ? '#FF4500' : pct > 40 ? '#FF6A35' : '#C44020',
                        transition:'width 1s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leaderboard from sales history */}
        <div style={{ ...S.card, padding:24 }}>
          <div style={{ borderBottom:'1px solid #1A1A1A', paddingBottom:14, marginBottom:20 }}>
            <span style={S.label}>// Best Sellers</span>
            <h3 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.6rem', textTransform:'uppercase', color:'#F0F0F0', marginTop:4 }}>Top Models Sold</h3>
          </div>
          {topShoes.length === 0 ? (
            <p style={{ color:'#444', fontSize:'0.78rem', padding:'20px 0', textAlign:'center' }}>No sales recorded for this period.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {topShoes.map((shoe, idx) => {
                const shoeMeta = inventory.find(i => (i.id || i.sku_id) === shoe.id);
                return (
                  <div key={shoe.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#0D0D0D', border:'1px solid #1A1A1A', borderRadius:4, padding:'10px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
                      <span style={{
                        width:24, height:24, borderRadius:2, flexShrink:0,
                        background: idx===0 ? '#FF4500' : idx===1 ? '#888' : '#3A2A1A',
                        color: idx===0 ? '#fff' : idx===1 ? '#0A0A0A' : '#aaa',
                        fontWeight:900, fontSize:'0.7rem',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontFamily:"'Space Mono', monospace",
                      }}>#{idx+1}</span>
                      {shoeMeta && (
                        <img src={shoeMeta.image} alt={shoe.name} style={{ width:36, height:36, objectFit:'contain', background:'#111', padding:4, borderRadius:3, flexShrink:0 }} />
                      )}
                      <div style={{ minWidth:0 }}>
                        <h4 style={{ fontWeight:700, color:'#F0F0F0', fontSize:'0.8rem', maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{shoe.name}</h4>
                        <p style={{ color:'#444', fontSize:'0.65rem' }}>{shoeMeta ? shoeMeta.brand : ''} · ₹{shoe.revenue.toLocaleString('en-IN',{maximumFractionDigits:0})}</p>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0, marginLeft:8 }}>
                      <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, color:'#FF4500', fontSize:'1.4rem', lineHeight:1 }}>{shoe.units}</span>
                      <span style={{ display:'block', color:'#444', fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>sold</span>
                    </div>
                  </div>
                );
              })}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6, paddingTop:12, borderTop:'1px solid #1A1A1A' }}>
                <Award style={{ width:13, height:13, color:'#FF6A35' }} />
                <span style={{ fontSize:'0.68rem', color:'#555' }}>Max volume: {maxUnits} pairs in {sub}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width:900px) {
          .analytics-metric-grid { grid-template-columns: 1fr 1fr !important; }
          .analytics-charts-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width:600px) {
          .analytics-metric-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
