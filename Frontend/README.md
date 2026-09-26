# Savory Admin — Restaurant Management Portal

A frontend-only React admin dashboard for restaurant management with mock data and localStorage persistence.

## Tech Stack

- **React** + **Vite**
- **Redux Toolkit** + **redux-persist** (localStorage)
- **React Router v6**
- **shadcn/ui** + **Tailwind CSS**
- **Recharts** for analytics

## Login

The app starts at `/login`. Demo credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@restaurant.com | admin123 |
| Manager | sarah@restaurant.com | manager123 |
| Staff | mike@restaurant.com | staff123 |

Auth state is stored in Redux (`authSlice`) and persisted to localStorage.

## Getting Started

```bash
cd Frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Features

- **Dashboard** — KPIs, revenue charts, recent orders, top products
- **Orders** — Upcoming & rejected orders with status management
- **Customers** — Customer list with order history
- **Products** — Full CRUD for products, categories, brands, reviews
- **Abandoned Carts** — Recovery actions (mock email)
- **Reports** — Sales charts + CSV export
- **Marketing** — Coupons, discounts, offers
- **Settings** — Payment gateways, shipping, users & roles

## Data Persistence

All data is stored in `localStorage` under key `restaurant-admin-store`. Use **Settings → Users & Roles → Reset Demo Data** to restore mock data.

## Theme

Light/dark mode toggle in the header. Warm amber primary palette with restaurant-focused design.
