# Task 5a — analytics-real-data

## Task
Replace mock data in AnalyticsView.tsx with real data fetched from the database.

## Work Done

### 1. Created `/api/analytics/route.ts` (new file)
- GET endpoint that accepts `userId` query param
- Fetches ALL ContentAnalysis records for the user (no limit)
- Computes server-side:
  - `totalAnalyses`, `avgScore`, `bestScore`
  - `scoreDistribution` — counts analyses in 5 ranges (0-20, 21-40, 41-60, 61-80, 81-100)
  - `platformPerformance` — average score per platform, sorted by score desc
  - `weeklyTrend` — groups scores by ISO week, takes last 12 weeks, shows avg per week
  - `categoryBreakdown` — averages all 9 score dimensions (hook, engagement, shareability, retention, originality, audienceFit, emotionalImpact, contentQuality, trendAlignment), sorted by score desc
  - `topContent` — top 5 analyses by overallScore with title, platform, score, formatted date
  - `predictionAccuracy` — hardcoded 87 as placeholder
- Returns empty analytics (zeros/empty arrays) if no analyses exist
- Uses Prisma to query SQLite database

### 2. Rewrote `AnalyticsView.tsx`
- **Removed all mock data** (scoreDistribution, platformPerformance, weeklyTrend, categoryBreakdown, topContent, overviewStats)
- **Added `AnalyticsData` interface** matching the API response shape
- **Added real data fetching**: `useEffect` calls `GET /api/analytics?userId=XXX` on mount, using `useAppStore` user
- **Loading state**: Full skeleton UI with pulse-animated cards matching the layout (4 stat skeletons, 5 chart skeletons, 1 list skeleton)
- **Error state**: Red icon card with error message; shows "Sign In" button if no user
- **Empty state**: Floating animated BarChart3 icon, "No analytics yet" message, CTA button to navigate to Predict view (same style as LibraryView empty state)
- **Graceful chart empty states**: Platform Performance, Category Breakdown, and Score Trend each show a centered muted message when data arrays are empty (e.g., "Need more than one week of data")
- **All chart data driven by API response** — no hardcoded values
- **Preserved all existing styling**: wine/maroon dark theme, glass cards, tooltip styles, recharts configuration, Framer Motion staggered animations
- **Removed mock data disclaimer** at bottom
- **Removed unused imports** (Loader2, BarChart3Icon)

### 3. Verification
- `bun run lint` — zero errors
- Dev server compiles cleanly (confirmed via dev.log)

## Files Created
- `src/app/api/analytics/route.ts`

## Files Modified
- `src/components/app/AnalyticsView.tsx`
