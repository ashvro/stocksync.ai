const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const toCurrency = (n) => `₹${(Number(n) || 0).toFixed(2)}`;
const fmt = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const orderId = (o) => o.id || o.invoice_id || o.invoiceId;
const orderItems = (o) => o.items || [];
const unitPrice = (it) => it.price || 0;
const unitQty = (it) => it.qty || 0;

/* ── Local analytics helpers ─────────────────────────────────── */
const salesSummary = (orders) => {
  const totalRevenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const unitsSold = orders.reduce((s, o) => s + orderItems(o).reduce((a, i) => a + unitQty(i), 0), 0);
  const count = orders.length;
  const bySku = {};
  orders.forEach(o => orderItems(o).forEach(it => {
    const key = it.id || it.footwear_id || it.sku_id || it.name;
    if (!bySku[key]) bySku[key] = { name: it.name, qty: 0, revenue: 0 };
    bySku[key].qty += unitQty(it);
    bySku[key].revenue += unitPrice(it) * unitQty(it);
  }));
  const top = Object.values(bySku).sort((a, b) => b.qty - a.qty).slice(0, 5);
  return {
    count,
    totalRevenue,
    avgOrderValue: count ? totalRevenue / count : 0,
    unitsSold,
    top,
  };
};

/* ── Rule-based fallback answerer ──────────────────────────────
   Used only when the Django backend / Groq API is unreachable, so
   the bot still answers stock, invoice and analytics questions. */
const localAnswer = (messages, inventory, orders) => {
  const last = [...messages].reverse().find(m => m.role === 'user');
  const q = last ? last.content : '';
  const ql = q.toLowerCase();
  const data = salesSummary(orders || []);

  /* Analytics */
  if (/(revenue|sales|earned|made|money|analytics|performance|gmv)/.test(ql)) {
    return `Sales snapshot (${data.count} invoice${data.count === 1 ? '' : 's'} on record):\n\n• Total revenue: ${fmt(data.totalRevenue)}\n• Units sold: ${data.unitsSold} pairs\n• Avg order value: ${toCurrency(data.avgOrderValue)}\n\nTop sellers:\n${data.top.map(t => `  ${t.name} — ${t.qty} sold`).join('\n') || '  (no sales yet)'}`;
  }

  if (/(top|best.?sell|popular|leaderboard|bestseller)/.test(ql)) {
    if (!data.top.length) return "No sales recorded yet — the leaderboard is empty.";
    return `Top sellers:\n\n${data.top.map((t, i) => `#${i + 1} ${t.name} — ${t.qty} sold · ${fmt(t.revenue)}`).join('\n')}`;
  }

  if (/(order|invoice|billing|history|sale|receipt|payment|customer)/.test(ql)) {
    const ordersList = orders || [];
    if (!ordersList.length) return "No invoices on record yet. Complete a POS sale and I'll be able to look it up.";
    /* Try to find a specific invoice / customer */
    const match = (ql.match(/[a-z]*\d{3,}/i) || [])[0];
    const customerMatch = ordersList.find(o => String(o.customerName || o.customer_name || '').toLowerCase().split(' ').some(w => w.length > 2 && ql.includes(w)));
    const idMatch = match ? ordersList.find(o => String(orderId(o)).toLowerCase().includes(match.toLowerCase())) : null;
    if (idMatch) {
      const o = idMatch;
      const lines = orderItems(o).map(it => `  ${it.name} × ${unitQty(it)} — ${toCurrency(unitPrice(it) * unitQty(it))}`);
      return `Invoice ${orderId(o)} · ${o.customerName || o.customer_name} · ${o.date}\n${lines.join('\n')}\n  Total: ${toCurrency(o.total)} (${o.paymentMethod || o.payment_method || '—'}) · ${o.status || 'Completed'}`;
    }
    if (customerMatch) {
      return `Orders for ${customerMatch.customerName || customerMatch.customer_name}:\n\n${ordersList.filter(o => (o.customerName || o.customer_name) === (customerMatch.customerName || customerMatch.customer_name)).map(o => `${orderId(o)} · ${toCurrency(o.total)} · ${o.date}`).join('\n')}`;
    }
    return `Recent invoices (${ordersList.length} on record):\n\n${ordersList.slice(0, 8).map(o => `${orderId(o)} · ${o.customerName || o.customer_name || 'Walk-in'} · ${toCurrency(o.total)} · ${o.date}`).join('\n')}`;
  }

  /* Stock */
  if (/(low|below|reorder|restock|alerts?)/.test(ql)) {
    const low = inventory.filter(i => i.stock <= (i.min_stock ?? i.minStock ?? 0));
    if (!low.length) return "Everything is comfortably stocked right now — no reorder needed. 🔥";
    const lines = low.map(i => `${i.sku_id || i.id} · ${i.name} — ${i.stock} left (min ${i.min_stock ?? i.minStock})`);
    return `Low / reorder-worthy right now (${low.length}):\n\n${lines.join('\n')}`;
  }

  if (/(out.?of.?stock|sold out|zero|empty)/.test(ql)) {
    const oos = inventory.filter(i => (i.stock || 0) === 0);
    if (!oos.length) return "No out-of-stock items — the whole catalogue has units available. 🟢";
    return `Currently out of stock (${oos.length}):\n\n${oos.map(i => `${i.sku_id || i.id} · ${i.name}`).join('\n')}`;
  }

  if (/(list|all|everything|inventory|show|catalog|products)/.test(ql)) {
    return `Here's the full catalogue (${inventory.length} SKUs):\n\n${inventory.map(i => `${i.sku_id || i.id} · ${i.name} — ${i.stock} in stock · ${toCurrency(i.price)}`).join('\n')}`;
  }

  const asked = q;
  const shoes = inventory.filter(i => matchShoe(asked, i));
  if (shoes.length) {
    if (/(price|cost|how much|rate|worth)/.test(ql)) {
      return shoes.map(i => `${i.name} — ${toCurrency(i.price)}`).join('\n');
    }
    return shoes.map(i => `${i.name} (${i.sku_id || i.id}) — ${i.stock} in stock, min ${i.min_stock ?? i.minStock}, ${toCurrency(i.price)}`).join('\n');
  }

  return "I can't reach the live Groq brain right now, so I'm running in offline mode. Try asking about stock, prices, low-stock items, invoices, or revenue (e.g. 'which shoes are low?', 'show invoice INV-9821', 'how much revenue?').";
};

export async function sendChatMessage(messages, inventory, orders) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, inventory, orders: orders || [] }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ASbot API error');
    return { reply: data.reply, source: data.source || 'groq' };
  } catch (error) {
    console.warn('ASbot backend unreachable, falling back to local answerer:', error);
    return { reply: localAnswer(messages, inventory, orders || []), source: 'local' };
  }
}
