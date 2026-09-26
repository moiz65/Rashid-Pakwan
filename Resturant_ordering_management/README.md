# Restaurant Ordering Website

Customer-facing ordering site. Same layout as the admin panel: **Frontend** + **Backend**.

| Folder | Purpose |
|--------|---------|
| `Frontend/` | React app — menu, cart, checkout (all npm packages here) |
| `Backend/` | SSR server source (built by Frontend Vite) |

The **order REST API** (MySQL) is the shared admin backend at `../Backend`.

## Setup (first time)

```bash
cd Resturant_ordering_management
npm run install:all
cp Frontend/.env.example Frontend/.env
```

## Run locally

**Terminal 1 — Admin API (orders database):**
```bash
cd Backend          # repo root Backend, NOT Resturant_ordering_management/Backend
npm run dev         # http://localhost:5000
```

**Terminal 2 — Ordering website:**
```bash
cd Resturant_ordering_management
npm run dev         # http://localhost:8080
```

You can also run from subfolders:
- `Resturant_ordering_management/Frontend` → `npm run dev`
- `Resturant_ordering_management/Backend` → `npm run dev` (delegates to Frontend)
