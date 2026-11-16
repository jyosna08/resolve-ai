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
