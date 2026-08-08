export const INITIAL_INVENTORY = [
  {
    id: "SKU-1001",
    name: "Air Stealth Pro Runner",
    category: "Sneakers",
    brand: "A.S Apex",
    price: 149.99,
    cost: 85.00,
    stock: 24,
    minStock: 8,
    sizes: [7, 8, 9, 10, 11, 12],
    color: "Midnight Black / Neon Orange",
    rating: 4.9,
    reviewsCount: 128,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
    description: "Ultra-lightweight mesh upper with max-cushion responsive foam technology for peak urban performance.",
    featured: true,
    salesCount: 142
  },
  {
    id: "SKU-1002",
    name: "Royal Oxford Italian Leather",
    category: "Formal Leather",
    brand: "A.S Heritage",
    price: 219.99,
    cost: 120.00,
    stock: 5,
    minStock: 10,
    sizes: [8, 9, 10, 11],
    color: "Mahogany Tan",
    rating: 5.0,
    reviewsCount: 84,
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80",
    description: "Handcrafted full-grain Italian leather Oxfords with Goodyear welted leather soles and hand-stitched detailing.",
    featured: true,
    salesCount: 89
  },
  {
    id: "SKU-1003",
    name: "VaporFly Velocity Trainer",
    category: "Sports & Athletics",
    brand: "A.S Apex",
    price: 129.99,
    cost: 70.00,
    stock: 18,
    minStock: 10,
    sizes: [6, 7, 8, 9, 10, 11],
    color: "Electric Cyan / White",
    rating: 4.8,
    reviewsCount: 210,
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80",
    description: "High-traction rubber outsole engineered for high-intensity training, sprinting, and court agility.",
    featured: true,
    salesCount: 195
  },
  {
    id: "SKU-1004",
    name: "Monarch Leather Chelsea Boots",
    category: "Boots",
    brand: "A.S Heritage",
    price: 189.99,
    cost: 105.00,
    stock: 3,
    minStock: 8,
    sizes: [8, 9, 10, 11, 12],
    color: "Dark Espresso Leather",
    rating: 4.9,
    reviewsCount: 67,
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
    description: "Timeless Chelsea boot silhouette with elastic side goring and weather-resistant treated genuine leather.",
    featured: true,
    salesCount: 76
  },
  {
    id: "SKU-1005",
    name: "UrbanGlide Low Streetwear",
    category: "Sneakers",
    brand: "A.S Street",
    price: 110.00,
    cost: 55.00,
    stock: 32,
    minStock: 12,
    sizes: [7, 8, 9, 10, 11],
    color: "Chalk White / Vintage Slate",
    rating: 4.7,
    reviewsCount: 312,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    description: "Retro basketball inspired low-top sneaker with reinforced suede overlays and padded collar.",
    featured: false,
    salesCount: 230
  },
  {
    id: "SKU-1006",
    name: "Grand Tourer Suede Loafers",
    category: "Casual & Loafers",
    brand: "A.S Heritage",
    price: 139.99,
    cost: 72.00,
    stock: 0,
    minStock: 6,
    sizes: [8, 9, 10, 11],
    color: "Sand Suede",
    rating: 4.6,
    reviewsCount: 45,
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
    description: "Soft velvet suede slip-on driving shoe with flexible pebble tread sole for unmatched comfort.",
    featured: false,
    salesCount: 54
  },
  {
    id: "SKU-1007",
    name: "Highland Trek Tactical Boot",
    category: "Boots",
    brand: "A.S Apex",
    price: 175.00,
    cost: 95.00,
    stock: 14,
    minStock: 8,
    sizes: [9, 10, 11, 12],
    color: "Olive Drab / Charcoal",
    rating: 4.8,
    reviewsCount: 92,
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
    description: "Heavy-duty outdoor hiking and tactical boots with waterproof membrane and steel shank arch support.",
    featured: false,
    salesCount: 68
  },
  {
    id: "SKU-1008",
    name: "BreezeFlex Comfort Sandals",
    category: "Sandals & Slides",
    brand: "A.S Casual",
    price: 59.99,
    cost: 25.00,
    stock: 45,
    minStock: 15,
    sizes: [7, 8, 9, 10, 11],
    color: "Matte Charcoal Black",
    rating: 4.5,
    reviewsCount: 156,
    image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80",
    description: "Ergonomic molded footbed slide with adjustable dual buckles and impact-absorbing EVA sole.",
    featured: false,
    salesCount: 180
  }
];

export const INITIAL_ORDERS = [
  {
    id: "INV-9821",
    customerName: "David Miller",
    customerPhone: "+1 (555) 234-5678",
    customerEmail: "david.m@example.com",
    date: "2026-08-01 11:30 AM",
    items: [
      { id: "SKU-1001", name: "Air Stealth Pro Runner", price: 149.99, qty: 1, size: 10 },
      { id: "SKU-1008", name: "BreezeFlex Comfort Sandals", price: 59.99, qty: 1, size: 10 }
    ],
    subtotal: 209.98,
    discount: 10, // percentage
    discountAmount: 21.00,
    tax: 0,
    total: 188.98,
    paymentMethod: "Credit Card",
    status: "Completed"
  },
  {
    id: "INV-9820",
    customerName: "Sarah Jenkins",
    customerPhone: "+1 (555) 876-5432",
    customerEmail: "sarah.j@example.com",
    date: "2026-07-31 04:15 PM",
    items: [
      { id: "SKU-1002", name: "Royal Oxford Italian Leather", price: 219.99, qty: 1, size: 9 }
    ],
    subtotal: 219.99,
    discount: 5,
    discountAmount: 11.00,
    tax: 0,
    total: 208.99,
    paymentMethod: "UPI / Cash",
    status: "Completed"
  },
  {
    id: "INV-9819",
    customerName: "Robert Thorne",
    customerPhone: "+1 (555) 345-6789",
    customerEmail: "r.thorne@example.com",
    date: "2026-07-30 02:45 PM",
    items: [
      { id: "SKU-1003", name: "VaporFly Velocity Trainer", price: 129.99, qty: 2, size: 11 },
      { id: "SKU-1005", name: "UrbanGlide Low Streetwear", price: 110.00, qty: 1, size: 11 }
    ],
    subtotal: 369.98,
    discount: 10,
    discountAmount: 37.00,
    tax: 0,
    total: 332.98,
    paymentMethod: "Debit Card",
    status: "Completed"
  }
];

export const STORE_INFO = {
  name: "A.S Footwear Co.",
  tagline: "Stepping into Excellence Since 2012",
  phone: "9845088426",
  email: "asfootwear655@gmail.com",
  salesEmail: "asfootwear655@gmail.com",
  address: "Anjanapura Main Rd, Beershwar Nagar, New Bank Colony, Konankunte, Bengaluru 560062",
  hours: {
    weekdays: "Mon - Sat: 9:30 AM - 9:00 PM",
    sunday: "Sun: 11:00 AM - 7:00 PM"
  },
  socials: {
    instagram: "@asfootwear_official",
    facebook: "facebook.com/ASFootwearOfficial",
    twitter: "@AS_Footwear"
  }
};
