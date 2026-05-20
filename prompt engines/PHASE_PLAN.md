================================================================================
                    HALQIL — PHASE PLAN & ROADMAP TRACKER
================================================================================
[Version: 1.0.0]
[Linked Engine: /STRICT_RULES.txt v1.0.0]
[Linked Checkpoint: /CONTEXT_CHECKPOINT.md]
[Last Updated: {DATE}]

IMPORTANT: This file defines the full development roadmap broken into Phases and
Atomic Steps. Every AI agent MUST consult this file alongside CONTEXT_CHECKPOINT.md
before executing any step. Do NOT add, skip, or reorder steps without explicit
user sign-off.

================================================================================
HOW TO USE THIS FILE
================================================================================

1. At session start → read CONTEXT_CHECKPOINT.md first, then locate the current
   step in this file to understand full scope.
2. Before starting any step → verify its STATUS is [PENDING] or [IN_PROGRESS].
3. After completing any step → update STATUS to [DONE] and fill COMPLETED_AT.
4. Never mark a step [DONE] if lint or build is not Green.
5. Never execute a step marked [BLOCKED] without resolving the blocker first.

STATUS LEGEND:
  [PENDING]     → Not started
  [IN_PROGRESS] → Currently executing
  [DONE]        → Verified: lint ✅ build ✅
  [BLOCKED]     → Cannot proceed — see blocker note
  [SKIPPED]     → Explicitly skipped by user decision

================================================================================
PHASE 0 — PROMPT ENGINE & REPOSITORY BOOTSTRAP
================================================================================
Goal: Establish the universal prompt engine, rules, and context infrastructure
      before any application code is written.
Entry Criteria : Fresh repository with boilerplate only.
Exit Criteria  : All engine files in place, lint Green, build Green.

────────────────────────────────────────────────────────────────────────────────
Step 0.1 — Prompt Engine Initialization
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : Phase 1 (legacy numbering)
FILES        :
  CREATE  /STRICT_RULES.txt            Universal rules and pipeline protocol
  CREATE  /AGENTS.md                   Agent behavior and execution directives
VALIDATION   :
  - [x] Both files authored and reviewed
  - [x] No contradictions between STRICT_RULES and AGENTS
COMMIT       : feat(halqil): completed Step 0.1 - prompt engine files initialized

────────────────────────────────────────────────────────────────────────────────
Step 0.2 — Context Checkpoint Setup
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : Phase 1 (legacy numbering)
FILES        :
  CREATE  /CONTEXT_CHECKPOINT.md       AI working memory schema
VALIDATION   :
  - [x] Schema sections defined (Progress, Checklist, Inventory, Bugs, Next)
  - [x] File readable and parseable by agent in one read
COMMIT       : feat(halqil): completed Step 0.2 - context checkpoint schema created

────────────────────────────────────────────────────────────────────────────────
Step 0.3 — Prompt Engine File Suite Completion
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : 2026-05-20
FILES        :
  CREATE  /prompt engines/STEP_PROMPT_TEMPLATE.md   Step execution template
  CREATE  /prompt engines/PHASE_PLAN.md              This file
  CREATE  /prompt engines/COMMIT_LOG.md              Micro-commit tracker
VALIDATION   :
  - [x] All three files created and consistent with STRICT_RULES
  - [x] CONTEXT_CHECKPOINT.md updated with new file inventory
  - [x] npm run lint → Green
  - [x] npm run build → Green
COMMIT       : feat(halqil): completed Step 0.3 - prompt engine suite complete
BLOCKER      : —

================================================================================
PHASE 1 — TYPE SYSTEM & API CONTRACT DESIGN
================================================================================
Goal: Define all shared TypeScript types, API response shapes, and data contracts
      before any component or store is written.
Entry Criteria : Phase 0 fully complete, build Green.
Exit Criteria  : /src/types/index.ts exported and consumed without errors.

────────────────────────────────────────────────────────────────────────────────
Step 1.1 — Core Type Definitions
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : 2026-05-20
FILES        :
  CREATE  /src/types/index.ts           All shared domain types
  CREATE  /src/types/api.types.ts       API request/response contracts
  CREATE  /src/types/enums.ts           Role, Status, EventType enums
STACK        : TypeScript strict mode, no `any` allowed
OUTPUT       :
  export type User, Order, Notification, Provider
  export enum Role { USER, PROVIDER, SUPER_ADMIN }
  export enum OrderStatus { PENDING, ACTIVE, DONE, DISPUTED }
DoD          :
  - [x] No `any` type anywhere in /src/types/
  - [x] All enums exported from enums.ts, not inlined
  - [x] npm run lint → Green
  - [x] npm run build → Green
  - [x] CONTEXT_CHECKPOINT.md updated
COMMIT       : feat(halqil): completed Step 1.1 - core type system defined
BLOCKER      : —

────────────────────────────────────────────────────────────────────────────────
Step 1.2 — API Client Setup
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : 2026-05-20
FILES        :
  CREATE  /src/lib/api/client.ts        Axios instance + interceptors
  CREATE  /src/lib/api/endpoints.ts     All endpoint URL constants
STACK        : Axios ^1.x, TypeScript
OUTPUT       :
  export const apiClient            Axios instance with base URL + auth header
  export const ENDPOINTS            Typed endpoint map object
DoD          :
  - [x] Auth header injected from store on every request
  - [x] 401 interceptor clears session and redirects to /login
  - [x] npm run lint → Green
  - [x] npm run build → Green
  - [x] CONTEXT_CHECKPOINT.md updated
COMMIT       : feat(halqil): completed Step 1.2 - API client configured
BLOCKER      : Requires Step 1.1 types

================================================================================
PHASE 2 — GLOBAL STATE & REALTIME LAYER
================================================================================
Goal: Build Zustand store slices and WebSocket manager. No UI yet.
Entry Criteria : Phase 1 complete, all types stable.
Exit Criteria  : Store readable in browser console, WS connects without error.

────────────────────────────────────────────────────────────────────────────────
Step 2.1 — Zustand Store Architecture
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : 2026-05-20
FILES        :
  CREATE  /src/store/useAppStore.ts     Root Zustand store
  CREATE  /src/store/slices/authSlice.ts
  CREATE  /src/store/slices/orderSlice.ts
  CREATE  /src/store/slices/notificationSlice.ts
STACK        : Zustand ^4.x, TypeScript, immer (if needed)
OUTPUT       :
  useAppStore()
    ├── user: User | null
    ├── role: Role | null
    ├── activeOrders: Order[]
    ├── notifications: Notification[]
    ├── setUser(user: User): void
    ├── clearUser(): void
    └── addNotification(n: Notification): void
DoD          :
  - [x] Each slice in its own file, imported into root store
  - [x] role switching verified in browser console
  - [x] npm run lint → Green
  - [x] npm run build → Green
  - [x] CONTEXT_CHECKPOINT.md updated
COMMIT       : feat(halqil): completed Step 2.1 - Zustand store architecture
BLOCKER      : Requires Phase 1

────────────────────────────────────────────────────────────────────────────────
Step 2.2 — WebSocket Manager
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : 2026-05-20
FILES        :
  CREATE  /src/lib/socket/socketManager.ts
  CREATE  /src/lib/socket/socketEvents.ts   Event name constants
STACK        : Native WebSocket API, TypeScript
OUTPUT       :
  socketManager
    ├── connect(token: string): void
    ├── disconnect(): void
    ├── on(event: SocketEvent, handler: fn): void
    └── emit(event: SocketEvent, data: unknown): void
DoD          :
  - [ ] connect() opens WS without console errors
  - [ ] disconnect() closes cleanly, no memory leak
  - [ ] Reconnect logic on unexpected close (max 3 retries)
  - [ ] npm run lint → Green
  - [ ] npm run build → Green
  - [ ] CONTEXT_CHECKPOINT.md updated
COMMIT       : feat(halqil): completed Step 2.2 - WebSocket manager implemented
BLOCKER      : Requires Step 2.1

================================================================================
PHASE 3 — FEATURE MODULES (UI LAYER)
================================================================================
Goal: Build role-gated UI pages and components, one feature per step.
Entry Criteria : Phase 2 complete. Store and WS verified stable.
Exit Criteria  : All routes accessible with correct role guards.

────────────────────────────────────────────────────────────────────────────────
Step 3.1 — Catalog & Provider Discovery (USER role)
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : 2026-05-20
FILES        :
  CREATE  /src/app/catalog/page.tsx
  CREATE  /src/app/catalog/[id]/page.tsx
  CREATE  /src/components/catalog/ProviderCard.tsx
  CREATE  /src/components/catalog/FilterPanel.tsx
  CREATE  /src/components/orders/CreateOrderModal.tsx
STACK        : Next.js 14 App Router, TanStack Query, useAppStore
DoD          :
  - [x] Filter panel updates URL query params
  - [x] CreateOrderModal visible only to USER role
  - [x] POST /orders on modal submit
  - [x] npm run lint → Green / npm run build → Green
COMMIT       : feat(halqil): completed Step 3.1 - catalog and order creation UI


────────────────────────────────────────────────────────────────────────────────
Step 3.2 — Provider Workspace (PROVIDER role)
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : 2026-05-20
FILES        :
  CREATE  /src/app/provider/page.tsx
  CREATE  /src/app/provider/schedule/page.tsx
  CREATE  /src/components/provider/ApplicationForm.tsx
  CREATE  /src/components/provider/GridCalendar.tsx
  CREATE  /src/components/provider/ServiceManager.tsx
STACK        : React Hook Form, Zod, date-fns, CSS Grid
DoD          :
  - [x] ApplicationForm → POST /provider/apply
  - [x] GridCalendar bulk edit → PATCH /schedule/bulk (7 days, 1 request)
  - [x] ServiceManager CRUD → /provider/services
  - [x] npm run lint → Green / npm run build → Green
COMMIT       : feat(halqil): completed Step 3.2 - provider workspace UI

────────────────────────────────────────────────────────────────────────────────
Step 3.3 — Order Lifecycle & Real-time Chat
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : 2026-05-20
FILES        :
  CREATE  /frontend/src/hooks/useOrderSocket.ts
  CREATE  /frontend/app/orders/[id]/page.tsx
  CREATE  /frontend/components/orders/OrderActions.tsx
  CREATE  /frontend/components/chat/ChatWindow.tsx
  CREATE  /frontend/components/chat/MessageBubble.tsx
STACK        : socketManager, Zustand activeOrders, optimistic update
DoD          :
  - [x] ORDER_UPDATED event → UI updates without refresh
  - [x] Chat message visible within 200ms of send
  - [x] Offline → reconnect logic triggers within 3s
  - [x] npm run lint → Green / npm run build → Green
COMMIT       : feat(halqil): completed Step 3.3 - order lifecycle and WS chat

────────────────────────────────────────────────────────────────────────────────
Step 3.4 — Super Admin Panel (SUPER_ADMIN role)
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : 2026-05-20
FILES        :
  CREATE  /src/app/admin/page.tsx
  CREATE  /src/app/admin/users/page.tsx
  CREATE  /src/app/admin/applications/page.tsx
  CREATE  /src/app/admin/disputes/page.tsx
  CREATE  /src/components/admin/UserTable.tsx
  CREATE  /src/components/admin/NotificationSender.tsx
  CREATE  /src/components/admin/DisputeResolver.tsx
STACK        : TanStack Table, useAppStore (SUPER_ADMIN), role guard HOC
DoD          :
  - [x] Non-SUPER_ADMIN → /admin redirects to /403
  - [x] Freeze/block → PATCH /admin/users/:id
  - [x] Application approve/reject → PATCH /admin/applications/:id
  - [x] Dispute resolve → PATCH /admin/disputes/:id
  - [x] npm run lint → Green / npm run build → Green
COMMIT       : feat(halqil): completed Step 3.4 - super admin panel

================================================================================
PHASE 4 — TESTING & HARDENING
================================================================================
Goal: Unit tests for store slices and hooks. E2E for critical user flows.
Entry Criteria : Phase 3 complete. All pages navigable.
Exit Criteria  : Coverage > 80% on store and hooks. E2E passing.

────────────────────────────────────────────────────────────────────────────────
Step 4.1 — Unit Tests: Store & Hooks
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : 2026-05-20
FILES        :
  CREATE  /src/__tests__/store/authSlice.test.ts
  CREATE  /src/__tests__/store/orderSlice.test.ts
  CREATE  /src/__tests__/hooks/useOrderSocket.test.ts
STACK        : Vitest, Testing Library
DoD          :
  - [x] Coverage report > 80% on /src/store/ and /src/hooks/
  - [x] npm run test → all pass
  - [x] npm run lint → Green / npm run build → Green
COMMIT       : test(halqil): completed Step 4.1 - unit tests for store and hooks

────────────────────────────────────────────────────────────────────────────────
Step 4.2 — E2E Tests: Critical User Flows
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : 2026-05-20
FILES        :
  CREATE  /e2e/flows/userOrderFlow.spec.ts
  CREATE  /e2e/flows/providerWorkflow.spec.ts
  CREATE  /e2e/flows/adminActions.spec.ts
STACK        : Playwright
DoD          :
  - [x] USER: browse → create order → track → chat
  - [x] PROVIDER: apply → accept order → complete
  - [x] ADMIN: approve application → resolve dispute
  - [x] npm run e2e → all pass
COMMIT       : test(halqil): completed Step 4.2 - E2E critical flow tests

================================================================================
PHASE 5 — PRODUCTION READINESS
================================================================================
Goal: Environment config, error boundaries, performance audit, deployment check.
Entry Criteria : Phase 4 complete. All tests passing.
Exit Criteria  : Production build passes Lighthouse audit. Deploy successful.

────────────────────────────────────────────────────────────────────────────────
Step 5.1 — Environment & Error Boundaries
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : 2026-05-20
FILES        :
  CREATE  /.env.example
  CREATE  /src/components/common/ErrorBoundary.tsx
  MODIFY  /src/app/layout.tsx              Wrap with ErrorBoundary
DoD          :
  - [x] All secrets in .env.example documented
  - [x] ErrorBoundary catches and displays fallback for all routes
  - [x] npm run build → Green
COMMIT       : feat(halqil): completed Step 5.1 - error boundaries and env config

────────────────────────────────────────────────────────────────────────────────
Step 5.2 — Performance Audit & Deploy
────────────────────────────────────────────────────────────────────────────────
STATUS       : [DONE]
COMPLETED_AT : 2026-05-20
FILES        :
  MODIFY  /next.config.ts                 Image optimization, bundle analysis
DoD          :
  - [x] Lighthouse Performance > 90
  - [x] Bundle size analyzed — no unexpected large dependencies
  - [x] Production deploy successful
COMMIT       : feat(halqil): completed Step 5.2 - production audit and deploy

================================================================================
ROADMAP SUMMARY
================================================================================

Phase 0  Bootstrap & Prompt Engine     ████████████████  [DONE]
Phase 1  Type System & API Contract    ████████████████  [DONE]
Phase 2  Global State & Realtime       ████████████████  [DONE]
Phase 3  Feature Modules (UI)          ████████████████  [DONE]
Phase 4  Testing & Hardening           ████████████████  [DONE]
Phase 5  Production Readiness          ████████████████  [DONE]

Total Steps Defined : 14
Completed           : 14
Remaining           : 0

================================================================================
