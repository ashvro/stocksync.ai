import json
import urllib.request

from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Footwear, Order
from .security import issue_token, TOKEN_TTL
from .serializers import FootwearSerializer, OrderSerializer

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

@api_view(['POST'])
@permission_classes([AllowAny])
def auth_login(request):
    username = str(request.data.get('username', ''))
    password = str(request.data.get('password', ''))
    if username == settings.ADMIN_USERNAME and password == settings.ADMIN_PASSWORD:
        return Response({
            'token': issue_token(username),
            'expires_in': TOKEN_TTL,
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

def _normalize_inventory(items):
    normalized = []
    for it in items or []:
        normalized.append({
            "sku": it.get("sku_id") or it.get("id"),
            "name": it.get("name"),
            "category": it.get("category"),
            "brand": it.get("brand"),
            "price": it.get("price"),
            "stock": it.get("stock"),
            "min_stock": it.get("min_stock", it.get("minStock")),
            "sizes": it.get("sizes"),
            "color": it.get("color"),
        })
    return normalized

def _normalize_orders(orders):
    normalized = []
    for o in orders or []:
        normalized.append({
            "invoice_id": o.get("invoice_id") or o.get("id"),
            "customer": o.get("customer_name") or o.get("customerName"),
            "phone": o.get("customer_phone") or o.get("customerPhone"),
            "date": o.get("date"),
            "payment_method": o.get("payment_method") or o.get("paymentMethod"),
            "status": o.get("status") or "Completed",
            "subtotal": o.get("subtotal"),
            "discount_amount": o.get("discount_amount") or o.get("discountAmount"),
            "total": o.get("total"),
            "items": [
                {
                    "sku": i.get("footwear_id") or i.get("id"),
                    "name": i.get("name"),
                    "price": i.get("price"),
                    "qty": i.get("qty"),
                    "size": i.get("size"),
                }
                for i in (o.get("items") or [])
            ],
        })
    return normalized

def _order_summary(orders):
    total_revenue = 0.0
    units_sold = 0
    count = len(orders)
    by_sku = {}
    for o in orders:
        total_revenue += float(o.get("total") or 0)
        for i in o.get("items") or []:
            qty = int(i.get("qty") or 0)
            units_sold += qty
            sku = i.get("sku") or i.get("name") or "Unknown"
            if sku not in by_sku:
                by_sku[sku] = {"name": i.get("name"), "qty": 0, "revenue": 0.0}
            by_sku[sku]["qty"] += qty
            by_sku[sku]["revenue"] += float(i.get("price") or 0) * qty
    top_sellers = sorted(by_sku.items(), key=lambda kv: kv[1]["qty"], reverse=True)[:5]
    return {
        "orders_count": count,
        "total_revenue": round(total_revenue, 2),
        "avg_order_value": round(total_revenue / count, 2) if count else 0,
        "units_sold": units_sold,
        "top_sellers": [{"sku": k, **v} for k, v in top_sellers],
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def chat(request):
    messages = request.data.get('messages', [])
    inventory = request.data.get('inventory', [])
    orders = request.data.get('orders', [])

    normalized_orders = _normalize_orders(orders)

    system_prompt = (
        "You are ASbot, the AI assistant for A.S Footwear, a premium streetwear, leather, "
        "sports and boots store. You have live access to the store's CURRENT INVENTORY, "
        "ORDER HISTORY (invoices) and ANALYTICS (JSON below).\n\n"
        "You can answer questions about:\n"
        "- Stock: levels, prices, SKUs, categories, low/out-of-stock items, restocking.\n"
        "- Invoices/orders: look up an invoice by id or customer name, totals, payment method, status.\n"
        "- Analytics: revenue, orders count, average order value, top sellers, units sold.\n\n"
        "All monetary values are in Indian Rupees (₹). Always show prices/revenue with ₹ "
        "and Indian formatting (e.g. ₹188.98, ₹1,20,000).\n\n"
        "Use the provided data ONLY. Never invent figures. If data is missing, say you cannot "
        "see it. Be concise, helpful and slightly street-style, but always professional. "
        "If the question is unrelated to the store, politely steer the conversation back.\n\n"
        "CURRENT INVENTORY SNAPSHOT:\n" + json.dumps(_normalize_inventory(inventory), indent=2) + "\n\n"
        "STORE ANALYTICS SNAPSHOT (from order history):\n" + json.dumps(_order_summary(normalized_orders), indent=2) + "\n\n"
        "RECENT ORDERS (last 30, newest first):\n" + json.dumps(normalized_orders[:30], indent=2)
    )

    payload = {
        "model": settings.GROQ_MODEL,
        "temperature": 0.3,
        "max_tokens": 600,
        "messages": [
            {"role": "system", "content": system_prompt},
        ] + [
            {"role": m.get("role", "user"), "content": m.get("content", "")}
            for m in (messages[-10:] if isinstance(messages, list) else [])
        ],
    }

    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        GROQ_URL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "User-Agent": "ASbot/1.0 (A.S Footwear POS)",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        reply = data["choices"][0]["message"]["content"].strip()
        return Response({"reply": reply, "source": "groq"})
    except Exception as e:
        return Response(
            {"error": f"ASbot API error: {e}", "reply": None, "source": "error"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

class FootwearViewSet(viewsets.ModelViewSet):
    queryset = Footwear.objects.all().order_by('sku_id')
    serializer_class = FootwearSerializer

    @action(detail=True, methods=['post'])
    def restock(self, request, pk=None):
        try:
            shoe = Footwear.objects.get(sku_id=pk)
            add_qty = int(request.data.get('quantity', 25))
            shoe.stock += add_qty
            shoe.save()
            return Response({'status': 'restocked', 'new_stock': shoe.stock}, status=status.HTTP_200_OK)
        except Footwear.DoesNotExist:
            return Response({'error': 'Footwear SKU not found'}, status=status.HTTP_404_NOT_FOUND)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

    def destroy(self, request, *args, **kwargs):
        # Restore inventory stock + sales count before deleting the order
        order = self.get_object()
        for item in order.items.all():
            try:
                shoe = Footwear.objects.get(sku_id=item.footwear_id)
                shoe.stock += item.qty
                shoe.sales_count = max(0, (shoe.sales_count or 0) - item.qty)
                shoe.save()
            except Footwear.DoesNotExist:
                pass
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
