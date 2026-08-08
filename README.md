# A.S Footwear — Storefront & POS

A premium footwear storefront, point-of-sale (POS) and inventory management system with an embedded AI shopping assistant (**ASbot**). Built as a React + Vite frontend backed by a Django REST API.

> **Real-world project:** this system was built to solve a real business problem — automating the day-to-day operations of a footwear store that was previously run on spreadsheets, paper bills and manual stock counts. It replaces hours of repetitive admin work with a single, always-available dashboard so the owner can spend their time serving customers instead of managing paperwork.

---

## 🎯 The Problem It Solves

Running a footwear business manually is slow and error-prone. This project automates the full lifecycle of a small retail operation:

- **Manual inventory tracking** → live stock levels, SKUs, low-stock alerts and one-click restocking. No more guessing what's in the back room.
- **Paper billing** → digital orders with automatic totals, printable / downloadable PDF invoices, and a full digital history of every sale.
- **No visibility into performance** → built-in analytics (revenue, top sellers, average order value, units sold) with daily, weekly, monthly, yearly and custom date-range views.
- **Time lost to questions** → **ASbot**, an AI assistant trained on the store's live data, answers stock, order and invoice queries instantly — for staff and customers — without hunting through files.
- **No internet? No problem** → offline-first design keeps the store running even when the network or server is down; changes sync back automatically when online.

The result: the business runs faster, decisions are based on real data, and the owner saves hours every week.

## ✨ Features

- **3D Storefront** — interactive 3D shoe viewer, catalogue with search and filtering, premium landing page.
- **Inventory POS** — add / edit / delete / restock items, low-stock alerts, SKU tracking, cost vs. price margins.
- **Billing & Invoices** — create orders, auto-compute totals, print or download polished PDF invoices.
- **Analytics dashboard** — revenue, average order value, top sellers, units sold — daily, weekly, monthly, yearly or a custom date range.
- **Order history** — full digital log of every sale with search by invoice ID or customer.
- **ASbot AI assistant** — answers stock, order, invoice and analytics questions using live store data (powered by Groq's LLM API, with an offline fallback so it works even without a backend).
- **Staff login** — admin-only access to POS / billing / analytics via a discreet footer link.
- **Offline-first** — admin changes are mirrored to `localStorage`, so the app keeps working even when the API is unreachable; the backend remains the source of truth when online.

## 🛠 Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, Vite 6, Tailwind CSS, Three.js (3D viewer), jsPDF (invoices) |
| Backend  | Django, Django REST Framework, SQLite, CORS headers |
| AI       | Groq API (`llama-3.3-70b-versatile`) |

## 📁 Project Structure

```
ASfootwear/
├── backend/               # Django REST API
│   ├── backend/           #   project settings (urls, wsgi, settings)
│   ├── store/             #   app: models, views, serializers, security
│   │   ├── middleware.py  #     admin-token auth + rate limiting
│   │   └── security.py    #     HMAC token issuing/verification
│   └── requirements.txt
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── components/    #   LandingPage, Inventory, Invoice, Analytics,
│   │   │                  #   History, Alerts, ASbot, SignInModal, ...
│   │   ├── services/      #   api, auth, chat, pdf
│   │   └── data/          #   seed mock data
│   └── public/            #   3D shoe model assets
└── .gitignore
```

## 🚀 Getting Started

### 1. Backend (Django API on `http://localhost:8000`)

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # then fill in your values
python manage.py migrate
python manage.py seed_data        # optional: load sample inventory + orders
python manage.py runserver
```

### 2. Frontend (Vite dev server on `http://localhost:3000`)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

### 3. ASbot (AI assistant)

ASbot needs a Groq API key. Create one at [console.groq.com](https://console.groq.com), then set it in `backend/.env`:

```env
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

Without a key, ASbot automatically falls back to an offline mode that answers simple stock / order questions locally.

## 🔐 Environment Variables

### `frontend/.env`

```env
VITE_API_URL=http://localhost:8000/api   # optional — defaults to this
```

### `backend/.env`

```env
DJANGO_SECRET_KEY=change-me-to-a-long-random-string
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
ADMIN_USERNAME=admin
ADMIN_PASSWORD=12345
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
```

> Set `DJANGO_DEBUG=False` and a strong `DJANGO_SECRET_KEY` / `ADMIN_PASSWORD` in production.

### Default staff credentials

```
Username: admin
Password: 12345
```

Sign in via the **Staff Login** link in the footer. (Server-side token auth protects all inventory/order writes; reads stay public for shoppers.)

## 🔌 API Overview

| Endpoint            | Method | Auth      | Description                     |
|---------------------|--------|-----------|---------------------------------|
| `/api/inventory/`   | GET    | public    | List footwear                  |
| `/api/inventory/`   | POST   | staff     | Create item                    |
| `/api/inventory/{id}/` | PUT / DELETE | staff | Update / remove item      |
| `/api/inventory/{id}/restock/` | POST | staff | Restock an item       |
| `/api/orders/`      | GET    | public    | List orders                    |
| `/api/orders/`      | POST   | staff     | Create order                   |
| `/api/orders/{id}/` | PATCH / DELETE | staff | Update / delete order     |
| `/api/chat/`        | POST   | public    | ASbot conversation             |
| `/api/auth/login/`  | POST   | public    | Exchange credentials for token |

Mutating requests must send `Authorization: Bearer <token>`, obtained from `/api/auth/login/`. Rate limiting is applied to the login and chat endpoints.

## 🔒 Security

- Server-side admin auth with **HMAC-signed tokens** (12-hour expiry) — admin password is never trusted from the client alone.
- **Rate limiting** on login (10 / 5 min) and chat (30 / min).
- Secrets read from environment variables — **no API keys in the repo**.
- Django security headers (`X-Frame-Options`, `referrer-policy`, nosniff), configurable `DEBUG` / `ALLOWED_HOSTS`.
- Django admin panel disabled (not used by the app).

## 🌐 Deployment

### 1. Backend → PythonAnywhere (free, permanent — recommended)

PythonAnywhere is the best **free + permanent** home for this app: web apps stay up 24/7 (no idle spin-down), and the SQLite file persists — no ephemeral-filesystem data loss like on Render's free tier.

1. **Create an account** at [pythonanywhere.com](https://www.pythonanywhere.com) (free). Your site URL is `https://<username>.pythonanywhere.com`.
2. **Web tab → Add a new web app → Manual configuration → Python 3.12.** Leave defaults; you'll edit the WSGI file next.
3. **Consoles tab → Bash**, then upload the code and install:

   ```bash
   cd ~
   git clone https://github.com/<your-github>/ASfootwear.git
   cd ASfootwear/backend
   python3.12 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Create `backend/.env` with production values (the app auto-reads it):

   ```env
   DJANGO_SECRET_KEY=<long-random-string>
   DJANGO_DEBUG=False
   DJANGO_ALLOWED_HOSTS=your-username.pythonanywhere.com
   ADMIN_PASSWORD=<strong-password>
   GROQ_API_KEY=gsk_your_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

5. **Web tab → Code → WSGI configuration file** — replace the contents with:

   ```python
   import os, sys
   project = '/home/<username>/ASfootwear/backend'
   if project not in sys.path:
       sys.path.insert(0, project)
   os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
   from django.core.wsgi import get_wsgi_application
   application = get_wsgi_application()
   ```

   Then under **Virtualenv** enter `/home/<username>/ASfootwear/backend/venv`.

6. **Static files** (for Django admin assets): add a mapping **URL** `/static/` → **Directory** `/home/<username>/ASfootwear/backend/staticfiles/`.
7. Back in the Bash console, migrate + seed + collect static:

   ```bash
   source venv/bin/activate
   python manage.py migrate
   python manage.py seed_data
   python manage.py collectstatic --noinput
   ```

8. **Web tab → Reload**. Your API is live at `https://<username>.pythonanywhere.com/api` with HTTPS (enable **Force HTTPS** under the HTTPS section).

> **Alternative (Render free):** Render auto-detects `backend/render.yaml` (New → Blueprint). Note the free tier **sleeps when idle** and its filesystem is ephemeral — SQLite data is lost on restart, so it's only suitable for demos.

### 2. Frontend → Netlify (already deployed)

1. In the Netlify site **Site configuration → Environment variables**, add:

   ```
   VITE_API_URL=https://<username>.pythonanywhere.com/api
   ```

2. Trigger a redeploy (**Deploys → Trigger deploy → Clear cache and deploy site**). The new value is baked into the build.

### 3. Verify

- Open the deployed site → admin login → **ASbot** → ask *"how much revenue have we made?"* → the badge should show **GROQ ONLINE**.
- Test one inventory write (e.g. restock) — the data now syncs to the live Django database instead of only `localStorage`.

### Domain

- Point a custom domain (e.g. `.in` via BigRock / GoDaddy / Hostinger) at Netlify; set `DJANGO_ALLOWED_HOSTS` to your API domain (`<username>.pythonanywhere.com`).

## 📄 License

Private project — all rights reserved. Contact the owner before reuse.
