import { MacWindow } from '../components/MacWindow';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';
import { Zap, Search, AlertTriangle, CheckCircle } from 'lucide-react';

const steps = [
  {
    sql: `-- Without index: full table scan\nSELECT * FROM employees\nWHERE email = 'alice@acme.com';\n\n-- Scans ALL 1,000,000 rows ❌`,
    desc: 'Full table scan — no index',
    visual: 'scan',
    perf: { rows: '1,000,000', time: '~850ms', method: 'Full Table Scan' },
    explanation: 'Without an index, the database reads every single row to find matches. This is O(n) — performance degrades linearly as the table grows.',
  },
  {
    sql: `-- Create an index on email\nCREATE INDEX idx_email\n  ON employees(email);\n\n-- Now the same query is instant\nSELECT * FROM employees\nWHERE email = 'alice@acme.com';\n-- Reads ~3 B-Tree nodes ✅`,
    desc: 'B-Tree index — logarithmic lookup',
    visual: 'btree',
    perf: { rows: '3 nodes', time: '~2ms', method: 'Index Seek' },
    explanation: 'A B-Tree index organizes values in a sorted tree. Finding a value takes O(log n) steps — about 20 node reads for 1 million rows.',
  },
  {
    sql: `-- Composite index for\n-- multi-column queries\nCREATE INDEX idx_dept_salary\n  ON employees(department, salary);\n\n-- Uses both columns efficiently\nSELECT * FROM employees\nWHERE department = 'Engineering'\n  AND salary > 90000;`,
    desc: 'Composite index — multi-column',
    visual: 'composite',
    perf: { rows: '5 nodes', time: '~3ms', method: 'Composite Index Seek' },
    explanation: 'A composite index covers multiple columns. Column order matters: (dept, salary) helps "dept = X AND salary > Y" but NOT "salary > Y" alone.',
  },
  {
    sql: `-- When NOT to index\n-- ❌ Small tables (< 1000 rows)\n-- ❌ Columns rarely in WHERE\n-- ❌ High-write tables\n-- ❌ Low cardinality (gender)\n\n-- When TO index\n-- ✅ Primary keys (auto-indexed)\n-- ✅ Foreign keys used in JOINs\n-- ✅ Columns in WHERE / ORDER BY\n-- ✅ High cardinality (email, id)`,
    desc: 'When to use / avoid indexes',
    visual: 'tradeoff',
    perf: null,
    explanation: 'Every index speeds up reads but slows down writes (INSERT, UPDATE, DELETE), because the index must be updated too. Choose wisely.',
  },
];

function PerfCard({ perf }: { perf: { rows: string; time: string; method: string } | null }) {
  if (!perf) return null;
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-surface-2 rounded-lg p-3 text-center">
        <div className="text-[10px] text-text-tertiary uppercase tracking-wide mb-1">Rows Read</div>
        <div className="text-[16px] font-semibold font-mono text-text-primary">{perf.rows}</div>
      </div>
      <div className="bg-surface-2 rounded-lg p-3 text-center">
        <div className="text-[10px] text-text-tertiary uppercase tracking-wide mb-1">Time</div>
        <div className="text-[16px] font-semibold font-mono text-text-primary">{perf.time}</div>
      </div>
      <div className="bg-surface-2 rounded-lg p-3 text-center">
        <div className="text-[10px] text-text-tertiary uppercase tracking-wide mb-1">Access</div>
        <div className="text-[11px] font-medium text-text-primary">{perf.method}</div>
      </div>
    </div>
  );
}

function BTreeVisual({ type }: { type: string }) {
  if (type === 'scan') {
    return (
      <div className="flex flex-wrap gap-1 p-4">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1, background: 'var(--cell-removed)' }}
            transition={{ delay: i * 0.03 }}
            className="w-5 h-5 rounded-sm border border-border text-[8px] flex items-center justify-center text-text-tertiary"
          >
            {i + 1}
          </motion.div>
        ))}
        <div className="w-full text-[11px] text-error mt-2 flex items-center gap-1">
          <AlertTriangle size={12} /> Scanning every row sequentially
        </div>
      </div>
    );
  }

  if (type === 'btree' || type === 'composite') {
    return (
      <div className="p-4 flex flex-col items-center gap-3">
        {/* Root */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-accent/15 border border-accent/30 rounded-md px-4 py-1.5 text-[11px] font-mono font-medium">
          [M]
        </motion.div>
        <div className="text-text-tertiary text-[10px]">↙ ↘</div>
        {/* Level 2 */}
        <div className="flex gap-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="bg-accent/10 border border-accent/20 rounded-md px-3 py-1 text-[11px] font-mono">
            [A-L]
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.15 }}
            className="bg-surface-3 border border-border rounded-md px-3 py-1 text-[11px] font-mono text-text-tertiary">
            [M-Z]
          </motion.div>
        </div>
        <div className="text-text-tertiary text-[10px]">↓</div>
        {/* Leaf */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="bg-green-50 border border-green-200 rounded-md px-4 py-1.5 text-[11px] font-mono font-medium text-green-700">
          alice@acme.com → Row #42 ✓
        </motion.div>
        <div className="text-[11px] text-success flex items-center gap-1 mt-1">
          <CheckCircle size={12} /> Found in 3 node reads
        </div>
      </div>
    );
  }

  // tradeoff
  return (
    <div className="p-4 grid grid-cols-2 gap-3">
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="text-[11px] font-semibold text-green-700 mb-2 flex items-center gap-1">
          <CheckCircle size={12} /> Index helps
        </div>
        <div className="text-[11px] text-green-700/80 space-y-1">
          <div>• WHERE column = value</div>
          <div>• JOIN ON conditions</div>
          <div>• ORDER BY columns</div>
          <div>• High cardinality columns</div>
        </div>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="text-[11px] font-semibold text-red-700 mb-2 flex items-center gap-1">
          <AlertTriangle size={12} /> Index hurts
        </div>
        <div className="text-[11px] text-red-700/80 space-y-1">
          <div>• Frequent INSERT/UPDATE</div>
          <div>• Small tables (&lt; 1K rows)</div>
          <div>• Low cardinality (bool)</div>
          <div>• Columns never queried</div>
        </div>
      </div>
    </div>
  );
}

export function IndexingPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Indexing</h1>
        <p className="text-sm text-text-secondary mt-1">
          Speed up queries with indexes — understand B-Trees, composite indexes, and the read/write tradeoff.
        </p>
      </div>

      <AnimationControls step={step} maxSteps={steps.length - 1} isPlaying={isPlaying}
        onPlay={play} onPause={pause} onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} />
        </MacWindow>

        <MacWindow title="Visualization" compact>
          <BTreeVisual type={current.visual} />
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="space-y-3">
          {current.perf && <PerfCard perf={current.perf} />}
          <div className="p-3 bg-accent/5 border border-accent/15 rounded-lg text-[12px] text-text-secondary leading-relaxed">
            {current.explanation}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
