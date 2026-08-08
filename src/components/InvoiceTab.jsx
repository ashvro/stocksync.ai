import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  FileDown, 
  CheckCircle, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Sparkles, 
  ShoppingBag,
  Footprints,
  FileText,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { STORE_INFO } from '../data/mockData';
import { generateInvoicePdf } from '../services/pdf';

export default function InvoiceTab({ 
  inventory, 
  onCompleteOrder, 
  selectedShoeFromLanding,
  clearSelectedShoeFromLanding 
}) {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [discountPercent, setDiscountPercent] = useState(5);

  const [shoeSearch, setShoeSearch] = useState('');
  const [shoeCategory, setShoeCategory] = useState('All');
  const [selectedSizeMap, setSelectedSizeMap] = useState({}); // { shoeId: selectedSize }

  const [completedOrder, setCompletedOrder] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // If navigated from landing page or inventory with a pre-selected shoe
  useEffect(() => {
    if (selectedShoeFromLanding) {
      handleAddToCart(selectedShoeFromLanding);
      if (clearSelectedShoeFromLanding) clearSelectedShoeFromLanding();
    }
  }, [selectedShoeFromLanding]);

  const categories = ['All', 'Sneakers', 'Formal Leather', 'Sports & Athletics', 'Boots', 'Casual & Loafers'];

  const filteredShoes = inventory.filter(shoe => {
    const matchesSearch = shoe.name.toLowerCase().includes(shoeSearch.toLowerCase()) ||
                          shoe.brand.toLowerCase().includes(shoeSearch.toLowerCase()) ||
                          shoe.id.toLowerCase().includes(shoeSearch.toLowerCase());
    const matchesCategory = shoeCategory === 'All' || shoe.category === shoeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSizeSelect = (shoeId, size) => {
    setSelectedSizeMap(prev => ({ ...prev, [shoeId]: size }));
  };

  const handleAddToCart = (shoe) => {
    if (shoe.stock <= 0) return;

    const chosenSize = selectedSizeMap[shoe.id] || shoe.sizes[0] || 9;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === shoe.id && item.size === chosenSize);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].qty + 1;
        if (newQty <= shoe.stock) {
          updated[existingIndex].qty = newQty;
        } else {
          alert(`Maximum stock available for size ${chosenSize} is ${shoe.stock}`);
        }
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: shoe.id,
            name: shoe.name,
            brand: shoe.brand,
            price: shoe.price,
            image: shoe.image,
            size: chosenSize,
            qty: 1,
            maxStock: shoe.stock
          }
        ];
      }
    });
  };

  const handleUpdateQty = (index, delta) => {
    setCart(prev => {
      const updated = [...prev];
      const newQty = updated[index].qty + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      if (newQty > updated[index].maxStock) {
        alert(`Cannot exceed available stock (${updated[index].maxStock})`);
        return updated;
      }
      updated[index].qty = newQty;
      return updated;
    });
  };

  const handleRemoveFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = subtotal - discountAmount;

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Please add at least one footwear item to the invoice cart!");
      return;
    }

    const orderData = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone || '+1 (555) 000-0000',
      customerEmail: customerEmail || 'customer@asfootwear.com',
      date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      items: cart,
      subtotal,
      discount: discountPercent,
      discountAmount,
      tax: 0,
      total: grandTotal,
      paymentMethod,
      status: 'Completed'
    };

    onCompleteOrder(orderData);
    setCompletedOrder(orderData);
    setIsReceiptModalOpen(true);

    // Download the digitized PDF bill directly
    try {
      generateInvoicePdf(orderData);
    } catch (e) {
      console.error("Failed to generate PDF:", e);
    }

    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti triggered');
    }

    // Reset Cart
    setCart([]);
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setCustomerEmail('');
  };

  return (
    <div style={{ padding:'24px 0 80px' }}>
      
      {/* Header Banner */}
      <div style={{ background:'#111', border:'1px solid #1A1A1A', borderRadius:6, padding:'20px 24px', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:20 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <Receipt style={{ width:14, height:14, color:'#FF6A35' }} />
            <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#FF6A35' }}>Point of Sale Terminal</span>
          </div>
          <h2 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'2.2rem', textTransform:'uppercase', color:'#F0F0F0', lineHeight:1 }}>
            POS Billing & Invoice
          </h2>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ color:'#444', fontSize:'0.72rem' }}>Session ID:</span>
          <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.72rem', fontWeight:700, color:'#FF6A35', background:'#0D0D0D', border:'1px solid #1A1A1A', padding:'5px 10px', borderRadius:3 }}>
            INV-{Math.floor(1000 + Math.random() * 9000)}
          </span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:20 }} className="invoice-layout">
        
        {/* LEFT COLUMN: ITEM CATALOGUE SELECTOR */}
        <div className="invoice-left" style={{ background:'#111', border:'1px solid #1A1A1A', borderRadius:6, padding:16 }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:14 }}>
            <div style={{ position:'relative', flex:1, minWidth:180 }}>
              <Search style={{ width:13, height:13, position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#444' }} />
              <input type="text" placeholder="Search footwear to bill..."
                value={shoeSearch} onChange={e=>setShoeSearch(e.target.value)}
                style={{ width:'100%', paddingLeft:30, paddingRight:12, paddingTop:8, paddingBottom:8, fontSize:'0.78rem', borderRadius:3, background:'#0D0D0D', border:'1px solid #252525', color:'#F0F0F0', fontFamily:"'Space Grotesk', sans-serif" }}
              />
            </div>
            <select value={shoeCategory} onChange={e=>setShoeCategory(e.target.value)}
              style={{ padding:'8px 12px', fontSize:'0.78rem', borderRadius:3, background:'#0D0D0D', border:'1px solid #252525', color:'#F0F0F0', fontFamily:"'Space Grotesk', sans-serif", cursor:'pointer' }}>
              {categories.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>

            {/* Footwear Grid List */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, maxHeight:520, overflowY:'auto' }} className="inv-mini-grid">
              {filteredShoes.map(shoe => {
                const isOut = shoe.stock === 0;
                const curSz = selectedSizeMap[shoe.id] || shoe.sizes[0] || 9;
                return (
                  <div key={shoe.id} style={{ background:'#0D0D0D', border:`1px solid ${isOut?'#1A1A1A':'#1A1A1A'}`, borderRadius:4, padding:12, display:'flex', flexDirection:'column', gap:10, opacity:isOut?0.55:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <img src={shoe.image} alt={shoe.name} style={{ width:48, height:48, objectFit:'contain', background:'#111', padding:4, borderRadius:3, flexShrink:0 }} />
                      <div style={{ minWidth:0, flex:1 }}>
                        <span style={{ fontSize:'0.6rem', fontWeight:700, color:'#FF6A35', textTransform:'uppercase', letterSpacing:'0.06em', display:'block' }}>{shoe.brand}</span>
                        <h4 style={{ fontWeight:700, color:'#F0F0F0', fontSize:'0.78rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{shoe.name}</h4>
                        <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1rem', color:'#F0F0F0', marginTop:2 }}>₹{shoe.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div style={{ borderTop:'1px solid #1A1A1A', paddingTop:8, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:3, overflowX:'auto' }}>
                        <span style={{ color:'#444', fontSize:'0.58rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginRight:3 }}>Sz:</span>
                        {shoe.sizes.map(sz => (
                          <button key={sz} type="button" onClick={()=>handleSizeSelect(shoe.id,sz)}
                            style={{ padding:'2px 6px', background:curSz===sz?'#FF4500':'#1A1A1A', color:curSz===sz?'#fff':'#555', border:`1px solid ${curSz===sz?'#FF4500':'#252525'}`, borderRadius:2, fontSize:'0.6rem', fontFamily:"'Space Mono', monospace", fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}>
                            {sz}
                          </button>
                        ))}
                      </div>
                      <button onClick={()=>handleAddToCart(shoe)} disabled={isOut}
                        style={{ padding:'5px 10px', background:isOut?'#1A1A1A':'#FF4500', color:isOut?'#444':'#fff', border:'none', borderRadius:2, fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', cursor:isOut?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                        <Plus style={{width:11,height:11}} /> Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>


        {/* RIGHT COLUMN: ACTIVE INVOICE CART & CHECKOUT */}
        <div className="invoice-right" style={{ background:'#111', border:'1px solid #1A1A1A', borderRadius:6, padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1A1A1A', paddingBottom:14, marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <ShoppingBag style={{ width:15, height:15, color:'#FF6A35' }} />
                <span style={{ fontWeight:700, color:'#F0F0F0', fontSize:'0.88rem' }}>Invoice Cart ({cart.length})</span>
              </div>
              <button onClick={()=>setCart([])} style={{ color:'#f87171', fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', background:'none', border:'none', cursor:'pointer' }}>Clear</button>
            </div>

            {/* Customer Inputs */}
            <div style={{ background:'#0D0D0D', border:'1px solid #1A1A1A', borderRadius:4, padding:14, marginBottom:14 }}>
              <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#444', display:'block', marginBottom:10 }}>Customer Info</span>
              
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[{key:'customerName',label:'Name',ph:'Customer Name',val:customerName,set:setCustomerName},{key:'customerPhone',label:'Phone',ph:'+1 (555) 000',val:customerPhone,set:setCustomerPhone}].map(f=>(
                  <div key={f.key}>
                    <label style={{ display:'block', color:'#444', fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{f.label}</label>
                    <input type="text" placeholder={f.ph} value={f.val} onChange={e=>f.set(e.target.value)}
                      style={{ width:'100%', padding:'7px 10px', fontSize:'0.75rem', borderRadius:3, background:'#111', border:'1px solid #252525', color:'#F0F0F0', fontFamily:"'Space Grotesk', sans-serif" }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Line Items */}
            <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:260, overflowY:'auto', marginBottom:14 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign:'center', padding:32, color:'#444' }}>
                  <ShoppingBag style={{ width:28, height:28, margin:'0 auto 8px', opacity:0.4 }} />
                  <p style={{ fontSize:'0.78rem' }}>No footwear added yet.</p>
                  <p style={{ fontSize:'0.65rem', marginTop:4, color:'#333' }}>Select from catalogue to start billing.</p>
                </div>
              ) : cart.map((item, idx) => (
                <div key={`${item.id}-${item.size}`} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#0D0D0D', border:'1px solid #1A1A1A', borderRadius:4, padding:'10px 12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0, flex:1 }}>
                    <img src={item.image} alt={item.name} style={{ width:36, height:36, objectFit:'contain', background:'#111', padding:4, borderRadius:3, flexShrink:0 }} />
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontWeight:700, color:'#F0F0F0', fontSize:'0.78rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                      <p style={{ color:'#444', fontSize:'0.62rem' }}>Sz <span style={{color:'#FF6A35'}}>{item.size}</span> · ₹{item.price.toFixed(2)} ea</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                    <div style={{ display:'flex', alignItems:'center', background:'#111', border:'1px solid #252525', borderRadius:3 }}>
                      <button onClick={()=>handleUpdateQty(idx,-1)} style={{ padding:'4px 7px', background:'none', border:'none', color:'#555', cursor:'pointer' }}><Minus style={{width:10,height:10}}/></button>
                      <span style={{ padding:'0 6px', fontWeight:700, color:'#F0F0F0', fontSize:'0.78rem', fontFamily:"'Space Mono', monospace" }}>{item.qty}</span>
                      <button onClick={()=>handleUpdateQty(idx,1)} style={{ padding:'4px 7px', background:'none', border:'none', color:'#555', cursor:'pointer' }}><Plus style={{width:10,height:10}}/></button>
                    </div>
                    <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'1.1rem', color:'#F0F0F0', minWidth:52, textAlign:'right' }}>₹{(item.price*item.qty).toFixed(2)}</span>
                    <button onClick={()=>handleRemoveFromCart(idx)} style={{ background:'none', border:'none', color:'#444', cursor:'pointer', padding:4 }}><Trash2 style={{width:13,height:13}}/></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop:'1px solid #1A1A1A', paddingTop:14, display:'flex', flexDirection:'column', gap:10 }}>
              {[
                ['Subtotal', `₹${subtotal.toFixed(2)}`, '#F0F0F0'],
              ].map(([l,v,c])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem' }}>
                  <span style={{ color:'#555' }}>{l}</span>
                  <span style={{ fontFamily:"'Space Mono', monospace", fontWeight:700, color:c }}>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ color:'#555', fontSize:'0.78rem' }}>Discount</span>
                  <input type="number" min="0" max="100" value={discountPercent} onChange={e=>setDiscountPercent(Math.max(0,Math.min(100,parseFloat(e.target.value)||0)))}
                    style={{ width:44, padding:'4px 6px', textAlign:'center', fontSize:'0.75rem', fontWeight:700, borderRadius:2, background:'#0D0D0D', border:'1px solid #252525', color:'#FF6A35', fontFamily:"'Space Mono', monospace" }} />
                  <span style={{ color:'#444', fontSize:'0.75rem' }}>%</span>
                </div>
                <span style={{ fontFamily:"'Space Mono', monospace", fontWeight:700, color:'#f87171', fontSize:'0.78rem' }}>-₹{discountAmount.toFixed(2)}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid #1A1A1A', paddingTop:10 }}>
                <span style={{ color:'#555', fontSize:'0.78rem' }}>Payment</span>
                <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}
                  style={{ padding:'5px 10px', fontSize:'0.72rem', borderRadius:3, background:'#0D0D0D', border:'1px solid #252525', color:'#FF6A35', fontFamily:"'Space Mono', monospace", fontWeight:700, cursor:'pointer' }}>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="UPI / Cash">UPI / Cash</option>
                  <option value="Store Credit">Store Credit</option>
                </select>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #252525', paddingTop:14 }}>
                <span style={{ fontFamily:"'Space Grotesk', sans-serif", fontWeight:700, fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.04em' }}>Total Payable</span>
                <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:'2.2rem', color:'#FF4500', lineHeight:1 }}>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Complete Sale Button */}
            <button onClick={handleCheckout} disabled={cart.length===0}
              style={{ width:'100%', marginTop:16, padding:'13px 0', background:cart.length===0?'#1A1A1A':'#FF4500', color:cart.length===0?'#333':'#fff', border:'none', borderRadius:3, fontFamily:"'Space Grotesk', sans-serif", fontWeight:700, fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.08em', cursor:cart.length===0?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background 0.15s', opacity:cart.length===0?0.5:1 } }
              onMouseEnter={e=>{ if(cart.length>0) e.currentTarget.style.background='#e03d00'; }}
              onMouseLeave={e=>{ if(cart.length>0) e.currentTarget.style.background='#FF4500'; }}
            >
              <CheckCircle style={{width:15,height:15}} />
              Complete Order & Download Bill
            </button>
        </div>

      </div>
      <style>{`
        @media (min-width: 900px) { .invoice-layout { grid-template-columns: 1.4fr 1fr !important; } }
        @media (max-width: 600px) { .inv-mini-grid { grid-template-columns: 1fr !important; } }
      `}</style>


      {/* PRINTABLE RECEIPT MODAL */}
      {isReceiptModalOpen && completedOrder && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(5,5,5,0.9)', backdropFilter:'blur(12px)' }} className="animate-fadeIn">
          <div style={{ background:'#111', border:'1px solid #252525', borderRadius:6, maxWidth:480, width:'100%', padding:28, position:'relative', maxHeight:'90vh', overflowY:'auto' }} className="animate-popIn">
            <button onClick={()=>setIsReceiptModalOpen(false)}
              style={{ position:'absolute', top:16, right:16, background:'#1A1A1A', border:'1px solid #252525', borderRadius:3, padding:6, color:'#888', cursor:'pointer' }}>
              <X style={{width:14,height:14}} />
            </button>

            {/* Receipt Printable Area */}
            <div id="printable-receipt" style={{ background:'#fff', color:'#111', padding:24, borderRadius:4, fontFamily:"'Space Grotesk', sans-serif" }}>
              
              {/* Receipt Header */}
              <div className="text-center border-b pb-4">
                <div className="flex items-center justify-center gap-1.5 font-display text-xl font-black tracking-tight text-slate-900">
                  <Footprints className="w-6 h-6 text-orange-600" />
                  <span>A.S FOOTWEAR</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">{STORE_INFO.address}</p>
                <p className="text-[11px] text-slate-600">Ph: {STORE_INFO.phone} • {STORE_INFO.email}</p>
              </div>

              {/* Receipt Info */}
              <div className="flex justify-between text-xs border-b pb-3">
                <div>
                  <p><strong className="text-slate-700">Invoice:</strong> {completedOrder.id}</p>
                  <p><strong className="text-slate-700">Date:</strong> {completedOrder.date}</p>
                </div>
                <div className="text-right">
                  <p><strong className="text-slate-700">Customer:</strong> {completedOrder.customerName}</p>
                  <p><strong className="text-slate-700">Payment:</strong> {completedOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-b pb-4">
                <thead>
                  <tr className="border-b text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-1">Item Description</th>
                    <th className="py-1 text-center">Size</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-800">
                  {completedOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium">{it.name}</td>
                      <td className="py-2 text-center">{it.size}</td>
                      <td className="py-2 text-center">{it.qty}</td>
                      <td className="py-2 text-right">₹{it.price.toFixed(2)}</td>
                      <td className="py-2 text-right font-bold">₹{(it.price * it.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="space-y-1 text-xs text-slate-700 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{completedOrder.subtotal.toFixed(2)}</span>
                </div>
                {completedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount ({completedOrder.discount}%):</span>
                    <span>-₹{completedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t">
                  <span>Grand Total:</span>
                  <span>₹{completedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer text */}
              <div className="text-center pt-4 border-t text-[10px] text-slate-500">
                <p className="font-bold text-slate-700">Thank you for shopping at A.S Footwear!</p>
                <p>30-Day exchange policy applies with original receipt.</p>
              </div>

            </div>

            {/* Modal Actions */}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:16 }}>
              <button onClick={()=>setIsReceiptModalOpen(false)} className="btn-ghost">Close</button>
              <button onClick={()=>generateInvoicePdf(completedOrder)} className="btn-primary">
                <FileDown style={{width:13,height:13}} /> Download PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
