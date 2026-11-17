# 06. UI/UX Flow & Component Design — ResolveAI

## 1. Navigation & User Journey

1. **Login / Register Screen (`/login`):** Role selector (`Customer` vs `Agent/Admin`) and JWT authentication.
2. **Customer Portal (`/my-tickets`):** Clean submission form ("Submit Issue") + list of personal tickets with live status badges.
3. **Agent Kanban Workspace (`/dashboard`):** Main operational dashboard matching our UI wireframe.

## 2. Dashboard Layout & Component Hierarchy

- **`Navbar`:** ResolveAI logo, global `Search` input, primary blue **`Submit Issue`** button, and Notification Bell icon (with unread critical count badge).
- **`KpiSummaryBar` (4 Cards):**
  1. `Total Open` (Blue indicator)
  2. `Critical Alerts` (Light red highlight card)
  3. `Resolved Today` (Green checkmark indicator)
  4. `SLA Warnings` (Amber clock indicator)
- **`KanbanBoard` (3 Columns):**
  - `TO DO` (with `+ Add Ticket` quick action)
  - `IN PROGRESS`
  - `RESOLVED`
  - Each `TicketCard` displays: Title, Color-coded Priority Pill (`CRITICAL` red, `HIGH` orange, `MEDIUM` blue, `LOW` green), Category Tag (`Billing`, `Technical`, `Frontend`, `DevOps`), and Sentiment Emoji.
- **`AiCoPilotDrawer` (Right Slide-Over Panel):**
  - Opens when clicking any `TicketCard`.
  - Displays Issue Title, Description, **AI Summary** bullet points, **Sentiment** indicator, **Editable Draft Response** textarea, and green **`Verify & Send Reply`** CTA button.

## 3. Mandatory Page States

Every view implements:

- **Loading State:** Skeleton cards / spinner while fetching API data.
- **Error State:** Dismissible alert banner with retry action on network/API failure.
- **Empty State:** Friendly illustration/message when a Kanban column has zero tickets.
- **Form Validation:** Client-side length checks before submitting issues or replies.

## 4. Frontend Architecture (React 18 + Vite + Tailwind CSS 3)

```text
frontend/src/
├── api/          axiosClient.js, authApi.js, ticketApi.js, notificationApi.js
├── context/      AuthContext.jsx
├── hooks/        useAuth.js, useDebounce.js, useTickets.js, ...
├── routes/       AppRoutes.jsx, ProtectedRoute.jsx, PublicOnlyRoute.jsx
├── pages/        LoginPage, RegisterPage, DashboardPage, MyTicketsPage, NotFoundPage
├── components/
│   ├── layout/     AppLayout, Navbar, NavbarSearch, UserMenu
│   ├── common/     Button, Spinner, Skeleton, ErrorBanner, EmptyState, Badge, FormField, Logo
│   ├── auth/       AuthLayout, LoginForm, RegisterForm, RoleSelector
│   ├── dashboard/  KpiSummaryBar, KpiCard, KanbanBoard, KanbanColumn, TicketCard
│   ├── tickets/    SubmitIssueModal, PriorityBadge, CategoryTag, SentimentIcon
│   └── copilot/    AiCoPilotDrawer and its sub-sections
└── utils/        constants.js, validators.js, authStorage.js, jwt.js, errors.js, roleRoutes.js
```

Rules: one component per file; pages only compose components; components never call `axios` directly (they use `api/` modules or hooks); no raw status/role/priority strings (use `utils/constants.js`).

## 5. Routes & Access

| Route                 | Access           | Notes                                        |
| :-------------------- | :--------------- | :------------------------------------------- |
| `/login`, `/register` | Public only      | Logged-in users are redirected to their home |
| `/dashboard`          | `AGENT`, `ADMIN` | Kanban workspace                             |
| `/my-tickets`         | `CUSTOMER`       | Submit Issue + own tickets                   |
| `/`                   | Any              | Redirects by role, or to `/login`            |

## 6. Session Handling (MVP)

- Login response (`token`, `userId`, `fullName`, `role`) is stored in `localStorage` under `resolveai.session`, only through `utils/authStorage.js`.
- The JWT `exp` claim is checked on app load; an expired token clears the session.
- Any `401` from the API (except login/register calls) clears the session and redirects to `/login`.
- Production note: `localStorage` is XSS-readable; move to HttpOnly cookies if the threat model requires it.

## 7. Design Tokens (from the approved mockup)

- Page background light gray; white cards with rounded corners and a subtle border.
- Primary/brand blue for **Submit Issue**; green for **Verify & Send Reply**; the AI Co-Pilot drawer uses a violet border and sparkle icon.
- Priority pills: `CRITICAL` red, `HIGH` orange, `MEDIUM` blue, `LOW` green. Column headers: TO DO gray, IN PROGRESS yellow, RESOLVED green.
- Sentiment emoji: `FRUSTRATED` 😠 and `POSITIVE` 🙂 are shown on cards; `NEUTRAL` shows no emoji.

## 8. Behaviour Decisions

- Status changes happen from the drawer buttons (no drag-and-drop in the MVP). A `RESOLVED` ticket opens read-only with its comments.
- The AI summary from the API is a single string and is rendered as one bullet.
- Board search is server-side (`?search=`) with a 400 ms debounce. KPI cards and the board refresh every 30 seconds and after every action.
- The `CUSTOMER` role never calls `/api/notifications/**` (it returns 403 for them).

## 9. Customer Portal, Submit Issue & Alerts (Behaviour)

- **Submit Issue** (navbar button for every role, and "+ Add Ticket" on the board): modal with `title` (5–200) and `description` (10–2000), live character counters. Submission can take up to ~20 seconds because of AI triage, so the button shows "Analyzing with AI…" and the modal cannot be closed while submitting. On success the modal closes, a dismissible notice shows the new ticket id, AI priority and category, and the current page refreshes.
- **My Tickets (`/my-tickets`, CUSTOMER):** the customer's own tickets, newest first, with status tabs (All / To Do / In Progress / Resolved), a loading skeleton, an error banner with retry, an empty state ("Submit your first issue") and a 30-second refresh. Opening a ticket shows title, description, status, created time and the agent replies (comments). **AI summary, AI draft, sentiment and SLA data are never shown to customers.**
- **Notification bell (AGENT, ADMIN only):** badge = number of active (unacknowledged) alerts from `GET /api/notifications/alerts`, refreshed every 30 seconds. The dropdown lists each alert (type `CRITICAL_ESCALATION` or `SLA_BREACH`, ticket title, message, time) with **Acknowledge** and **View ticket**. Acknowledge removes the alert immediately (rolled back if the API call fails). **View ticket** opens `/dashboard?ticket=<id>`, which opens that ticket's drawer and then clears the parameter.
- Customers never call `/api/notifications/**`.

## 10. Time Handling

- Every timestamp from the API is UTC without a zone suffix. The frontend parses them only through `utils/dateTime.js` (`parseApiDateTime`), which treats a value with no `Z` or offset as UTC, and then displays it in the viewer's local time zone.
- SLA countdowns ("Due in 5h 20m" / "Overdue by 2h 10m") are computed from the parsed UTC instant, so they are correct in any time zone.
- Server-side "Resolved Today" uses the server's UTC date, so the day boundary follows UTC (accepted for the MVP).
