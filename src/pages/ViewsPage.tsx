import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';
import { Eye, RefreshCw, Database } from 'lucide-react';

const steps = [
  {
    sql: `-- Create a reusable view\nCREATE VIEW high_earners AS\nSELECT name, department, salary\nFROM employees\nWHERE salary > 80000;`,
    desc: 'CREATE VIEW — save a query',
    phase: 'create',
    result: {
      columns: ['name', 'department', 'salary'],
      rows: [
        ['Alice', 'Engineering', 95000],
        ['Bob', 'Engineering', 88000],
        ['Grace', 'Engineering', 102000],
      ],
    },
    explanation: 'A view is a saved SELECT query. It does not store data — it runs the query each time you access it.',
  },
  {
    sql: `-- Use the view like a table\nSELECT * FROM high_earners\nWHERE department = 'Engineering'\nORDER BY salary DESC;`,
    desc: 'Query a view like a table',
    phase: 'query',
    result: {
      columns: ['name', 'department', 'salary'],
      rows: [
        ['Grace', 'Engineering', 102000],
        ['Alice', 'Engineering', 95000],
        ['Bob', 'Engineering', 88000],
      ],
    },
    explanation: 'You SELECT from a view exactly like a table. The database expands the view definition behind the scenes.',
  },
  {
    sql: `-- View for department summary\nCREATE VIEW dept_summary AS\nSELECT\n  department,\n  COUNT(*) AS headcount,\n  ROUND(AVG(salary)) AS avg_sal,\n  MAX(salary) AS top_sal\nFROM employees\nGROUP BY department;`,
    desc: 'Aggregation view — dept summary',
    phase: 'create',
    result: {
      columns: ['department', 'headcount', 'avg_sal', 'top_sal'],
      rows: [
        ['Engineering', 3, 95000, 102000],
        ['Marketing', 2, 70000, 72000],
        ['Sales', 2, 71500, 78000],
        ['HR', 1, 71000, 71000],
      ],
    },
    explanation: 'Complex queries with JOINs and aggregations can be wrapped in views so analysts can query them simply.',
  },
  {
    sql: `-- Materialized view (concept)\nCREATE MATERIALIZED VIEW\n  monthly_revenue AS\nSELECT\n  DATE_FORMAT(order_date,\n    '%Y-%m') AS month,\n  SUM(amount) AS revenue\nFROM orders\nGROUP BY month;\n\n-- Refresh when needed\nREFRESH MATERIALIZED VIEW\n  monthly_revenue;`,
    desc: 'Materialized view — cached results',
    phase: 'materialized',
    result: {
      columns: ['month', 'revenue'],
      rows: [
        ['2024-01', 2500],
        ['2024-02', 2350],
        ['2024-03', 1320],
      ],
    },
    explanation: 'Unlike regular views, materialized views store results physically. Faster reads, but must be refreshed to get new data.',
  },
];

export function ViewsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Views</h1>
        <p className="text-sm text-text-secondary mt-1">
          Save reusable query logic — virtual tables that simplify complex queries for your team.
        </p>
      </div>

      <AnimationControls step={step} maxSteps={steps.length - 1} isPlaying={isPlaying}
        onPlay={play} onPause={pause} onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc} />

      {/* Visual diagram showing view concept */}
      <div className="flex items-center justify-center gap-3 py-3">
        <div className="flex items-center gap-2 bg-surface-2 rounded-lg px-4 py-2 border border-border">
          <Database size={14} className="text-text-tertiary" />
          <span className="text-[12px] font-mono text-text-secondary">Base Tables</span>
        </div>
        <span className="text-accent text-lg">→</span>
        <div className={`flex items-center gap-2 rounded-lg px-4 py-2 border
          ${current.phase === 'materialized'
            ? 'bg-green-50 border-green-200'
            : 'bg-accent/5 border-accent/20'}`}>
          {current.phase === 'materialized'
            ? <RefreshCw size={14} className="text-green-600" />
            : <Eye size={14} className="text-accent" />}
          <span className="text-[12px] font-mono font-medium text-text-primary">
            {current.phase === 'materialized' ? 'Materialized View' : 'View'}
          </span>
        </div>
        <span className="text-accent text-lg">→</span>
        <div className="flex items-center gap-2 bg-surface-2 rounded-lg px-4 py-2 border border-border">
          <span className="text-[12px] font-mono text-text-secondary">SELECT * FROM view</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} />
        </MacWindow>

        <div className="space-y-3">
          <div className="p-3 bg-accent/5 border border-accent/15 rounded-lg text-[12px] text-text-secondary leading-relaxed">
            {current.explanation}
          </div>
        </div>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title={`Result — ${current.phase === 'query' ? 'querying view' : 'view contents'}`}>
          <div className="p-3">
            <SqlTable
              table={{ name: 'r', columns: current.result.columns, rows: current.result.rows }}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>
    </div>
  );
}
