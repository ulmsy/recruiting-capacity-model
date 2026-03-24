# Recruiting Capacity Model

An interactive, public-facing web app for planning and stress-testing recruiting capacity.
Edit any assumption and all outputs recalculate instantly.

![Screenshot](docs/screenshot.png)

---

## Features

| Feature | Details |
|---|---|
| **Real-time recalculation** | Every change (recruiter count, attrition rate, etc.) instantly updates all outputs |
| **By-function breakdown** | Add, edit, or delete recruiting functions (Tech, Business, Sales, …) |
| **Summary cards** | Total demand, total capacity, net gap/surplus, recruiter headcount |
| **Charts** | Demand vs Capacity grouped bars + Gap/Surplus waterfall, tabbed |
| **Editable assumptions** | Global workforce settings & per-recruiter productivity rates |
| **Formula reference** | Expandable panel showing every calculation used |
| **Scenario save/load** | Auto-saves to `localStorage`; import/export full scenarios as JSON |
| **CSV export** | Download the full by-function table as a spreadsheet |

---

## Formulas

```
AttritionHires     = totalEmployees × (attritionRate / 100)
TotalDemand        = Σ plannedHires + attritionHires + openRoles

Per function:
  share            = fn.plannedHires / Σ plannedHires
  attritionShare   = attritionHires × share
  openRolesShare   = openRoles × share
  totalDemand      = plannedHires + attritionShare + openRolesShare
  ftCapacity       = ftRecruiterCount × ftProductivity
  contractCapacity = contractRecruiterCount × contractProductivity
  totalCapacity    = ftCapacity + contractCapacity
  gap              = totalCapacity − totalDemand   (+ = surplus, − = gap)
```

---

## Project Structure

```
recruiting-capacity-model/
├── src/
│   ├── types/
│   │   └── index.ts           ← All TypeScript interfaces
│   ├── lib/
│   │   └── calculations.ts    ← Pure business logic (no React)
│   ├── hooks/
│   │   └── useCapacityModel.ts ← State + localStorage persistence
│   ├── utils/
│   │   └── export.ts          ← JSON + CSV export helpers
│   ├── components/
│   │   ├── SummaryCards.tsx
│   │   ├── AssumptionsPanel.tsx
│   │   ├── FunctionTable.tsx  ← Inline-editable by-function table
│   │   ├── CapacityChart.tsx  ← Recharts visualisations
│   │   └── FormulaReference.tsx
│   ├── App.tsx                ← Layout, header, toolbar
│   ├── main.tsx
│   └── index.css
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (hot reload)
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build locally
npm run preview
```

---

## Deploy to Vercel (recommended — zero config)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel
```

Vercel auto-detects Vite. No configuration needed.

---

## Deploy to GitHub Pages

**1. Set the base path** (so assets load correctly from a sub-path):

```bash
# In your shell, or add VITE_BASE_PATH to your repo secrets
export VITE_BASE_PATH="/recruiting-capacity-model/"
```

Or edit `vite.config.ts` directly:
```ts
base: '/recruiting-capacity-model/',
```

**2. Add the `gh-pages` deploy script** (already in `package.json`):

```bash
npm install
npm run deploy
```

This builds the app and pushes the `dist/` folder to the `gh-pages` branch.
GitHub Pages will serve it at `https://<you>.github.io/recruiting-capacity-model/`.

**3. In your GitHub repo settings → Pages → Source**, select the `gh-pages` branch and `/ (root)`.

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tooling
- **Tailwind CSS v3** — utility-first styling
- **Recharts** — composable chart library
- **localStorage** — zero-backend persistence

---

## Customisation

- **Default seed data** — edit `DEFAULT_STATE` in `src/hooks/useCapacityModel.ts`
- **Productivity defaults** — same file, `assumptions.ftProductivity` / `contractProductivity`
- **Color theme** — Tailwind config in `tailwind.config.js` and component class names
- **Add new global inputs** — extend `GlobalAssumptions` in `src/types/index.ts` and `calculateMetrics` in `src/lib/calculations.ts`
