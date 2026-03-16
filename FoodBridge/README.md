# FoodBridge

FoodBridge is organized into clear application layers:

- `frontend/` - Next.js UI
- `backend/` - Node.js API server
- `database/` - Prisma schema and migrations

It connects restaurants, NGOs, delivery partners, and admins around one food redistribution workflow.

## Stack

- Next.js 14 App Router
- TypeScript
- Node.js HTTP API
- Tailwind CSS
- shadcn/ui-style local components
- Lucide icons
- Framer Motion-ready UI patterns
- Prisma ORM
- SQLite
- Google Maps API integration point

## Setup

1. Install dependencies with `npm install`
2. Configure environment files:
   - `frontend/.env`
   - `backend/.env`
3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run the backend:

```bash
npm run dev:backend
```

5. Run the frontend:

```bash
npm run dev:frontend
```

## Notes

- The frontend proxies `/api/*` requests to the backend via `frontend/next.config.mjs`.
- Prisma schema and migrations live in `database/prisma`.
- `frontend/components/ui/interactive-map.tsx` is styled as a Google Maps-ready shell for quick API wiring.
