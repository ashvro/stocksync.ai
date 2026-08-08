from django.core.management.base import BaseCommand
from store.models import Footwear, Order, OrderItem

INITIAL_INVENTORY = [
  {
    "sku_id": "SKU-1001",
    "name": "Air Stealth Pro Runner",
    "category": "Sneakers",
    "brand": "A.S Apex",
    "price": 149.99,
    "cost": 85.00,
    "stock": 24,
    "min_stock": 8,
    "sizes": [7, 8, 9, 10, 11, 12],
    "color": "Midnight Black / Neon Orange",
    "rating": 4.9,
    "reviews_count": 128,
    "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "description": "Ultra-lightweight mesh upper with max-cushion responsive foam technology for peak urban performance.",
    "featured": True,
    "sales_count": 142
  },
  {
    "sku_id": "SKU-1002",
    "name": "Royal Oxford Italian Leather",
    "category": "Formal Leather",
    "brand": "A.S Heritage",
    "price": 219.99,
    "cost": 120.00,
    "stock": 5,
    "min_stock": 10,
    "sizes": [8, 9, 10, 11],
    "color": "Mahogany Tan",
    "rating": 5.0,
    "reviews_count": 84,
    "image": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80",
    "description": "Handcrafted full-grain Italian leather Oxfords with Goodyear welted leather soles and hand-stitched detailing.",
    "featured": True,
    "sales_count": 89
  },
  {
    "sku_id": "SKU-1003",
    "name": "VaporFly Velocity Trainer",
    "category": "Sports & Athletics",
    "brand": "A.S Apex",
    "price": 129.99,
    "cost": 70.00,
    "stock": 18,
    "min_stock": 10,
    "sizes": [6, 7, 8, 9, 10, 11],
    "color": "Electric Cyan / White",
    "rating": 4.8,
    "reviews_count": 210,
    "image": "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80",
    "description": "High-traction rubber outsole engineered for high-intensity training, sprinting, and court agility.",
    "featured": True,
    "sales_count": 195
  },
  {
    "sku_id": "SKU-1004",
    "name": "Monarch Leather Chelsea Boots",
    "category": "Boots",
    "brand": "A.S Heritage",
    "price": 189.99,
    "cost": 105.00,
    "stock": 3,
    "min_stock": 8,
    "sizes": [8, 9, 10, 11, 12],
    "color": "Dark Espresso Leather",
    "rating": 4.9,
    "reviews_count": 67,
    "image": "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
    "description": "Timeless Chelsea boot silhouette with elastic side goring and weather-resistant treated genuine leather.",
    "featured": True,
    "sales_count": 76
  },
  {
    "sku_id": "SKU-1005",
    "name": "UrbanGlide Low Streetwear",
    "category": "Sneakers",
    "brand": "A.S Street",
    "price": 110.00,
    "cost": 55.00,
    "stock": 32,
    "min_stock": 12,
    "sizes": [7, 8, 9, 10, 11],
    "color": "Chalk White / Vintage Slate",
    "rating": 4.7,
    "reviews_count": 312,
    "image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    "description": "Retro basketball inspired low-top sneaker with reinforced suede overlays and padded collar.",
    "featured": False,
    "sales_count": 230
  },
  {
    "sku_id": "SKU-1006",
    "name": "Grand Tourer Suede Loafers",
    "category": "Casual & Loafers",
    "brand": "A.S Heritage",
    "price": 139.99,
    "cost": 72.00,
    "stock": 0,
    "min_stock": 6,
    "sizes": [8, 9, 10, 11],
    "color": "Sand Suede",
    "rating": 4.6,
    "reviews_count": 45,
    "image": "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
    "description": "Soft velvet suede slip-on driving shoe with flexible pebble tread sole for unmatched comfort.",
    "featured": False,
    "sales_count": 54
  },
  {
    "sku_id": "SKU-1007",
    "name": "Highland Trek Tactical Boot",
    "category": "Boots",
    "brand": "A.S Apex",
    "price": 175.00,
    "cost": 95.00,
    "stock": 14,
    "min_stock": 8,
    "sizes": [9, 10, 11, 12],
    "color": "Olive Drab / Charcoal",
    "rating": 4.8,
    "reviews_count": 92,
    "image": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
    "description": "Heavy-duty outdoor hiking and tactical boots with waterproof membrane and steel shank arch support.",
    "featured": False,
    "sales_count": 68
  },
  {
    "sku_id": "SKU-1008",
    "name": "BreezeFlex Comfort Sandals",
    "category": "Sandals & Slides",
    "brand": "A.S Casual",
    "price": 59.99,
    "cost": 25.00,
    "stock": 45,
    "min_stock": 15,
    "sizes": [7, 8, 9, 10, 11],
    "color": "Matte Charcoal Black",
    "rating": 4.5,
    "reviews_count": 156,
    "image": "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80",
    "description": "Ergonomic molded footbed slide with adjustable dual buckles and impact-absorbing EVA sole.",
    "featured": False,
    "sales_count": 180
  }
]

INITIAL_ORDERS = [
  {
    "invoice_id": "INV-9821",
    "customer_name": "David Miller",
    "customer_phone": "+1 (555) 234-5678",
    "customer_email": "david.m@example.com",
    "date": "2026-08-01 11:30 AM",
    "subtotal": 209.98,
    "discount": 10.0,
    "discount_amount": 21.00,
    "tax": 34.02,
    "total": 223.00,
    "payment_method": "Credit Card",
    "status": "Completed",
    "items": [
      {"footwear_id": "SKU-1001", "name": "Air Stealth Pro Runner", "price": 149.99, "qty": 1, "size": 10},
      {"footwear_id": "SKU-1008", "name": "BreezeFlex Comfort Sandals", "price": 59.99, "qty": 1, "size": 10}
    ]
  },
  {
    "invoice_id": "INV-9820",
    "customer_name": "Sarah Jenkins",
    "customer_phone": "+1 (555) 876-5432",
    "customer_email": "sarah.j@example.com",
    "date": "2026-07-31 04:15 PM",
    "subtotal": 219.99,
    "discount": 5.0,
    "discount_amount": 11.00,
    "tax": 37.62,
    "total": 246.61,
    "payment_method": "UPI / Cash",
    "status": "Completed",
    "items": [
      {"footwear_id": "SKU-1002", "name": "Royal Oxford Italian Leather", "price": 219.99, "qty": 1, "size": 9}
    ]
  }
]

class Command(BaseCommand):
    help = "Seed initial footwear inventory and sample orders into Django SQLite database"

    def handle(self, *args, **options):
        self.stdout.write("Seeding Footwear items...")
        for data in INITIAL_INVENTORY:
            Footwear.objects.update_or_create(sku_id=data["sku_id"], defaults=data)

        self.stdout.write("Seeding sample Orders...")
        for odata in INITIAL_ORDERS:
            items_data = odata.pop("items")
            order, _ = Order.objects.update_or_create(invoice_id=odata["invoice_id"], defaults=odata)
            for it in items_data:
                OrderItem.objects.get_or_create(order=order, footwear_id=it["footwear_id"], size=it["size"], defaults=it)

        self.stdout.write(self.style.SUCCESS("Successfully seeded database!"))
