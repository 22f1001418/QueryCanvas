import { QueryPlayground } from '../components/QueryPlayground';
import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';

const steps = [
  {
    title: 'Funnel Analysis',
    sql: `-- Conversion funnel\nSELECT\n  COUNT(DISTINCT CASE\n    WHEN event='visit' THEN user_id\n  END) AS visited,\n  COUNT(DISTINCT CASE\n    WHEN event='signup' THEN user_id\n  END) AS signed_up,\n  COUNT(DISTINCT CASE\n    WHEN event='purchase' THEN user_id\n  END) AS purchased\nFROM user_events\nWHERE event_date\n  BETWEEN '2024-01-01'\n  AND '2024-03-31';`,
    desc: 'Funnel — visit → signup → purchase',
    result: {
      columns: ['visited', 'signed_up', 'purchased'],
      rows: [[5000, 1200, 340]],
    },
    funnel: [
      { label: 'Visited', value: 5000, pct: '100%' },
      { label: 'Signed Up', value: 1200, pct: '24%' },
      { label: 'Purchased', value: 340, pct: '6.8%' },
    ],
  },
  {
    title: 'Cohort Analysis',
    sql: `-- Signup month cohort\nWITH cohorts AS (\n  SELECT user_id,\n    DATE_FORMAT(MIN(event_date),\n      '%Y-%m') AS cohort_month\n  FROM user_events\n  WHERE event = 'signup'\n  GROUP BY user_id\n)\nSELECT c.cohort_month,\n  COUNT(DISTINCT e.user_id)\n    AS active_users,\n  DATEDIFF(\n    e.event_date,\n    CONCAT(c.cohort_month,'-01')\n  ) DIV 30 AS month_offset\nFROM cohorts c\nJOIN user_events e\n  ON c.user_id = e.user_id\nGROUP BY c.cohort_month,\n  month_offset;`,
    desc: 'Cohort — group by signup month',
    result: {
      columns: ['cohort_month', 'month_offset', 'active_users'],
      rows: [
        ['2024-01', 0, 400],
        ['2024-01', 1, 280],
        ['2024-01', 2, 190],
        ['2024-02', 0, 350],
        ['2024-02', 1, 230],
        ['2024-03', 0, 450],
      ],
    },
    funnel: null,
  },
  {
    title: 'Retention Calculation',
    sql: `-- Month-over-month retention\nWITH monthly AS (\n  SELECT user_id,\n    DATE_FORMAT(event_date,\n      '%Y-%m') AS month\n  FROM user_events\n  GROUP BY user_id, month\n),\nretention AS (\n  SELECT a.month,\n    COUNT(DISTINCT a.user_id)\n      AS active,\n    COUNT(DISTINCT b.user_id)\n      AS retained\n  FROM monthly a\n  LEFT JOIN monthly b\n    ON a.user_id = b.user_id\n    AND b.month = DATE_FORMAT(\n      DATE_ADD(CONCAT(a.month,'-01'),\n      INTERVAL 1 MONTH), '%Y-%m')\n  GROUP BY a.month\n)\nSELECT month, active, retained,\n  ROUND(retained*100.0/active,1)\n    AS retention_pct\nFROM retention;`,
    desc: 'Retention — month-over-month',
    result: {
      columns: ['month', 'active', 'retained', 'retention_pct'],
      rows: [
        ['2024-01', 1200, 840, 70.0],
        ['2024-02', 1350, 905, 67.0],
        ['2024-03', 1500, 1050, 70.0],
        ['2024-04', 1100, 715, 65.0],
      ],
    },
    funnel: null,
  },
  {
    title: 'Running Totals',
    sql: `-- Cumulative revenue by date\nSELECT order_date,\n  SUM(amount) AS daily_rev,\n  SUM(SUM(amount)) OVER (\n    ORDER BY order_date\n  ) AS cumulative_rev\nFROM orders\nGROUP BY order_date\nORDER BY order_date;`,
    desc: 'Running total — cumulative revenue',
    result: {
      columns: ['order_date', 'daily_rev', 'cumulative_rev'],
      rows: [
        ['2024-01-15', 1200, 1200],
        ['2024-01-16', 800, 2000],
        ['2024-01-18', 500, 2500],
        ['2024-02-01', 1200, 3700],
        ['2024-02-05', 350, 4050],
        ['2024-02-10', 800, 4850],
        ['2024-03-01', 120, 4970],
        ['2024-03-15', 1200, 6170],
      ],
    },
    funnel: null,
  },
  {
    title: 'Top N Per Group',
    sql: `-- Top 2 earners per department\nWITH ranked AS (\n  SELECT name, department,\n    salary,\n    ROW_NUMBER() OVER (\n      PARTITION BY department\n      ORDER BY salary DESC\n    ) AS rn\n  FROM employees\n)\nSELECT name, department, salary\nFROM ranked\nWHERE rn <= 2;`,
    desc: 'Top N per group — classic pattern',
    result: {
      columns: ['name', 'department', 'salary'],
      rows: [
        ['Grace', 'Engineering', 102000],
        ['Alice', 'Engineering', 95000],
        ['Carol', 'Marketing', 72000],
        ['Dave', 'Marketing', 68000],
        ['Eve', 'Sales', 78000],
        ['Frank', 'Sales', 65000],
        ['Hank', 'HR', 71000],
      ],
    },
    funnel: null,
  },
];

function FunnelVisual({ funnel }: { funnel: { label: string; value: number; pct: string }[] }) {
  const maxVal = funnel[0].value;
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {funnel.map((stage, i) => {
        const width = Math.max(30, (stage.value / maxVal) * 100);
        return (
          <motion.div
            key={stage.label}
            initial={{ width: '0%', opacity: 0 }}
            animate={{ width: `${width}%`, opacity: 1 }}
            transition={{ delay: i * 0.2, duration: 0.4 }}
            className="rounded-md py-2 px-3 text-center text-white font-mono text-[11px]"
            style={{
              background: i === 0 ? 'var(--accent)' : i === 1 ? 'var(--info)' : 'var(--success)',
            }}
          >
            {stage.label}: {stage.value.toLocaleString()} ({stage.pct})
          </motion.div>
        );
      })}
    </div>
  );
}

export function AnalyticsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 4000);
  const current = steps[step];

  const resultStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    // Highlight last column
    const lastCol = current.result.columns.length - 1;
    current.result.rows.forEach((_, ri) => {
      styles[`${ri}-${lastCol}`] = 'selected';
    });
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-text-primary">Analytical SQL Use Cases</h1>
          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold">REAL-WORLD</span>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          Patterns you'll use in interviews and on the job — funnels, cohorts, retention, running totals, and top-N-per-group.
        </p>
      </div>

      <AnimationControls step={step} maxSteps={steps.length - 1} isPlaying={isPlaying}
        onPlay={play} onPause={pause} onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc} />

      <MacWindow title={`Query — ${current.title}`} compact>
        <CodeBlock code={current.sql} />
      </MacWindow>

      {current.funnel && (
        <MacWindow title="Funnel Visualization" compact>
          <FunnelVisual funnel={current.funnel} />
        </MacWindow>
      )}

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-success">{current.result.rows.length} rows</span>
              <span className="badge badge-accent">{current.title}</span>
            </div>
            <SqlTable
              table={{ name: 'r', columns: current.result.columns, rows: current.result.rows }}
              cellStyles={resultStyles}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      {/* Try it yourself */}
      <QueryPlayground
        initialQuery="SELECT department, name, salary, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn FROM employees;"
      />

    </div>
  );
}
