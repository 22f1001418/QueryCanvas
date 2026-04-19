# SQL Visualizer

An interactive visualization tool for learning SQL concepts. Step through queries visually — watch rows highlight, filter, sort, group, and join in real time.

Built with React 18, TypeScript, Vite 6, Tailwind CSS, and Framer Motion. Styled as a macOS-native app with a warm white palette.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (hot reload at localhost:5173)
npm run dev

# Production build → dist/
npm run build

# Preview production build
npm run preview
```

Requires Node.js 18+.

---

## What It Covers

The app walks through 11 core SQL topics, each on its own interactive page with step-by-step animations, syntax-highlighted queries, and color-coded table visualizations.

### Basics

| Page | Concepts | What you see |
|------|----------|--------------|
| **SELECT** | `*`, column selection, `DISTINCT`, `LIMIT`, `OFFSET` | Cells highlight as columns/rows are selected |
| **WHERE** | `=`, `>`, `BETWEEN`, `IN`, `LIKE`, `IS NULL`, `AND`/`OR` | Matching rows glow green, filtered rows fade with strikethrough |
| **ORDER BY** | `ASC`, `DESC`, multi-column sort, date sorting | Rows animate into their new sorted positions |

### Grouping

| Page | Concepts | What you see |
|------|----------|--------------|
| **Aggregations** | `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `COUNT(*)` vs `COUNT(col)` | Visual "8 rows → 1 row" collapse with the computed value |
| **GROUP BY** | `GROUP BY`, `HAVING`, `WHERE` vs `HAVING` | Rows color-coded by group, groups collapse into aggregate results |

### Combining

| Page | Concepts | What you see |
|------|----------|--------------|
| **JOINs** | `INNER`, `LEFT`, `RIGHT`, `FULL OUTER`, `CROSS` | Dual tables with matched/unmatched row highlighting, NULL fills visible |
| **Set Operations** | `UNION`, `UNION ALL`, `INTERSECT`, `EXCEPT` | Two sets with Venn-diagram-style coloring showing overlap |

### Advanced

| Page | Concepts | What you see |
|------|----------|--------------|
| **Subqueries** | Scalar, column, correlated subqueries | 3-panel pipeline: inner query → filter application → final result |
| **CTEs** | `WITH`, chained CTEs, `RECURSIVE` | Step-by-step CTE pipeline with arrows between intermediate tables |
| **Window Functions** | `ROW_NUMBER`, `RANK`, `SUM() OVER`, `LAG`, `PARTITION BY` | Partition-colored rows, new window column highlighted |
| **CASE WHEN** | Bucketing, conditional aggregation, tier labels | Badge-colored tiers appear as the CASE expression evaluates |

---

## Project Structure

```
sql-viz/
├── index.html                  # Entry HTML
├── package.json
├── vite.config.ts              # Vite 6 + React plugin
├── tsconfig.json               # Strict mode, bundler resolution
├── tailwind.config.js          # Custom tokens, Mac shadows, animations
├── postcss.config.js           # Tailwind + Autoprefixer
├── public/
│   └── vite.svg                # Favicon
└── src/
    ├── main.tsx                # React 18 createRoot entry
    ├── App.tsx                 # Layout: top bar + sidebar + page router
    ├── index.css               # CSS variables, table styles, cell states
    ├── store.ts                # Zustand store (page, sidebar state)
    ├── components/
    │   ├── MacWindow.tsx       # macOS window chrome (traffic lights, title)
    │   ├── SqlTable.tsx        # Data table with cell highlighting + Framer Motion rows
    │   ├── CodeBlock.tsx       # Syntax-highlighted SQL via prism-react-renderer
    │   ├── AnimationControls.tsx  # Play/pause/step/reset toolbar
    │   └── Sidebar.tsx         # Navigation grouped by category
    ├── data/
    │   └── sampleData.ts       # employees, departments, orders, customers tables
    ├── hooks/
    │   └── useAnimation.ts     # Step counter with auto-play interval
    └── pages/
        ├── SelectPage.tsx
        ├── WherePage.tsx
        ├── OrderByPage.tsx
        ├── AggregationsPage.tsx
        ├── GroupByPage.tsx
        ├── JoinsPage.tsx
        ├── SubqueriesPage.tsx
        ├── CTEPage.tsx
        ├── WindowPage.tsx
        ├── CasePage.tsx
        └── SetsPage.tsx
```

---

## How the Visualizations Work

Each page follows the same pattern:

1. **Sample data** lives in `sampleData.ts` — small, readable tables (employees, departments, orders, customers) designed so every query produces interesting results.

2. **Step definitions** are arrays of objects describing each animation frame: the SQL string, which rows/columns to highlight, and the expected result.

3. **`useAnimation` hook** manages a step counter with play/pause/reset. It drives a `setInterval` for auto-play; Framer Motion handles the visual interpolation between steps.

4. **`SqlTable` component** renders any `TableData` with optional cell styling (highlight, join-left, join-right, selected, new, removed), column highlighting, row filtering, and animated row enter/exit via `AnimatePresence`.

5. **`CodeBlock` component** syntax-highlights the SQL for the current step using `prism-react-renderer`, with optional line highlighting to draw attention to the active clause.

---

## Design Decisions

**Mac window chrome** — Every table and code block sits inside a `MacWindow` component with traffic light dots and a centered title. This gives visual structure without requiring users to context-switch between separate panels.

**Warm white palette** — CSS custom properties (`--surface-0` through `--surface-3`) define a cream/linen color system. No dark mode — the warm tones reduce eye strain while keeping contrast high for data tables.

**Cell state classes** — Eight cell states (`highlight`, `join-left`, `join-right`, `join-match`, `null`, `selected`, `new`, `removed`) cover every visualization need. They're defined as plain CSS classes in `index.css` and applied via a `cellStyles` record keyed by `"rowIndex-colIndex"`.

**Zustand over Context** — The global store holds just three values (page, sidebar, theme). Zustand's selector pattern (`useStore(s => s.page)`) avoids unnecessary re-renders, and at 1KB it adds no meaningful bundle weight.

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.3 | Component model |
| framer-motion | 11.x | Row animations, page transitions, AnimatePresence |
| zustand | 5.x | Global state (1KB, no boilerplate) |
| prism-react-renderer | 2.4 | SQL syntax highlighting |
| lucide-react | 0.468 | Icon set (inline SVG, tree-shakeable) |
| tailwindcss | 3.4 | Utility-first styling |
| vite | 6.x | Dev server + production bundler |
| typescript | 5.6 | Type safety |

---

## Adding a New SQL Topic

1. Create `src/pages/NewTopicPage.tsx` following the existing pattern:
   - Define a `steps` array with `sql`, `desc`, and result/highlight data
   - Use `useAnimation(steps.length - 1)` for step control
   - Compose `MacWindow` + `CodeBlock` + `SqlTable` + `AnimationControls`

2. Add the page to `src/store.ts`:
   - Add the ID to the `PageId` union type
   - Add a `NavItem` entry in `navItems`

3. Import and register in `src/App.tsx`:
   - Import the component
   - Add it to `pageComponents`

No routing library needed — the sidebar sets `page` in Zustand, and `App.tsx` renders the matching component.

---

## License

MIT