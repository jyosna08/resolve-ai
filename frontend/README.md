# ResolveAI Frontend

React 18 and Vite app for the ResolveAI customer portal and agent workspace. Requires Node.js 18 or newer.

```powershell
npm install
npm run dev
npm test
npm run build
```

Set `VITE_API_BASE_URL` to the API gateway URL; it defaults to `http://localhost:8080`. Copy `.env.example` to `.env` to override it locally.

```text
src/
├── api/          axiosClient, authApi, ticketApi, notificationApi
├── context/      AuthContext
├── hooks/        useAuth, useDebounce, useTickets, usePolling, useAlerts
├── routes/       AppRoutes, ProtectedRoute, PublicOnlyRoute
├── pages/        Login, Register, Dashboard, MyTickets, NotFound
├── components/   layout, common, auth, dashboard, tickets, copilot, customer, notifications
└── utils/        constants, validators, authStorage, jwt, errors, roleRoutes
```

- **CUSTOMER** lands on `/my-tickets`.
- **AGENT** and **ADMIN** land on `/dashboard`.
