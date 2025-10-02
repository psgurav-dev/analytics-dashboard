

git clone https://github.com/psgurav-dev/analytics-dashboard

# Scalable Analytics Dashboard

A production-quality analytics dashboard built with Next.js, React, and TypeScript. Demonstrates metrics visibility, performance (virtualized table), data correctness, optimistic updates, accessibility, and robust testing.

## 🚀 Live Demo
Deployed at: [https://analytics-dashboard-nu-seven.vercel.app/]

## 📹 Loom Walkthrough
[Loom Video](your-loom-link)

## ✨ Features
- **Dashboard Overview**: 4–6 metric cards (DAU, MAU, Total Users, Active Sessions) and a line chart for DAU over time
- **Global Filters**: Date range and platform (Web/iOS/Android) affect metrics, chart, and table
- **Large Data Table**: 50k+ rows, columns: user_id, page, timestamp, device, status
	- Column sorting, server-side filtering, pagination
	- Row selection with checkboxes
	- Bulk action: Mark as reviewed (optimistic update + rollback)
	- Virtualized smooth scrolling (react-window)
- **CSV Export**: Download filtered/selected rows as CSV (mock server-side streaming)
- **User Detail Drawer**: Click row to view user info (bonus)
- **Responsive & Accessible**: Mobile/desktop layouts, ARIA roles, keyboard navigation, focus management, color contrast
- **Testing**: Unit tests (Jest + RTL), integration test for filter → export/bulk action

## 🛠️ Getting Started
1. Clone: `git clone https://github.com/psgurav-dev/analytics-dashboard`
2. Install: `npm install`
3. Run dev server: `npm run dev`
4. Run tests: `npm test`

## 📁 Project Structure
- `app/` — Main pages & API routes (mock backend: pagination, filtering, sorting)
- `components/` — Dashboard, table, chart, filters, user drawer
- `lib/` — Data generation (50k+ rows), utilities


## 🧑‍💻 Design Decisions & Trade-offs
- **Mock Backend**: Next.js API routes simulate server-side pagination, filtering, sorting
- **Virtualization**: react-window for performance with large tables
- **Optimistic Updates**: UI updates immediately, rolls back on API failure
- **Accessibility**: ARIA, keyboard nav, focus management, color contrast
- **Testing**: Key components and flows covered

## ⚡ Performance & Accessibility
- Virtualized table, server-side pagination, caching
- Responsive layouts (mobile/desktop)
- ARIA roles, keyboard navigation, focus indicators
- Color contrast meets WCAG AA

## 📦 Scripts
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm start` — Start production server


## 📜 License
MIT License