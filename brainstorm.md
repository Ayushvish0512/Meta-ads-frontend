Key Dashboard Components
KPI Grid — 6-8 summary cards: Total Spend, Total Impressions, Total Reach, Total Clicks, Avg CTR (%), Avg CPC ($), Total Leads, Total Purchases. These are aggregates queried from the DB with SUM()/AVG().
Time-Series Chart — Line chart showing daily spend, impressions, clicks over the date range. Query: SELECT date_start, SUM(spend), SUM(impressions), SUM(clicks) FROM campaigns GROUP BY date_start ORDER BY date_start.
Campaign Comparison Bar Chart — Horizontal bars comparing campaigns by spend (or toggle: impressions, leads, purchases). Sorted descending.
Campaign Data Table — Full sortable table with all 27 columns. Click a row to go to campaign detail. Supports pagination, column toggling, and CSV export.
Funnel Visualization — Conversion funnel: Clicks → Link Clicks (CTR) → Landing Page Views → Leads → Purchases. Shows conversion rates between each stage.
Action Breakdown — Parse the actions JSON column and aggregate action types across campaigns. Bar chart of top actions: post_engagement, video_view, landing_page_view, link_click, post_reaction, lead, purchase.
Date Range Picker — Let users filter everything by date_start / date_stop. Presets: Last 7 days, Last 30 days, Month-to-date, Custom range.
Campaign Detail Page — When clicking a campaign in the table: show the single campaign's full metric breakdown, trend over its date range, and the raw actions JSON for drilling into specific action types.
What metrics from the DB are most dashboard-worthy?
From the schema, the most useful for visualization:

Financial: spend, cpc, cpm, cost_per_lead, cost_per_purchase
Volume: impressions, reach, clicks, link_clicks
Engagement: video_views, post_engagement, landing_page_views
Conversions: leads, purchases, messaging_conversations
Rates: ctr, lead_conversion_rate, purchase_conversion_rate, click_to_landing_page_rate, frequency
Raw data: actions JSON — drill-down into specific action types
5. Development Order (MVP → Polished)
Phase 1 — Minimal Viable Dashboard (1-2 days):

FastAPI backend with /api/campaigns, /api/campaigns/summary, /api/campaigns/trends
Vite + React frontend with KPI grid + campaign table + basic line chart
Date range picker wired to all components
Phase 2 — Rich Analytics (1-2 days):

Campaign comparison chart, funnel visualization, action breakdown
Campaign detail page (click-through from table)
Export to CSV
Phase 3 — Polish & Ops (1 day):

Pagination on table, responsive layout, dark mode toggle
Basic auth if deploying externally
Health check endpoint + Docker setup
Summary Decision
Build a FastAPI backend (exposing the existing SQLite data via REST) + React/Vite/Tailwind frontend. No passkeys or complex auth needed for v1. The frontend communicates exclusively via HTTP API calls — browser JS cannot read .db files directly. The existing fetch.py/write_to_db.py scripts continue to run separately for data ingestion; the FastAPI layer is purely for serving data to the dashboard.



Passkeys solve "passwordless authentication for users." This is an internal analytics dashboard reading a local SQLite file. Passkeys would mean: implementing WebAuthn server-side, managing user registration, dealing with credential storage — all for a tool that reads a .db file nobody outside the team needs to access. Over-engineering. Skip auth entirely for v1; add Basic Auth if deploying publicly.

Why FastAPI (not plain Python HTTP server)?
Auto-generated /docs and /openapi.json — frontend knows exact API contract
Pydantic models give you typed responses and validation
Async support for concurrent campaign queries
Can still call the existing fetch.py / write_to_db.py logic directly
2. How the Frontend Reads the DB
It doesn't — the frontend never touches the .db file directly. The flow is:

[Browser] → HTTP API → [FastAPI] → sqlite3 → meta_ads.db
The existing fetch.py and write_to_db.py scripts already populate the DB. The FastAPI backend acts as a read-only API layer on top of it. You can either:

Import the existing modules — write_to_db.py already has create_database() and the schema; reuse it or refactor into a database/ package
Build a fresh FastAPI app that opens meta_ads.db with sqlite3 (or SQLModel/SQLAlchemy) and exposes endpoints
3. API Endpoint Design
The FastAPI backend should expose these endpoints (matching the planned api/routes/analytics.py and api/routes/insights.py):

GET  /api/health                    → { status: "ok" }
GET  /api/campaigns                 → paginated list with filters
GET  /api/campaigns/summary         → aggregated KPIs across all campaigns
GET  /api/campaigns/trends          → time-series (daily spend, impressions, etc.)
GET  /api/campaigns/{campaign_id}   → single campaign detail + actions breakdown
GET  /api/campaigns/{campaign_id}/trends → time series for one campaign
GET  /api/campaigns/actions         → aggregated action types (purchases, leads, video_views, etc.)
Query params for /api/campaigns:

date_start, date_stop — filter by date range
campaign_name — search/filter by name (partial match)
sort_by — spend, impressions, ctr, cpc, leads, purchases, etc.
order — asc / desc
Sample /api/campaigns/summary response:

{
  "total_spend": 142706.27,
  "total_impressions": 3766597,
  "total_reach": 1774232,
  "total_clicks": 37895,
  "total_leads": 1514,
  "total_purchases": 18,
  "avg_ctr": 0.59,
  "avg_cpc": 3.76,
  "avg_cpm": 37.92,
  "overall_ctr": 0.99,
  "roas": "<calculated>",
  "campaign_count": 8
}
4. Dashboard Brainstorm
Based on the actual data fields available, here's a practical dashboard layout:

Page Structure (matches Agent-do-not-read.md plan)
src/
├── pages/
│   ├── Dashboard.jsx       ← Main overview (KPI grid + charts)
│   ├── Campaigns.jsx       ← Full data table with sorting/filtering
│   ├── CampaignDetail.jsx  ← Single campaign deep-dive
│   └── Settings.jsx        ← Date range presets, data source info
├── components/
│   ├── KPIGrid.jsx         ← Summary cards (spend, impressions, CTR, CPC, etc.)
│   ├── PerformanceChart.jsx← Time-series line chart (spend/impressions over time)
│   ├── CampaignTable.jsx   ← Sortable, filterable data table
│   ├── FunnelChart.jsx     ← Clicks → Landing Pages → Leads → Purchases funnel
│   ├── ActionBreakdown.jsx ← Horizontal bar chart of Meta action types
│   ├── DateRangePicker.jsx ← Date filter widget
│   └── ExportButton.jsx    ← CSV/Excel download
└── services/
    └── api.js              ← Axios/Fetch wrapper with query builders
Dashboard Layout Wireframe
┌──────────────────────────────────────────────────────────────────┐
│  HEADER: Meta Ads Intelligence  |  DateRange | Export | Settings │
├──────────────────────────────────────────────────────────────────┤
│  KPI GRID (7 cards)                                                │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │
│  │Total│ │Impr-│ │ Total │ │ Avg  │ │ Avg  │ │ Total │ │Total  │  │
│  │Spend│ │ession│ │ Clicks │ │ CTR  │ │ CPC  │ │ Leads │ │Purch. │  │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘         │
├──────────────────────────────────────────────────────────────────┤
│  Performance Over Time (Line Chart) — Spend / Impressions / Clicks│
├──────┬────────────────────────────────────────────────────┐       │
│Camp.│ Performance Comparison (Bar Chart) — Spend, CPC, CTR│       │
│Table│ per Campaign                                  │       │
│     │                                                    │       │
│     │  ┌────────────────────────────────────────────┐    │       │
│     │  │ Funnel: Clicks → Landing → Leads → Purchases │    │       │
│     │  └────────────────────────────────────────────┘    │       │
│     │                                                    │       │
│     │  Action Breakdown (Bar Chart) — Top action types  │       │
│     │  ┌────────────────────────────────────────────┐    │       │
│     │  │ post_engagement, video_views, landing_page...│    │       │
│     │  └────────────────────────────────────────────┘    │       │
└─────┴────────────────────────────────────────────────────┘       │
