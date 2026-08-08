import React, { useState } from 'react';
import {
  Package, Search, Filter, Plus, Edit3, Trash2,
  Grid, List, AlertTriangle, XCircle, X, DollarSign, ImagePlus, Link2
} from 'lucide-react';

const S = {
  label: { fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#FF6A35' },
  surfaceCard: { background:'#111', border:'1px solid #1A1A1A', borderRadius:6 },
  input: { padding:'8px 12px', fontSize:'0.78rem', borderRadius:3, background:'#0D0D0D', border:'1px solid #252525', color:'#F0F0F0', fontFamily:"'Space Grotesk', sans-serif", width:'100%' },
  select: { padding:'8px 12px', fontSize:'0.78rem', borderRadius:3, background:'#0D0D0D', border:'1px solid #252525', color:'#F0F0F0', fontFamily:"'Space Grotesk', sans-serif", cursor:'pointer' },
};

export default function InventoryTab({
  inventory, onAddShoe, onUpdateShoe, onDeleteShoe,
  searchQuery, setSearchQuery, onSelectShoeForInvoice,
}) {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShoe, setEditingShoe] = useState(null);
  const [formData, setFormData] = useState({
    id:'', name:'', category:'Sneakers', brand:'A.S Apex',
    price:'', cost:'', stock:'', minStock:'10', color:'',
    sizes:[7,8,9,10,11],
    image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    description:'',
    featured:false
  });

  const categories = ['All','Sneakers','Formal Leather','Sports & Athletics','Boots','Casual & Loafers','Sandals & Slides'];
  const totalItems = inventory.length;
  const totalStockUnits = inventory.reduce((s,i)=>s+i.stock, 0);
  const lowStockCount  = inventory.filter(i=>i.stock>0 && i.stock<=i.minStock).length;
  const outOfStockCount= inventory.filter(i=>i.stock===0).length;
  const totalValuation = inventory.reduce((s,i)=>s+(i.price*i.stock),0);

  const filtered = inventory.filter(item=>{
    const ms = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const mc = selectedCategory==='All' || item.category===selectedCategory;
    let mv = true;
    if (selectedStatus==='in_stock') mv=item.stock>item.minStock;
    if (selectedStatus==='low_stock') mv=item.stock>0&&item.stock<=item.minStock;
    if (selectedStatus==='out_of_stock') mv=item.stock===0;
    return ms&&mc&&mv;
  });

  const openAdd = () => {
    setEditingShoe(null);
    setFormData({ id:`SKU-${1000+inventory.length+1}`, name:'', category:'Sneakers', brand:'A.S Apex', price:'4999', cost:'2499', stock:'20', minStock:'8', color:'Black / White', sizes:[7,8,9,10,11], image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', description:'High performance footwear built with memory foam cushion midsole.', featured:false });
    setIsModalOpen(true);
  };
  const openEdit = (shoe) => {
    setEditingShoe(shoe);
    setFormData({ id:shoe.id, name:shoe.name, category:shoe.category, brand:shoe.brand, price:shoe.price.toString(), cost:(shoe.cost||shoe.price*0.5).toString(), stock:shoe.stock.toString(), minStock:shoe.minStock.toString(), color:shoe.color, sizes:shoe.sizes||[8,9,10], image:shoe.image, description:shoe.description, featured:!!shoe.featured });
    setIsModalOpen(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const d = { ...formData, featured:!!formData.featured, price:parseFloat(formData.price)||0, cost:parseFloat(formData.cost)||0, stock:parseInt(formData.stock,10)||0, minStock:parseInt(formData.minStock,10)||5, sizes:Array.isArray(formData.sizes)?formData.sizes:[8,9,10] };
    editingShoe ? onUpdateShoe(d) : onAddShoe(d);
    setIsModalOpen(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 700;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setFormData(prev => ({ ...prev, image: dataUrl }));
        e.target.value = '';
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const statusTag = (shoe) => {
    if (shoe.stock===0) return <span className="tag tag-red">Out of Stock</span>;
    if (shoe.stock<=shoe.minStock) return <span className="tag tag-amber">Low ({shoe.stock})</span>;
    return <span className="tag tag-green">{shoe.stock} Units</span>;
  };

  return (
    <div style={{ padding:'24px 0 80px' }}>

      {/* ── Metric Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }} className="metric-grid">
        {[
          { label:'Total SKUs',    val:totalItems,          sub:`${totalStockUnits} total units`, accent:'#FF4500', icon:Package },
          { label:'Valuation',     val:`₹${totalValuation.toLocaleString('en-IN',{maximumFractionDigits:0})}`, sub:'Based on retail', accent:'#E5FF00', icon:DollarSign },
          { label:'Low Stock',     val:`${lowStockCount} SKUs`,  sub:'Below min threshold', accent:'#fbbf24', icon:AlertTriangle },
          { label:'Out of Stock',  val:`${outOfStockCount} SKUs`,sub:'Needs restock',       accent:'#f87171', icon:XCircle },
        ].map(({ label, val, sub, accent, icon: Icon }) => (
          <div key={label} style={{ ...S.surfaceCard, padding:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <p style={{ fontSize:'0.65rem', color:'#555', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>{label}</p>
              <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'2rem', color: label==='Valuation' ? accent : '#F0F0F0', lineHeight:1 }}>{val}</p>
              <p style={{ fontSize:'0.65rem', color:'#444', marginTop:4 }}>{sub}</p>
            </div>
            <div style={{ width:44, height:44, borderRadius:4, background:`rgba(${label==='Valuation'?'229,255,0':label==='Low Stock'?'245,158,11':label==='Out of Stock'?'239,68,68':'255,69,0'},0.1)`, border:`1px solid rgba(${label==='Valuation'?'229,255,0':label==='Low Stock'?'245,158,11':label==='Out of Stock'?'239,68,68':'255,69,0'},0.2)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon style={{ width:20, height:20, color:accent }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Control Bar ── */}
      <div style={{ ...S.surfaceCard, padding:'14px 18px', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:20 }}>
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:10 }}>
          {/* Search */}
          <div style={{ position:'relative' }}>
            <Search style={{ width:13, height:13, position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#444' }} />
            <input
              type="text" placeholder="Filter by name, SKU, brand..."
              value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              style={{ ...S.input, paddingLeft:30, width:220 }}
            />
          </div>
          <select value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)} style={S.select}>
            {categories.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} style={S.select}>
            <option value="All">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* View toggle */}
          <div style={{ display:'flex', background:'#0D0D0D', border:'1px solid #252525', borderRadius:3, overflow:'hidden' }}>
            {[['grid', Grid], ['table', List]].map(([mode, Icon]) => (
              <button key={mode} onClick={()=>setViewMode(mode)} style={{ padding:'7px 10px', background:viewMode===mode?'#FF4500':'transparent', color:viewMode===mode?'#fff':'#555', border:'none', cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center' }}>
                <Icon style={{width:14,height:14}} />
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={openAdd} style={{ padding:'8px 16px' }}>
            <Plus style={{width:13,height:13}} /> Add SKU
          </button>
        </div>
      </div>

      {/* ── GRID VIEW ── */}
      {viewMode==='grid' ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }} className="inv-grid">
          {filtered.map(shoe => {
            const low = shoe.stock>0&&shoe.stock<=shoe.minStock;
            const out = shoe.stock===0;
            return (
              <div key={shoe.id} style={{ ...S.surfaceCard, overflow:'hidden', display:'flex', flexDirection:'column' }} className="card-hover">
                <div style={{ background:'#0A0A0A', padding:16, position:'relative', height:160, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <img src={shoe.image} alt={shoe.name} style={{ maxHeight:130, objectFit:'contain' }} />
                  <span className="tag tag-muted" style={{ position:'absolute', top:8, left:8 }}>{shoe.id}</span>
                  <span style={{ position:'absolute', top:8, right:8 }}>{statusTag(shoe)}</span>
                </div>
                <div style={{ padding:'14px 16px', flex:1, display:'flex', flexDirection:'column' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ color:'#FF6A35', fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{shoe.brand}</span>
                    <span style={{ color:'#444', fontSize:'0.65rem' }}>{shoe.category}</span>
                  </div>
                  <h3 style={{ fontWeight:700, color:'#F0F0F0', fontSize:'0.88rem', marginBottom:10, flex:1 }}>{shoe.name}</h3>
                  <div style={{ background:'#0D0D0D', border:'1px solid #1A1A1A', borderRadius:3, padding:'8px 10px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                    <div><span style={{ display:'block', color:'#444', fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>Retail</span><span style={{ fontWeight:700, color:'#F0F0F0', fontSize:'0.85rem' }}>₹{shoe.price.toFixed(2)}</span></div>
                    <div><span style={{ display:'block', color:'#444', fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>Cost</span><span style={{ fontWeight:600, color:'#666', fontSize:'0.85rem' }}>₹{(shoe.cost||shoe.price*0.5).toFixed(2)}</span></div>
                  </div>
                  <div style={{ display:'flex', gap:8, borderTop:'1px solid #1A1A1A', paddingTop:12 }}>
                    <button onClick={()=>onSelectShoeForInvoice(shoe)} disabled={out} style={{ flex:1, padding:'6px 0', background:'#1A1A1A', border:'1px solid #252525', borderRadius:3, color:'#888', fontSize:'0.7rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', cursor:out?'not-allowed':'pointer', opacity:out?0.5:1 }}>Bill</button>
                    <button onClick={()=>openEdit(shoe)} style={{ padding:6, background:'#1A1A1A', border:'1px solid #252525', borderRadius:3, color:'#888', cursor:'pointer' }}><Edit3 style={{width:13,height:13}}/></button>
                    <button onClick={()=>onDeleteShoe(shoe.id)} style={{ padding:6, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:3, color:'#f87171', cursor:'pointer' }}><Trash2 style={{width:13,height:13}}/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div style={{ ...S.surfaceCard, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.78rem', color:'#888' }}>
              <thead>
                <tr style={{ background:'#0D0D0D', borderBottom:'1px solid #1A1A1A' }}>
                  {['Footwear', 'SKU', 'Category', 'Brand', 'Price', 'Stock', 'Status', ''].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign: h==='' ? 'right' : 'left', fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#444', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(shoe => (
                  <tr key={shoe.id} style={{ borderBottom:'1px solid #1A1A1A', transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <img src={shoe.image} alt={shoe.name} style={{ width:36, height:36, objectFit:'contain', background:'#0D0D0D', padding:4, borderRadius:3 }} />
                        <div>
                          <p style={{ fontWeight:700, color:'#F0F0F0', fontSize:'0.82rem' }}>{shoe.name}</p>
                          <p style={{ color:'#444', fontSize:'0.65rem' }}>{shoe.color}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px', fontFamily:"'Space Mono', monospace", fontSize:'0.65rem', color:'#444' }}>{shoe.id}</td>
                    <td style={{ padding:'12px 16px' }}>{shoe.category}</td>
                    <td style={{ padding:'12px 16px', color:'#FF6A35', fontWeight:600 }}>{shoe.brand}</td>
                    <td style={{ padding:'12px 16px', fontWeight:700, color:'#F0F0F0' }}>₹{shoe.price.toFixed(2)}</td>
                    <td style={{ padding:'12px 16px', fontWeight:700 }}>{shoe.stock}</td>
                    <td style={{ padding:'12px 16px' }}>{statusTag(shoe)}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', justifyContent:'flex-end', gap:6 }}>
                        <button onClick={()=>onSelectShoeForInvoice(shoe)} disabled={shoe.stock===0} style={{ padding:'5px 12px', background:'#FF4500', border:'none', borderRadius:2, color:'#fff', fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', cursor:shoe.stock===0?'not-allowed':'pointer', opacity:shoe.stock===0?0.5:1 }}>Bill</button>
                        <button onClick={()=>openEdit(shoe)} style={{ padding:6, background:'#1A1A1A', border:'1px solid #1A1A1A', borderRadius:2, color:'#888', cursor:'pointer' }}><Edit3 style={{width:12,height:12}}/></button>
                        <button onClick={()=>onDeleteShoe(shoe.id)} style={{ padding:6, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)', borderRadius:2, color:'#f87171', cursor:'pointer' }}><Trash2 style={{width:12,height:12}}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {isModalOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(5,5,5,0.88)', backdropFilter:'blur(12px)' }} className="animate-fadeIn">
          <div style={{ background:'#111', border:'1px solid #252525', borderRadius:6, maxWidth:620, width:'100%', padding:28, position:'relative', maxHeight:'90vh', overflowY:'auto' }} className="animate-popIn">
            <button onClick={()=>setIsModalOpen(false)} style={{ position:'absolute', top:16, right:16, background:'#1A1A1A', border:'1px solid #252525', borderRadius:3, padding:6, color:'#888', cursor:'pointer' }}>
              <X style={{width:14,height:14}} />
            </button>
            <h3 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.8rem', textTransform:'uppercase', color:'#F0F0F0', marginBottom:20 }}>
              {editingShoe ? 'Edit Footwear SKU' : 'New Footwear SKU'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  { key:'id', label:'SKU ID', type:'text', disabled:true },
                  { key:'name', label:'Footwear Name', type:'text', placeholder:'e.g. Air Stealth Runner' },
                ].map(f=>(
                  <div key={f.key}>
                    <label style={{ display:'block', color:'#444', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>{f.label}</label>
                    <input type={f.type} required={!f.disabled} disabled={f.disabled} placeholder={f.placeholder} value={formData[f.key]} onChange={e=>setFormData({...formData,[f.key]:e.target.value})} style={{ ...S.input, opacity:f.disabled?0.5:1 }} />
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', color:'#444', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Category</label>
                  <select value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} style={{ ...S.input, ...S.select }}>
                    {categories.filter(c=>c!=='All').map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', color:'#444', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Brand</label>
                  <input type="text" required placeholder="e.g. A.S Apex" value={formData.brand} onChange={e=>setFormData({...formData,brand:e.target.value})} style={S.input} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                {[
                  { key:'price', label:'Retail Price (₹)', placeholder:'4999' },
                  { key:'cost',  label:'Cost Price (₹)',   placeholder:'2499' },
                  { key:'stock', label:'Stock Qty',        placeholder:'20' },
                ].map(f=>(
                  <div key={f.key}>
                    <label style={{ display:'block', color:'#444', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>{f.label}</label>
                    <input type="number" step="0.01" required placeholder={f.placeholder} value={formData[f.key]} onChange={e=>setFormData({...formData,[f.key]:e.target.value})} style={S.input} />
                  </div>
                ))}
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'rgba(255,69,0,0.05)', border:'1px solid rgba(255,69,0,0.18)', borderRadius:4, cursor:'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!formData.featured}
                  onChange={e=>setFormData({...formData, featured:e.target.checked})}
                  style={{ width:15, height:15, accentColor:'#FF4500', cursor:'pointer' }}
                />
                <span style={{ fontSize:'0.78rem', color:'#F0F0F0', fontWeight:600 }}>Pin to landing page top (permanent showcase)</span>
                <span style={{ marginLeft:'auto', fontSize:'0.62rem', color:'#555', textTransform:'uppercase', letterSpacing:'0.06em' }}>Featured</span>
              </label>
              <div>
                <label style={{ display:'block', color:'#444', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Product Image</label>
                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:14, alignItems:'center' }}>
                  {/* Image preview */}
                  <div style={{ width:84, height:84, borderRadius:4, border:'1px solid #1A1A1A', background:'#0D0D0D', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                    {formData.image ? (
                      <img src={formData.image} alt="preview" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                    ) : (
                      <ImagePlus style={{ width:20, height:20, color:'#444' }} />
                    )}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <label style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', padding:'9px 12px', background:'#1A1A1A', border:'1px solid #252525', borderRadius:3, color:'#F0F0F0', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk', sans-serif" }}>
                      <ImagePlus style={{ width:13, height:13, color:'#FF6A35' }} />
                      Upload Image from Device
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display:'none' }} />
                    </label>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Link2 style={{ width:12, height:12, color:'#444', flexShrink:0 }} />
                      <input type="url" placeholder="...or paste image URL" value={formData.image.startsWith('data:') ? '' : formData.image} onChange={e=>setFormData({...formData,image:e.target.value})} style={S.input} />
                    </div>
                    {formData.image && formData.image.startsWith('data:') && (
                      <button type="button" onClick={()=>setFormData({...formData, image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'})} style={{ alignSelf:'flex-start', padding:'5px 10px', background:'none', border:'1px solid #252525', borderRadius:3, color:'#888', fontSize:'0.65rem', cursor:'pointer' }}>
                        Reset to default image
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label style={{ display:'block', color:'#444', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Description</label>
                <textarea rows={3} value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} style={{ ...S.input, resize:'vertical' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:10, borderTop:'1px solid #1A1A1A', paddingTop:16 }}>
                <button type="button" onClick={()=>setIsModalOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">{editingShoe ? 'Save Changes' : 'Create SKU'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .metric-grid { grid-template-columns: 1fr 1fr !important; } .inv-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .metric-grid { grid-template-columns: 1fr !important; } .inv-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
