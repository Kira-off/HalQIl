# STEP PROMPT TEMPLATE
# Version: 1.0 | Type: Universal Agent Prompt Engine
# Purpose: Professional, context-rich step prompt for AI-assisted development workflows

---

## ════════════════════════════════════════
## [ROLE & OBJECTIVE]
## ════════════════════════════════════════

You are a **Senior Full-Stack Engineer** working inside a structured, rule-based project.
Your job is to execute exactly ONE atomic step — no more, no less.
Read all sections carefully before writing a single line of code.

---

## ════════════════════════════════════════
## [ACTIVE CONTEXT — CHECKPOINT]
## ════════════════════════════════════════

```
Project       : {PROJECT_NAME}
Phase         : {PHASE_NUMBER} — {PHASE_NAME}
Current Step  : {STEP_ID} — {STEP_NAME}
Previous Step : {PREV_STEP_ID} ✅ Completed
Build Status  : {GREEN | RED}
Last Lint     : {PASS | FAIL}
```

### Critical files created so far:
```
{FILE_PATH_1}   → {ONE_LINE_DESCRIPTION}
{FILE_PATH_2}   → {ONE_LINE_DESCRIPTION}
{FILE_PATH_3}   → {ONE_LINE_DESCRIPTION}
```

### Active constraints from ruleset:
```
- {RULE_1}
- {RULE_2}
- {RULE_3}
```

---

## ════════════════════════════════════════
## [THIS STEP — FULL SPECIFICATION]
## ════════════════════════════════════════

### Step ID   : {STEP_ID}
### Step Name : {STEP_NAME}

---

### 📁 Files to create / modify:

| Action   | File Path                          | Description                        |
|----------|------------------------------------|------------------------------------|
| CREATE   | `{FILE_PATH}`                      | {WHAT_THIS_FILE_DOES}              |
| CREATE   | `{FILE_PATH}`                      | {WHAT_THIS_FILE_DOES}              |
| MODIFY   | `{FILE_PATH}`                      | {WHAT_CHANGES_AND_WHY}             |

---

### 🛠 Stack & Tools:

```
Language    : {TypeScript | JavaScript | ...}
Framework   : {Next.js 14 App Router | React | ...}
State       : {Zustand | Redux | Context | ...}
Data Fetch  : {TanStack Query | SWR | Axios | ...}
Validation  : {Zod | Yup | React Hook Form | ...}
Realtime    : {WebSocket | Socket.io | SSE | ...}
Styling     : {Tailwind | CSS Modules | ...}
Testing     : {Jest | Vitest | Playwright | ...}
```

---

### 📤 Expected Output:

```
{COMPONENT_OR_HOOK_NAME}
  ├── {exported function / hook / type 1}  →  {what it does}
  ├── {exported function / hook / type 2}  →  {what it does}
  └── {exported function / hook / type 3}  →  {what it does}

API Contract:
  {METHOD} {ENDPOINT}  →  {request shape}  →  {response shape}
```

---

### ✅ Definition of Done (DoD):

Every item below must be true before this step is considered complete:

- [ ] `npm run lint` — **zero errors, zero warnings**
- [ ] `npm run build` — **exits with code 0**
- [ ] {FUNCTIONAL_CHECK_1}
- [ ] {FUNCTIONAL_CHECK_2}
- [ ] {ROLE_GUARD_CHECK} — e.g. "USER role cannot access /admin"
- [ ] `CONTEXT_CHECKPOINT.md` updated with this step's result

---

## ════════════════════════════════════════
## [CONSTRAINTS — DO NOT VIOLATE]
## ════════════════════════════════════════

```
❌ Do NOT create files outside the defined file list above
❌ Do NOT install new packages without stating them first
❌ Do NOT modify files from previous steps unless listed under MODIFY
❌ Do NOT skip lint/build check before marking step complete
❌ Do NOT proceed to next step without updating CHECKPOINT
```

---

## ════════════════════════════════════════
## [SIGN-OFF REQUEST]
## ════════════════════════════════════════

After completing all DoD items:

1. Run `npm run lint` → paste result
2. Run `npm run build` → paste result
3. Update `CONTEXT_CHECKPOINT.md`
4. Reply with:

```
✅ Step {STEP_ID} — COMPLETE
Build  : Green
Lint   : Clean
Next   : Step {NEXT_STEP_ID} — {NEXT_STEP_NAME}
Ready for sign-off.
```

---
---
---

# ══════════════════════════════════════════════════════
# FILLED EXAMPLE — Step 2.2 (Global Store & API Setup)
# ══════════════════════════════════════════════════════

## [ROLE & OBJECTIVE]

You are a **Senior Full-Stack Engineer** working inside a structured, rule-based project.
Execute exactly ONE atomic step — Step 2.2 — and nothing else.

---

## [ACTIVE CONTEXT — CHECKPOINT]

```
Project       : ServiceMarketplace
Phase         : 2 — Frontend Testing Suite
Current Step  : 2.2 — Global Store & API Setup
Previous Step : 2.1 ✅ Plan created & approved
Build Status  : GREEN
Last Lint     : PASS
```

### Critical files created so far:
```
/CONTEXT_CHECKPOINT.md          → Project memory & phase tracker
/prompt engines/STRICT_RULES.txt → Agent ruleset (read-only)
/prompt engines/AGENTS.md        → Agent behavior definitions
```

### Active constraints from ruleset:
```
- One atomic step at a time
- npm run lint + npm run build must pass after every step
- CONTEXT_CHECKPOINT.md must be updated before sign-off
```

---

## [THIS STEP — FULL SPECIFICATION]

### Step ID   : 2.2
### Step Name : Global Store & API Setup

---

### 📁 Files to create / modify:

| Action | File Path                            | Description                                  |
|--------|--------------------------------------|----------------------------------------------|
| CREATE | `store/useAppStore.ts`               | Zustand global store — roles, notifications, activeOrders |
| CREATE | `lib/api/client.ts`                  | Axios instance with auth headers & interceptors |
| CREATE | `lib/socket/socketManager.ts`        | WebSocket connect/disconnect/event manager   |
| CREATE | `types/index.ts`                     | Shared TypeScript types (User, Order, Role, Notification) |

---

### 🛠 Stack & Tools:

```
Language    : TypeScript
Framework   : Next.js 14 App Router
State       : Zustand ^4.x
Data Fetch  : Axios ^1.x
Realtime    : native WebSocket (browser)
Styling     : —
Testing     : —
```

---

### 📤 Expected Output:

```
useAppStore()
  ├── user: User | null               →  authenticated user object
  ├── role: 'USER'|'PROVIDER'|'SUPER_ADMIN'|null
  ├── notifications: Notification[]   →  real-time notification list
  ├── activeOrders: Order[]           →  orders in progress
  ├── setUser(user)                   →  login action
  ├── clearUser()                     →  logout action
  └── addNotification(n)             →  push new notification

socketManager
  ├── connect(token: string): void    →  opens WS, attaches listeners
  ├── disconnect(): void              →  closes WS cleanly
  └── on(event, handler): void        →  registers event handler

API Contract:
  GET  /auth/me          →  {}            →  User
  GET  /notifications    →  {}            →  Notification[]
  GET  /orders/active    →  {}            →  Order[]
```

---

### ✅ Definition of Done (DoD):

- [ ] `npm run lint` — zero errors, zero warnings
- [ ] `npm run build` — exits with code 0
- [ ] `useAppStore()` returns correct shape in browser console
- [ ] `role` switches correctly between USER / PROVIDER / SUPER_ADMIN
- [ ] `socketManager.connect()` opens WS without console errors
- [ ] `socketManager.disconnect()` closes cleanly (no memory leak)
- [ ] All types exported from `types/index.ts` — no `any` used
- [ ] `CONTEXT_CHECKPOINT.md` updated

---

## [CONSTRAINTS — DO NOT VIOLATE]

```
❌ Do NOT create UI components in this step
❌ Do NOT modify /CONTEXT_CHECKPOINT.md structure, only append
❌ Do NOT use `any` type anywhere
❌ Do NOT install packages beyond Zustand + Axios (already in package.json)
❌ Do NOT proceed to Step 2.3 without sign-off
```

---

## [SIGN-OFF REQUEST]

After completing all DoD items:

1. Run `npm run lint` → paste result
2. Run `npm run build` → paste result
3. Update `CONTEXT_CHECKPOINT.md`
4. Reply with:

```
✅ Step 2.2 — COMPLETE
Build  : Green
Lint   : Clean
Next   : Step 2.3 — Catalog & Provider Pages
Ready for sign-off.
```