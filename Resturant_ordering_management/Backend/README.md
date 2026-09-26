# Ordering Website — Backend (SSR)

This folder contains the **SSR server source** used by TanStack Start:

- `server.ts` — server fetch handler
- `libs/` — error capture and error pages

It does **not** run standalone. Dependencies live in `../Frontend/node_modules`.

## Run the website

```bash
# From this folder
npm run dev

# Or from project root
cd ..
npm run dev
```

## Order API (MySQL / Express)

Checkout posts orders to the **shared admin API** at `../../Backend` (port 5000):

```bash
cd ../../Backend
npm run dev
```
