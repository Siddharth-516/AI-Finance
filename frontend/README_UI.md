# UI Dashboard Notes

## New pages
- `/dashboard`: Overview cards, monthly trend chart, AI insight stack, category spending chart, transaction table.
- `/transactions`: SMS import workflow, transaction list, filter/search.
- `/settings`: Preferences and privacy placeholder.

## Component map
- Layout: `Header`, `Sidebar`, `BottomNav`
- Charts: `MonthlyTrendChart`, `SpendingBarChart`
- Cards: `InsightCard`
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
