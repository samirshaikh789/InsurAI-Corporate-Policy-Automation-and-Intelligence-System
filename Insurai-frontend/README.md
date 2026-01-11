## InsurAI Frontend

This React + Vite project powers the InsurAI corporate policy automation and intelligence experience. It ships a single-page layout with role-based entry points for administrators, agents, HR staff, and employees while connecting to the shared API defined in `api.js`.

### Features

- Role-aware dashboards (Admin, Agent, HR, Employee) with charts, tables, and PDF/export helpers.
- Authentication scaffolding for all major user types plus password reset flows.
- Interactive charts and reports from Chart.js, Recharts, and Chart.js wrappers.
- Productivity helpers such as CSV exports, PDF generation, and document previews.

### Stack & Tooling

- React 19 + React Router 6 for navigation
- Vite for fast dev server and build output
- Bootstrap 5 + Lucide icons for consistent layouts
- Axios for API requests, Framer Motion for micro-interactions
- ESLint plus React Hooks/Refresh plugins enforced via the `npm run lint` script

### Getting started

1. Install Node 18+ and clone the repository.
2. Run `npm install` to pull dependencies.
3. Use `npm run dev` to start the local server (hot reload enabled).
4. Point `api.js` at your backend (or mock it) before testing role-specific flows.

### Scripts

- `npm run dev` — start Vite in development mode with hot reload.
- `npm run build` — bundle the app for production output (`dist/`).
- `npm run preview` — serve the production build locally.
- `npm run lint` — run ESLint across the `src/` tree.

### Project layout

- `src/main.jsx` wires up React Router and renders the app.
- `src/App.jsx` defines the shared page shell and navigation.
- `src/pages` holds all route-based screens (auth, dashboards, etc.).
- `src/assets` and CSS files store static visuals and global styles.
- `api.js` centralizes the Axios configuration so every page can call the same API base URL.

### Notes

- Keep OAuth/API tokens in your environment; the frontend expects `api.js` to expose the correct base URL.
- Run `npm run lint` before commits to keep the code style consistent.
