import React, { useState } from 'react';
import { Search, Download, Eye, X, Printer, Footprints, Pencil, Trash2, Plus } from 'lucide-react';
import { STORE_INFO } from '../data/mockData';

const S = {
  label: { fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#FF6A35' },
  card: { background:'#111', border:'1px solid #1A1A1A', borderRadius:6 },
  input: { padding:'8px 12px', fontSize:'0.78rem', borderRadius:3, background:'#0D0D0D', border:'1px solid #252525', color:'#F0F0F0', fontFamily:"'Space Grotesk', sans-serif" },
};

export default function HistoryTab({ orderHistory, onUpdateOrder, onDeleteOrder }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const openEdit = order => {
    setEditForm(JSON.parse(JSON.stringify({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone || '',
      customerEmail: order.customerEmail || '',
      date: order.date,
      discount: order.discount || 0,
      paymentMethod: order.paymentMethod,
      status: order.status,
      tax: order.tax || 0,
      items: (order.items || []).map(it => ({ ...it })),
    })));
    setEditingOrder(order);
  };

  const updateItem = (idx, field, value) => {
    setEditForm(prev => {
      const items = prev.items.map((it, i) => i === idx ? { ...it, [field]: field === 'qty' || field === 'size' ? Number(value) : value } : it);
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setEditForm(prev => ({ ...prev, items: [...prev.items, { id: '', name: '', price: 0, qty: 1, size: 9 }] }));
  };

  const removeItem = idx => {
    setEditForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const saveEdit = () => {
    const items = editForm.items.filter(it => it.name && it.qty > 0);
    const subtotal = items.reduce((a, it) => a + (Number(it.price) * Number(it.qty)), 0);
    const discount = Number(editForm.discount) || 0;
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount + (Number(editForm.tax) || 0);

    onUpdateOrder({
      ...editingOrder,
      customerName: editForm.customerName,
      customerPhone: editForm.customerPhone,
      customerEmail: editForm.customerEmail,
      date: editForm.date,
      discount,
      discountAmount,
      tax: Number(editForm.tax) || 0,
      total,
      subtotal,
      paymentMethod: editForm.paymentMethod,
      status: editForm.status,
      items,
    });
    setEditingOrder(null);
    setEditForm(null);
  };

  const filtered = orderHistory.filter(o => {
    const ms = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
               o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               o.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
    const mv = selectedStatus === 'All' || o.status === selectedStatus;
    return ms && mv;
  });

  const exportCSV = () => {
    if (!orderHistory.length) return;
    const headers = ['Invoice ID','Customer','Date','Items','Subtotal','Total','Payment','Status'];
    const rows = orderHistory.map(o => [o.id, `"${o.customerName}"`, `"${o.date}"`, o.items.reduce((a,i)=>a+i.qty,0), o.subtotal.toFixed(2), o.total.toFixed(2), o.paymentMethod, o.status]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `AS_Footwear_Sales_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const statusStyle = s => {
    if (s === 'Completed') return { background:'rgba(34,197,94,0.09)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.2)' };
    if (s === 'Pending')   return { background:'rgba(245,158,11,0.1)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.2)' };
    return { background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)' };
  };

  return (
    <div style={{ padding:'24px 0 80px' }}>

      {/* Header */}
      <div style={{ ...S.card, padding:'20px 24px', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:16 }}>
        <div>
          <span style={S.label}>// Order & Transaction Logs</span>
          <h2 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'2.2rem', textTransform:'uppercase', color:'#F0F0F0', marginTop:4, lineHeight:1 }}>Sales History</h2>
        </div>
        <button onClick={exportCSV} className="btn-ghost" style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Download style={{ width:13, height:13, color:'#FF6A35' }} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ ...S.card, padding:'12px 16px', display:'flex', flexWrap:'wrap', gap:12, marginBottom:16, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:220 }}>
          <Search style={{ width:13, height:13, position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#444' }} />
          <input type="text" placeholder="Search invoice ID, customer, payment..."
            value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            style={{ ...S.input, paddingLeft:30, width:'100%' }}
          />
        </div>
        <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)}
          style={{ ...S.input, cursor:'pointer' }}>
          <option value="All">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.78rem' }}>
            <thead>
              <tr style={{ background:'#0D0D0D', borderBottom:'1px solid #1A1A1A' }}>
                {['Invoice ID','Customer','Date / Time','Items','Payment','Total','Status','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign: h==='Actions' ? 'right' : 'left', fontFamily:"'Space Mono', monospace", fontSize:'0.57rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#444', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:'#444', fontSize:'0.8rem' }}>No transactions match your query.</td></tr>
              ) : filtered.map(order => {
                const itemCount = order.items.reduce((a,i)=>a+i.qty,0);
                return (
                  <tr key={order.id} style={{ borderBottom:'1px solid #1A1A1A', transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.025)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'12px 16px', fontFamily:"'Space Mono', monospace", color:'#FF6A35', fontSize:'0.72rem', fontWeight:700 }}>{order.id}</td>
                    <td style={{ padding:'12px 16px', fontWeight:600, color:'#F0F0F0' }}>{order.customerName}</td>
                    <td style={{ padding:'12px 16px', color:'#555', fontSize:'0.73rem' }}>{order.date}</td>
                    <td style={{ padding:'12px 16px', color:'#888' }}>{itemCount} pair(s)</td>
                    <td style={{ padding:'12px 16px', color:'#888' }}>{order.paymentMethod}</td>
                    <td style={{ padding:'12px 16px', fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.2rem', color:'#F0F0F0' }}>₹{order.total.toFixed(2)}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span className="tag" style={{ ...statusStyle(order.status) }}>{order.status}</span>
                    </td>
                    <td style={{ padding:'12px 16px', textAlign:'right', whiteSpace:'nowrap' }}>
                      <button onClick={()=>setSelectedOrder(order)}
                        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 10px', background:'#1A1A1A', border:'1px solid #252525', borderRadius:3, color:'#888', fontSize:'0.68rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', cursor:'pointer', transition:'color 0.15s', marginRight:6 }}
                        onMouseEnter={e=>e.currentTarget.style.color='#F0F0F0'}
                        onMouseLeave={e=>e.currentTarget.style.color='#888'}
                      >
                        <Eye style={{width:12,height:12}} /> View
                      </button>
                      <button onClick={()=>openEdit(order)}
                        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 10px', background:'rgba(255,106,53,0.08)', border:'1px solid rgba(255,69,0,0.25)', borderRadius:3, color:'#FF6A35', fontSize:'0.68rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', cursor:'pointer', transition:'color 0.15s', marginRight:6 }}
                        onMouseEnter={e=>e.currentTarget.style.color='#fff'}
                        onMouseLeave={e=>e.currentTarget.style.color='#FF6A35'}
                      >
                        <Pencil style={{width:12,height:12}} /> Edit
                      </button>
                      <button onClick={()=>onDeleteOrder(order.id)}
                        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 10px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:3, color:'#f87171', fontSize:'0.68rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', cursor:'pointer', transition:'color 0.15s' }}
                        onMouseEnter={e=>e.currentTarget.style.color='#fff'}
                        onMouseLeave={e=>e.currentTarget.style.color='#f87171'}
                      >
                        <Trash2 style={{width:12,height:12}} /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedOrder && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(5,5,5,0.9)', backdropFilter:'blur(12px)' }} className="animate-fadeIn">
          <div style={{ background:'#111', border:'1px solid #252525', borderRadius:6, maxWidth:480, width:'100%', padding:28, position:'relative', maxHeight:'90vh', overflowY:'auto' }} className="animate-popIn">
            <button onClick={()=>setSelectedOrder(null)}
              style={{ position:'absolute', top:16, right:16, background:'#1A1A1A', border:'1px solid #252525', borderRadius:3, padding:6, color:'#888', cursor:'pointer' }}>
              <X style={{width:14,height:14}} />
            </button>

            {/* White receipt area */}
            <div style={{ background:'#fff', color:'#111', padding:24, borderRadius:4, fontFamily:"'Space Grotesk', sans-serif" }}>
              <div style={{ textAlign:'center', borderBottom:'1px solid #ddd', paddingBottom:12, marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:4 }}>
                  <Footprints style={{ width:18, height:18, color:'#FF4500' }} />
                  <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.4rem', textTransform:'uppercase' }}>A.S FOOTWEAR</span>
                </div>
                <p style={{ fontSize:'0.7rem', color:'#777', marginTop:2 }}>{STORE_INFO.address}</p>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', borderBottom:'1px solid #eee', paddingBottom:10, marginBottom:10 }}>
                <div><p><strong>Invoice:</strong> {selectedOrder.id}</p><p><strong>Date:</strong> {selectedOrder.date}</p></div>
                <div style={{ textAlign:'right' }}><p><strong>Customer:</strong> {selectedOrder.customerName}</p><p><strong>Method:</strong> {selectedOrder.paymentMethod}</p></div>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.72rem', marginBottom:10 }}>
                <thead><tr style={{ borderBottom:'1px solid #eee', color:'#777', textTransform:'uppercase', fontSize:'0.62rem' }}>
                  <th style={{ padding:'4px 0', textAlign:'left' }}>Item</th>
                  <th style={{ padding:'4px 0', textAlign:'center' }}>Sz</th>
                  <th style={{ padding:'4px 0', textAlign:'center' }}>Qty</th>
                  <th style={{ padding:'4px 0', textAlign:'right' }}>Total</th>
                </tr></thead>
                <tbody>
                  {selectedOrder.items.map((it,i)=>(
                    <tr key={i} style={{ borderBottom:'1px solid #f0f0f0' }}>
                      <td style={{ padding:'6px 0' }}>{it.name}</td>
                      <td style={{ padding:'6px 0', textAlign:'center' }}>{it.size}</td>
                      <td style={{ padding:'6px 0', textAlign:'center' }}>{it.qty}</td>
                      <td style={{ padding:'6px 0', textAlign:'right' }}>₹{(it.price*it.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize:'0.72rem', color:'#555' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}><span>Subtotal</span><span>₹{selectedOrder.subtotal.toFixed(2)}</span></div>
                {selectedOrder.discountAmount > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}><span>Discount ({selectedOrder.discount}%)</span><span>-₹{selectedOrder.discountAmount.toFixed(2)}</span></div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, color:'#111', borderTop:'1px solid #ddd', paddingTop:6, fontSize:'0.82rem' }}><span>Total Paid</span><span>₹{selectedOrder.total.toFixed(2)}</span></div>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:16 }}>
              <button onClick={()=>setSelectedOrder(null)} className="btn-ghost">Close</button>
              <button onClick={()=>window.print()} className="btn-primary">
                <Printer style={{width:13,height:13}} /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingOrder && editForm && (
        <div style={{ position:'fixed', inset:0, zIndex:110, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(5,5,5,0.9)', backdropFilter:'blur(12px)' }} className="animate-fadeIn">
          <div style={{ background:'#111', border:'1px solid #252525', borderRadius:6, maxWidth:720, width:'100%', padding:28, position:'relative', maxHeight:'92vh', overflowY:'auto' }} className="animate-popIn">
            <button onClick={()=>{setEditingOrder(null); setEditForm(null);}}
              style={{ position:'absolute', top:16, right:16, background:'#1A1A1A', border:'1px solid #252525', borderRadius:3, padding:6, color:'#888', cursor:'pointer' }}>
              <X style={{width:14,height:14}} />
            </button>

            <div style={{ marginBottom:18 }}>
              <span style={S.label}>// Edit Order</span>
              <h3 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.8rem', textTransform:'uppercase', color:'#F0F0F0', marginTop:4 }}>Editing {editingOrder.id}</h3>
            </div>

            {/* Customer details */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              {[
                { key:'customerName', label:'Customer Name' },
                { key:'customerPhone', label:'Phone' },
                { key:'customerEmail', label:'Email' },
                { key:'date', label:'Date / Time' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display:'block', color:'#555', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>{f.label}</label>
                  <input
                    type="text"
                    value={editForm[f.key]}
                    onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                    style={{ ...S.input, width:'100%' }}
                  />
                </div>
              ))}
            </div>

            {/* Payment + status */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
              <div>
                <label style={{ display:'block', color:'#555', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Payment Method</label>
                <select value={editForm.paymentMethod} onChange={e => setEditForm({ ...editForm, paymentMethod: e.target.value })} style={{ ...S.input, width:'100%', cursor:'pointer' }}>
                  {['UPI / Cash','Credit Card','Debit Card','Cash','Bank Transfer'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', color:'#555', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Status</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} style={{ ...S.input, width:'100%', cursor:'pointer' }}>
                  {['Completed','Pending','Refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', color:'#555', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Discount (%)</label>
                <input
                  type="number" min={0} max={100}
                  value={editForm.discount}
                  onChange={e => setEditForm({ ...editForm, discount: Number(e.target.value) })}
                  style={{ ...S.input, width:'100%' }}
                />
              </div>
            </div>

            {/* Items editor */}
            <div style={{ marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <label style={{ color:'#555', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>Line Items</label>
                <button onClick={addItem} className="btn-ghost" style={{ padding:'6px 12px' }}>
                  <Plus style={{ width:12, height:12 }} /> Add Item
                </button>
              </div>
              {editForm.items.length === 0 ? (
                <p style={{ padding:16, textAlign:'center', color:'#444', fontSize:'0.75rem', border:'1px dashed #252525', borderRadius:4 }}>No items. Add at least one.</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {editForm.items.map((it, idx) => (
                    <div key={idx} style={{ display:'grid', gridTemplateColumns:'1.6fr 0.7fr 0.5fr 0.7fr 0.5fr 0.5fr', gap:8, alignItems:'center', background:'#0D0D0D', border:'1px solid #1A1A1A', borderRadius:4, padding:8 }}>
                      <input type="text" placeholder="Item name" value={it.name}
                        onChange={e => updateItem(idx, 'name', e.target.value)}
                        style={{ ...S.input, width:'100%' }} />
                      <input type="number" min={0} placeholder="Price" value={it.price}
                        onChange={e => updateItem(idx, 'price', e.target.value)}
                        style={{ ...S.input, width:'100%' }} />
                      <input type="number" min={1} placeholder="Qty" value={it.qty}
                        onChange={e => updateItem(idx, 'qty', e.target.value)}
                        style={{ ...S.input, width:'100%' }} />
                      <input type="number" min={1} placeholder="Size" value={it.size}
                        onChange={e => updateItem(idx, 'size', e.target.value)}
                        style={{ ...S.input, width:'100%' }} />
                      <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'0.9rem', color:'#F0F0F0', textAlign:'right', whiteSpace:'nowrap' }}>₹{(Number(it.price)*Number(it.qty)).toFixed(2)}</span>
                      <button onClick={() => removeItem(idx)}
                        style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:6, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:3, color:'#f87171', cursor:'pointer' }}>
                        <Trash2 style={{ width:12, height:12 }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live totals */}
            <div style={{ background:'#0D0D0D', border:'1px solid #1A1A1A', borderRadius:4, padding:14, marginBottom:20 }}>
              {(() => {
                const items = editForm.items.filter(it => it.name && it.qty > 0);
                const subtotal = items.reduce((a, it) => a + (Number(it.price) * Number(it.qty)), 0);
                const discount = Number(editForm.discount) || 0;
                const discountAmount = (subtotal * discount) / 100;
                const total = subtotal - discountAmount + (Number(editForm.tax) || 0);
                return (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                    <div><p style={{ color:'#444', fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>Subtotal</p><p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.3rem', color:'#F0F0F0' }}>₹{subtotal.toFixed(2)}</p></div>
                    <div><p style={{ color:'#444', fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>Discount</p><p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.3rem', color:'#fbbf24' }}>-₹{discountAmount.toFixed(2)}</p></div>
                    <div><p style={{ color:'#444', fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>Grand Total</p><p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.3rem', color:'#FF4500' }}>₹{total.toFixed(2)}</p></div>
                  </div>
                );
              })()}
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={()=>{setEditingOrder(null); setEditForm(null);}} className="btn-ghost">Cancel</button>
              <button onClick={saveEdit} className="btn-primary">
                <Pencil style={{width:13,height:13}} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
