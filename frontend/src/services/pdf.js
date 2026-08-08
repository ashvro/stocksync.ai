import { jsPDF } from 'jspdf';
import { STORE_INFO } from '../data/mockData';

const ORANGE = [255, 69, 0];
const DARK = [25, 25, 25];
const GREY = [115, 115, 115];
const LIGHT = [246, 246, 246];
const BORDER = [228, 228, 228];

const money = v => `Rs. ${Number(v || 0).toFixed(2)}`;

export function generateInvoicePdf(order) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  const C = W / 2;
  const R = W - M; // right margin x

  /* ── Fit text within a max width, truncating with ellipsis ── */
  const fit = (text, maxWidth) => {
    let t = String(text ?? '');
    const full = t;
    while (t.length > 1 && doc.getTextWidth(t) > maxWidth) t = t.slice(0, -1);
    return t === full ? t : t.slice(0, -1) + '…';
  };

  let y = 0;

  /* ── Letterhead band ───────────────────────────────────── */
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, W, 30, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 30, W, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('A.S FOOTWEAR', C, 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(STORE_INFO.tagline.toUpperCase(), C, 22.5, { align: 'center' });

  /* ── Store contact strip (centered, wrapped) ──────────── */
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  const contactLines = doc.splitTextToSize(STORE_INFO.address, W - 60);
  y = 36;
  contactLines.forEach(line => {
    doc.text(line, C, y, { align: 'center' });
    y += 4;
  });
  doc.text(`Phone: ${STORE_INFO.phone}    •    Email: ${STORE_INFO.email}`, C, y, { align: 'center' });
  y += 4;
  doc.text('Bengaluru, Karnataka', C, y, { align: 'center' });

  doc.setDrawColor(...BORDER);
  doc.line(M, y + 5, R, y + 5);

  /* ── Invoice heading + meta ───────────────────────────── */
  y = y + 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...ORANGE);
  doc.text('TAX INVOICE', M, y);

  const meta = [
    ['Invoice No.', String(order.id ?? '—')],
    ['Date', String(order.date ?? '—')],
    ['Payment', String(order.paymentMethod ?? '—')],
  ];
  doc.setFontSize(9);
  meta.forEach(([label, value], i) => {
    const ry = y - i * 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GREY);
    doc.text(fit(label, 40), R - 55, ry, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(fit(value, 52), R, ry, { align: 'right' });
  });

  /* ── Bill To ──────────────────────────────────────────── */
  y += 12;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(M, y, W - 2 * M, 24, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text('BILL TO', M + 4, y + 5);
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text(order.customerName || 'Walk-in Customer', M + 4, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  doc.text(fit(`Phone: ${order.customerPhone || '—'}`, W - 2 * M - 20), M + 4, y + 16);
  doc.text(fit(`Email: ${order.customerEmail || '—'}`, W - 2 * M - 20), M + 4, y + 20);

  /* ── Items table ──────────────────────────────────────── */
  y += 32;
  const colItem = M;
  const colSize = 78;
  const colQty = 108;
  const colPrice = 142;
  const colTotal = R;

  const tableHeader = () => {
    doc.setFillColor(...ORANGE);
    doc.rect(M, y, W - 2 * M, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('ITEM DESCRIPTION', colItem + 2, y + 5.5);
    doc.text('SIZE', colSize + 4, y + 5.5);
    doc.text('QTY', colQty + 4, y + 5.5);
    doc.text('PRICE', colPrice, y + 5.5, { align: 'right' });
    doc.text('TOTAL', colTotal - 2, y + 5.5, { align: 'right' });
    y += 8;
  };
  tableHeader();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  order.items.forEach((it, i) => {
    if (y > H - 42) {
      doc.addPage();
      y = 18;
      tableHeader();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
    }
    if (i % 2 === 1) {
      doc.setFillColor(...LIGHT);
      doc.rect(M, y, W - 2 * M, 8, 'F');
    }
    doc.setTextColor(...DARK);
    doc.text(fit(it.name, colSize - colItem - 6), colItem + 2, y + 5);
    doc.text(fit(it.size ?? '—', 20), colSize + 4, y + 5);
    doc.text(String(it.qty), colQty + 4, y + 5);
    doc.text(money(it.price), colPrice, y + 5, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(money(it.price * it.qty), colTotal - 2, y + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 8;
  });

  doc.setDrawColor(...BORDER);
  doc.line(M, y, R, y);
  y += 6;

  /* ── Totals ───────────────────────────────────────────── */
  const row = (label, value, { bold = false, color = DARK, size = 9.5 } = {}) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(fit(label, 45), colTotal - 52, y, { align: 'right' });
    doc.text(fit(value, 50), colTotal, y, { align: 'right' });
    y += bold ? 8.5 : 6;
  };

  row('Subtotal', money(order.subtotal));
  if (order.discountAmount > 0) {
    row(`Discount (${order.discount}%)`, `-${money(order.discountAmount)}`, { color: [220, 38, 38] });
  }

  doc.setFillColor(...ORANGE);
  doc.rect(colTotal - 52, y + 0.2, 52, 0.6, 'F');
  row('GRAND TOTAL', money(order.total), { bold: true, color: ORANGE, size: 13 });

  /* ── Footer ───────────────────────────────────────────── */
  const fy = H - 34;
  doc.setDrawColor(...ORANGE);
  doc.setLineDashPattern([1.4, 1.2], 0);
  doc.line(M, fy, R, fy);
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text('Thank you for shopping at A.S Footwear!', C, fy + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text('30-Day exchange policy applies with original receipt.', C, fy + 13, { align: 'center' });
  doc.text('This is a computer-generated invoice and does not require a physical signature.', C, fy + 18, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...ORANGE);
  doc.text('A.S FOOTWEAR', M, H - 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GREY);
  doc.text('Authorized Signatory', R, H - 10, { align: 'right' });

  doc.save(`${order.id || 'invoice'}.pdf`);
}
