# UI Dashboard Notes

## New pages
- `/`: cinematic landing page with animated storytelling and CTA into product flows.
- `/dashboard`: premium analytics cockpit with AI insights, trends, goal tracker, nudges, and timeline.
- `/transactions`: import, filters, quality metrics, and responsive transactions table.
- `/settings`: preferences/privacy placeholder.

## Component map
- Layout: `Header`, `Sidebar`, `BottomNav`
- FX: `AnimatedBackdrop`
- Charts: `MonthlyTrendChart`, `SpendingBarChart`
- Cards: `InsightCard`, `MetricCard`, `GoalCard`
- Widgets: `NudgePanel`, `TimelineCard`
- Transactions: `TxTable`
- Data: `services/api.js`, `hooks/useFetch.js`

## Run locally
```bash
npm install
npm install chart.js react-chartjs-2
npm install classnames
npm run dev
```

## Free asset suggestions
- Icons: Heroicons
- Font: Inter
