# Velux Gray Dashboard

Internal ops dashboard for Velux Gray luxury accessories. Inventory management, lead pipeline, and automated WhatsApp follow-up via Trigger.dev. Leads are generated from external landing pages and processed through a background workflow that notifies both the customer and the owner.

## Tech Stack

- **Next.js 16.x** · App Router · TypeScript strict mode
- **Tailwind CSS v4** · shadcn/ui (CLI latest)
- **Prisma ORM 7.x** → Supabase PostgreSQL · all DB reads/writes go through Prisma
- **Supabase Auth** + Supabase SSR · auth only — data queries go through Prisma
- **Supabase** · PostgreSQL · dashboard locked to owner only
- **Trigger.dev v4** · background jobs: lead processing, WhatsApp alerts, cron tasks
- **Zod** · request validation
- **TanStack Query v5** · React Hook Form · Recharts (analytics charts)

## Commands

```bash
npm run dev                                   # start dev server
npm run build                                 # production build
npx tsc --noEmit                              # type check
npm run lint                                  # lint

# Prisma
npx prisma migrate dev --name <name>          # create + apply migration
npx prisma generate                           # regenerate client after schema changes
npx prisma studio                             # visual DB browser

# Trigger.dev
npx trigger.dev@latest dev                   # run Trigger.dev worker locally
npx trigger.dev@latest deploy                # deploy tasks to Trigger.dev cloud

# shadcn
npx shadcn@latest add <component>             # add shadcn component
```

## Naming Conventions

- **Zod schemas + inferred types** → prefix with capital `Z`
  - e.g. `ZCreateProductSchema`, `ZCreateProduct`, `ZLeadWebhookPayload`
- **Server-only functions** (API handlers, Supabase admin queries, server actions) → prefix with `_`
  - e.g. `_getLeadsByProduct`, `_createLead`, `_updateLeadStatus`
- **Trigger.dev tasks** → kebab-case task IDs matching the file name
  - e.g. `on-new-lead`, `daily-summary`, `low-stock-check`
- **Components** → PascalCase
- **Hooks** → camelCase prefixed with `use`
- **TanStack Query keys** → `['resource', identifier]` e.g. `['leads', productId]`

## Folder Structure

Feature-based. No `src/` directory. All app code at project root. Cross-feature code goes in `shared/`. New features go in `features/<feature>/`.

```
/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # sign-in (owner only — no public registration)
│   ├── (dashboard)/                  # protected routes
│   │   ├── page.tsx                  # overview: KPIs, recent leads, stock alerts
│   │   ├── products/                 # product list, add/edit/archive
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── leads/                    # lead table: filter by product/status/state/date
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx         # lead detail: timeline, notes, status control
│   │   └── analytics/                # conversion rates, leads by state, trend charts
│   │       └── page.tsx
│   ├── api/                          # route handlers
│   │   ├── v1/
│   │   │   ├── products/
│   │   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   │   └── [id]/route.ts     # PATCH (update), DELETE (archive)
│   │   │   ├── leads/
│   │   │   │   ├── route.ts          # GET (list, filterable)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts      # GET (detail), PATCH (status/notes)
│   │   │   │       └── events/route.ts # GET (audit trail)
│   │   │   └── analytics/route.ts    # GET (aggregated stats)
│   │   └── webhooks/
│   │       └── lead/route.ts         # POST — public, called by landing pages
│   └── layout.tsx
│
├── features/
│   ├── products/
│   │   ├── components/               # ProductCard, ProductForm, InventoryBadge
│   │   ├── hooks/                    # useProducts, useCreateProduct, useUpdateProduct
│   │   ├── schemas/                  # ZCreateProductSchema, ZUpdateProductSchema
│   │   ├── server/                   # _getProducts, _createProduct, _updateProduct
│   │   └── types.ts
│   ├── leads/
│   │   ├── components/               # LeadTable, LeadFilters, LeadStatusBadge, LeadTimeline
│   │   ├── hooks/                    # useLeads, useLeadDetail, useUpdateLeadStatus
│   │   ├── schemas/                  # ZLeadWebhookPayload, ZUpdateLeadStatus
│   │   ├── server/                   # _getLeads, _getLeadById, _createLead, _updateLeadStatus
│   │   └── types.ts
│   ├── analytics/
│   │   ├── components/               # ConversionChart, LeadsByStateChart, TrendChart
│   │   ├── hooks/                    # useAnalytics
│   │   ├── server/                   # _getAnalytics
│   │   └── types.ts
│   └── auth/
│       └── components/
│
├── trigger/                          # Trigger.dev task definitions
│   ├── on-new-lead.ts                # main job: validate → insert → WhatsApp customer → alert owner
│   ├── daily-summary.ts              # 9am cron: yesterday's leads + conversions summary to owner
│   ├── low-stock-check.ts            # every 6hr cron: alert if any product < threshold
│   └── follow-up-reminder.ts         # if lead stays "fresh" > 24hr, alert owner
│
├── shared/
│   ├── components/
│   │   ├── ui/                       # shadcn/ui — DO NOT edit manually
│   │   └── layout/                   # Sidebar, Header, PageHeader, DataTable
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma singleton client
│   │   ├── supabase/
│   │   │   ├── client.ts             # browser client (auth only)
│   │   │   └── server.ts             # server client (auth only, cookies)
│   │   ├── trigger.ts                # Trigger.dev client singleton
│   │   ├── wasabi.ts                 # Wasabi WhatsApp API wrapper
│   │   ├── api-error.ts              # apiError(), apiValidationError() helpers
│   │   └── utils.ts                  # cn() and shared utilities
│   └── types/
│
├── providers/
│   └── query-provider.tsx            # TanStack QueryClientProvider
├── proxy.ts                          # protects all /(dashboard) routes (Next.js 16)
├── trigger.config.ts                 # Trigger.dev project config
├── prisma/
│   └── schema.prisma
└── prisma.config.ts                  # Prisma 7 config (replaces datasource in schema.prisma)
```

## Database Schema

All data goes through Prisma. Supabase is auth-only. RLS is enabled on all tables as a safety net, but the dashboard never queries Supabase directly for data.

```prisma
// prisma/schema.prisma

model Product {
  id                 String   @id @default(uuid())
  name               String
  sku                String?  @unique
  price              Decimal  @db.Decimal(10, 2)
  inventoryCount     Int      @default(0)
  lowStockThreshold  Int      @default(5)
  imageUrl           String?
  isActive           Boolean  @default(true)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  leads              Lead[]

  @@map("products")
}

model Lead {
  id             String    @id @default(uuid())
  productId      String
  customerName   String
  phone          String
  email          String?
  state          String?
  city           String?
  quantity       Int       @default(1)
  status         LeadStatus @default(FRESH)
  sourceUrl      String?
  notes          String?
  whatsappSent   Boolean   @default(false)
  triggerRunId   String?   // Trigger.dev run ID for tracing
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  product        Product        @relation(fields: [productId], references: [id])
  events         LeadEvent[]
  whatsappLogs   WhatsappLog[]

  @@map("leads")
}

model LeadEvent {
  id         String   @id @default(uuid())
  leadId     String
  oldStatus  String?
  newStatus  String?
  note       String?
  changedAt  DateTime @default(now())

  lead       Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@map("lead_events")
}

model WhatsappLog {
  id         String   @id @default(uuid())
  leadId     String
  direction  String   // outbound | inbound
  recipient  String
  message    String
  status     String   @default("sent") // sent | delivered | failed
  sentAt     DateTime @default(now())

  lead       Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@map("whatsapp_logs")
}

enum LeadStatus {
  FRESH
  CONTACTED
  CONVERTED
  LOST
}
```

**Inventory decrement rule:** Inventory only decrements when a lead's status is manually changed to `converted` from the dashboard. It never decrements on lead creation. Enforced in `_updateLeadStatus`.

## Lead Webhook Flow

```
Landing Page Form
      ↓
POST /api/webhooks/lead   ← public route, no auth, Zod-validated
      ↓
trigger.dev task fires: "on-new-lead"
  1. Duplicate check (same phone + product within 24hr → skip)
  2. Insert lead into Supabase
  3. Format + send WhatsApp to customer (Wasabi API)
  4. Send WhatsApp alert to owner
  5. Log both messages in whatsapp_logs
```

The webhook route does **only** payload validation and task trigger. All business logic lives in the Trigger.dev task.

## Version-Specific Notes

### Next.js 16.x
- `params` and `searchParams` in layouts and pages are **async** — always `await props.params`
- `proxy.ts` at project root replaces `middleware.ts` for route protection (Next.js 16)
- Turbopack is the default bundler — no extra config needed
- GET Route Handlers are **not cached by default** in Next.js 15+ — the webhook endpoint behaves correctly without extra config

### Prisma 7.x
- Ships as **ES module** — imports use `import` not `require`
- Database config moves to **`prisma.config.ts`** at project root instead of inline in `schema.prisma`
- Run `npx prisma generate` after every schema change — the client will silently be out of sync otherwise
- Use the Prisma singleton from `shared/lib/prisma.ts` — never instantiate `PrismaClient` directly in a feature file
- MongoDB not supported in v7 — not relevant here (PostgreSQL only)

### Supabase
- **Auth only** — never use the Supabase JS client for data queries. All DB reads/writes go through Prisma via `@/shared/lib/prisma`.
- Use the **new API key format**: publishable key (`sb_publishable_xxx`) client-side, secret key (`sb_secret_xxx`) server-side. Old anon/service_role keys work until end of 2026 but migrate now.
- `shared/lib/supabase/server.ts` — cookie-based server client, used only for `getUser()` in API routes and proxy.ts.
- Always use `getUser()` to validate sessions — never `getSession()` (it doesn't revalidate the token against the server).

### Trigger.dev v4
- Tasks live in the `trigger/` directory at the project root.
- Import `{ task, schedules }` from `@trigger.dev/sdk/v3`
- Use **idempotency keys** on `on-new-lead` to prevent duplicate processing from repeated form submissions
- Cron tasks use `schedules.task` — define schedule in `trigger.config.ts`
- Access task run ID via `context.run.id` and store it on the lead row for traceability
- The Vercel integration auto-deploys tasks on every push — no manual `trigger deploy` needed in CI

### TanStack Query v5
- Single object argument only: `useQuery({ queryKey: [...], queryFn: ... })`
- `cacheTime` renamed to `gcTime`
- Always create a custom hook per query or mutation — never call `useQuery`/`useMutation` directly in a component
  - Query hooks → `features/<feature>/hooks/use-<resource>.ts`
  - Mutation hooks → `features/<feature>/hooks/use-<verb>-<resource>.ts`
- Use `isPending` (not `isLoading`) for loading states. Render an inline skeleton — never return `null`.

### shadcn/ui
- `npx shadcn@latest add <component>` — never hand-write components that exist in shadcn
- Tailwind v4: config is in `globals.css`, not `tailwind.config.ts`
- Components live in `shared/components/ui/` — never edit directly

## Theme & Brand Tokens

Velux Gray is a premium accessories brand. The palette is cool and refined — deep graphite primary, warm brass accent, clean neutral surfaces.

```css
/* globals.css — semantic Tailwind v4 tokens */

/* Primary — Deep Graphite */
--color-primary: #1E1E24;              /* Void Graphite */
--color-primary-hover: #2C2C35;        /* Lifted Graphite */
--color-primary-active: #13131A;       /* Pressed Graphite */
--color-primary-foreground: #F8F7F5;   /* text on primary bg */

/* Accent — Warm Brass */
--color-accent: #B8924A;               /* Burnished Brass */
--color-accent-subtle: #F5EFE4;        /* Brass Tint — subtle accent bg */
--color-accent-foreground: #1E1E24;    /* text on accent bg */

/* Surfaces */
--color-background: #F4F3F0;           /* Warm Parchment — root page bg */
--color-card: #FFFFFF;                 /* Pure White — cards, inputs */
--color-surface-raised: #FAFAF8;       /* Lifted Surface — sidebar, panels */

/* Text */
--color-foreground: #18181B;           /* Obsidian — primary text */
--color-text-secondary: #52525B;       /* Cool Slate — secondary text */
--color-muted-foreground: #A1A1AA;     /* Pewter — placeholder, captions */

/* Borders */
--color-border: #E4E3DF;               /* Warm Stroke */
--color-border-strong: #C8C6C0;        /* Defined Stroke */

/* Lead Status Colors */
--color-status-fresh: #B8924A;         /* Brass — new lead */
--color-status-contacted: #3B7DD8;     /* Steel Blue — in progress */
--color-status-converted: #2D7A51;     /* Verdigris — success */
--color-status-lost: #A1A1AA;          /* Pewter — inactive */

/* Destructive */
--color-destructive: #C0392B;          /* Cinnabar */
--color-error-subtle: #FDF2F2;         /* Blush */
```

**Usage in components:**
- `bg-primary` / `text-primary` / `border-primary` → Void Graphite `#1E1E24`
- `hover:bg-primary-hover` → Lifted Graphite `#2C2C35`
- `bg-accent` → Burnished Brass `#B8924A` (use sparingly — badges, highlights, CTAs)
- `bg-accent-subtle` → Brass Tint `#F5EFE4` (lead status "fresh" bg, icon containers)
- `bg-background` → Warm Parchment `#F4F3F0` (page background)
- `bg-card` → Pure White `#FFFFFF` (cards, form inputs)
- `bg-surface-raised` → Lifted Surface `#FAFAF8` (sidebar, top nav)
- `text-foreground` → Obsidian `#18181B`
- `text-text-secondary` → Cool Slate `#52525B`
- `text-muted-foreground` → Pewter `#A1A1AA`
- `border-border` → Warm Stroke `#E4E3DF`
- `border-border-strong` → Defined Stroke `#C8C6C0`

IMPORTANT: Never hardcode hex values in components. Always use the semantic tokens above.

## API Layer

All internal API routes under `app/api/v1/`. The lead webhook lives separately at `app/api/webhooks/lead/` — it is **public** (no auth) and must be treated as untrusted input (validate everything with Zod).

### Route Handler Pattern (authenticated routes)

Every protected route follows the same four-step sequence:

1. **Auth** — call `createClient()` from `@/shared/lib/supabase/server` and `getUser()`. Return `apiError("unauthorized", ..., 401)` if missing.
2. **Validate** — parse request body with a `Z`-prefixed Zod schema using `.safeParse()`. Return `apiValidationError(parsed.error)` on failure (422).
3. **Delegate** — call the `_prefixed` server function from `features/<domain>/server/`.
4. **Respond** — return `NextResponse.json(result)` or catch and map to `apiError(...)`.

```typescript
export async function POST(request: Request) {
  // 1. Auth
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return apiError("unauthorized", "Unauthorized", 401);

  // 2. Validate
  const body = await request.json();
  const parsed = ZCreateProductSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  // 3. Delegate + 4. Respond
  try {
    const result = await _createProduct(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof AppError) return apiError(err.code, err.message, 403);
    return apiError("internal_error", "Internal server error", 500);
  }
}
```

### Webhook Route Pattern (public, no auth)

```typescript
// app/api/webhooks/lead/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ZLeadWebhookPayload.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  // Trigger the background task — do nothing else in this route
  await tasks.trigger("on-new-lead", parsed.data);
  return NextResponse.json({ received: true }, { status: 202 });
}
```

## Error Handling

All error responses use the shape defined in `shared/lib/api-error.ts`:

```typescript
{ error: { code: string; message: string; details?: unknown } }
```

| Helper | Usage |
|--------|-------|
| `apiError(code, message, status)` | Generic error |
| `apiValidationError(zodError)` | Zod parse failure — 422 with `details: err.flatten()` |

| Code | Status | Meaning |
|------|--------|---------|
| `unauthorized` | 401 | No valid Supabase session |
| `validation_error` | 422 | Zod schema parse failed |
| `not_found` | 404 | Resource not found |
| `bad_request` | 400 | Malformed request |
| `insufficient_stock` | 422 | Inventory count would go below 0 on conversion |
| `internal_error` | 500 | Unexpected server error |

## Critical Rules

IMPORTANT: Run `npx prisma generate` after every schema change — the client will silently be out of sync otherwise.

IMPORTANT: Never use the Supabase JS client for data queries. Supabase is auth-only. All DB reads/writes go through Prisma via `@/shared/lib/prisma`.

IMPORTANT: Never trust `userId` or any identifier from a request body. Always extract `userId` from the Supabase session in the API route.

IMPORTANT: The webhook route (`/api/webhooks/lead`) must only validate and trigger — never do business logic inline. All logic belongs in the Trigger.dev task.

IMPORTANT: Inventory only decrements on `status → converted`. Never decrement on lead creation. Enforce this in `_updateLeadStatus` with a stock check before any decrement.

IMPORTANT: Never edit files in `shared/components/ui/` directly. Add components with `npx shadcn@latest add <component>`.

IMPORTANT: All styling must use Tailwind utility classes in `className` — never the `style` prop.

IMPORTANT: Never hardcode hex color values in components. Always use the semantic tokens defined in `globals.css`.

IMPORTANT: Use `isPending` (not `isLoading`) as the loading indicator in TanStack Query v5. Always render an inline skeleton when pending — never return `null`.

IMPORTANT: Always use `getUser()` from Supabase Auth — never `getSession()`. `getSession()` does not revalidate the token against the server.

## Environment Variables

```
# Database (Prisma)
DATABASE_URL=                              # Supabase pooler (for queries)
DIRECT_URL=                                # Supabase direct (for migrations)

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=      # client-side (replaces anon key)
SUPABASE_SECRET_KEY=                       # server-side auth only (replaces service_role)

# Trigger.dev
TRIGGER_SECRET_KEY=

# Wasabi WhatsApp API
WASABI_API_URL=
WASABI_API_KEY=
WASABI_OWNER_PHONE=                        # your WhatsApp number for owner alerts

# App
NEXT_PUBLIC_APP_URL=                       # used to verify webhook origin if needed
```

## Workflow

- **Before any task**: check available skills — if a skill matches, invoke it first:
  - `frontend-design` — building or styling any UI component, page, or layout
  - `vercel-react-best-practices` — writing or reviewing React/Next.js code
  - `tanstack-query-best-practices` — writing or reviewing TanStack Query hooks
- **Before writing code**: check if there's an existing pattern in `features/` to follow
- **After schema changes**: run `prisma generate` then `tsc --noEmit` to verify types
- **After building a feature**: run `tsc --noEmit` and `npm run lint` before marking it done
- **New shadcn component**: `npx shadcn@latest add <component>`, never hand-write
- **UI icons**: always use `lucide-react` — never inline SVG, never other icon libraries
- **New Trigger.dev task**: create file in `trigger/`, export a `task()` with a kebab-case ID matching the filename, add it to `trigger.config.ts`

## When Compacting

Preserve: list of modified files, any pending Prisma migrations, current feature being built, any unresolved type errors, and the last Trigger.dev task tested locally.
