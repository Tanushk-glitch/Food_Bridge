# FoodBridge

FoodBridge is a modern full-stack prototype built for a hackathon demo. It connects restaurants, NGOs, delivery partners, and admins around one food redistribution workflow.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style local components
- Lucide icons
- Framer Motion-ready UI patterns
- Prisma ORM
- PostgreSQL
- Google Maps API integration point

## Pages

- `/` landing page
- `/restaurant`
- `/ngo`
- `/delivery`
- `/impact`
- `/admin`

## Setup

1. Install dependencies with `npm install`
2. Add `.env` with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/foodbridge"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-key"
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run the app:

```bash
npm run dev
```

## Notes

- The project ships with rich demo data for dashboards.
- `app/api/donations/route.ts` exposes sample donation data for frontend demos.
- `components/ui/interactive-map.tsx` is styled as a Google Maps-ready shell for quick API wiring.
