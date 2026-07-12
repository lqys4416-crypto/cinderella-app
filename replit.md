# Cinderella Team

نظام إدارة فريق التسويق والطلبات والعمولات — واجهة عربية فاخرة بألوان سوداء وذهبية.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port varies, managed by workflow)
- `pnpm --filter @workspace/cinderella-team run dev` — run the frontend (port varies, managed by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Default Accounts

- **Admin:** username `admin`, password `admin123`
- **Marketer 1:** username `sara`, password `marketer123`
- **Marketer 2:** username `fatima`, password `marketer123`
- **Marketer 3:** username `noor`, password `marketer123`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS (dark mode, RTL Arabic, Cairo font)
- API: Express 5 + JWT authentication (bcryptjs + jsonwebtoken)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Charts: Recharts
- Animations: Framer Motion

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — DB tables: users, products, orders, notifications
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware
- `artifacts/cinderella-team/src/` — React frontend

## Architecture decisions

- JWT stored in `localStorage` under key `cinderella_token`, sent as `Authorization: Bearer` header
- Commission auto-calculated on `orders.status → 'delivered'`: marketerProfit = productProfit × (commissionRate/100), companyProfit = remainder
- Marketer balance updated in real-time when order delivered
- Notifications created automatically for: new orders (admins notified), status changes (marketer notified), commissions (marketer notified), new products (all marketers notified)
- Admin sees all orders; marketers see only their own

## Product

- **Manager dashboard:** stat cards, charts, top marketers/products table
- **Marketer dashboard:** personal stats, recent orders, earnings summary
- **Order management:** full CRUD, status pipeline with 8 states, search/filter
- **Product catalog:** admin manages products with pricing and profit margins
- **Marketer management:** admin adds/edits/removes marketers, sets commission rates
- **Reports:** daily/weekly/monthly/yearly with charts and best performer stats
- **Notifications:** real-time in-app notifications for all key events

## User preferences

- Arabic RTL UI throughout — never use LTR for this project
- Dark luxury aesthetic: black + gold palette, glass-morphism cards
- No emojis in the UI

## Gotchas

- After schema changes, run `pnpm --filter @workspace/db run push` then restart the API server workflow
- After OpenAPI spec changes, run `pnpm --filter @workspace/api-spec run codegen` then rebuild frontend
- The API server must be running for login to work; JWT tokens expire in 7 days
