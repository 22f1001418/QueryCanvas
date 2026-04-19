import { MacWindow } from '../components/MacWindow';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';
import { ShieldCheck, Snowflake, Star, Database, ArrowRightLeft } from 'lucide-react';

const steps = [
  {
    title: 'Atomicity',
    icon: '⚛️',
    sql: `-- Bank transfer: all or nothing\nBEGIN TRANSACTION;\n\nUPDATE accounts\n  SET balance = balance - 500\n  WHERE id = 1;\n\nUPDATE accounts\n  SET balance = balance + 500\n  WHERE id = 2;\n\nCOMMIT;\n-- If ANY step fails → ROLLBACK all`,
    desc: 'Atomicity — all or nothing',
    explanation: 'A transaction is atomic: either every statement succeeds and is committed, or the entire transaction is rolled back. No partial updates.',
    visual: 'acid-a',
  },
  {
    title: 'Consistency',
    icon: '✅',
    sql: `-- Constraints enforce consistency\nCREATE TABLE accounts (\n  id INT PRIMARY KEY,\n  balance DECIMAL(10,2)\n    CHECK (balance >= 0),\n  owner_id INT NOT NULL\n    REFERENCES users(id)\n);\n-- Violations are rejected`,
    desc: 'Consistency — rules always hold',
    explanation: 'Consistency means the database moves from one valid state to another. Constraints (CHECK, FOREIGN KEY, UNIQUE) prevent invalid data.',
    visual: 'acid-c',
  },
  {
    title: 'Isolation',
    icon: '🔒',
    sql: `-- Two concurrent transactions\n-- Txn A: reads balance = 1000\n-- Txn B: reads balance = 1000\n-- Txn A: sets balance = 500 ✓\n-- Txn B: sets balance = 700 ?\n-- Isolation levels prevent conflicts\n\n-- READ UNCOMMITTED (dirty reads)\n-- READ COMMITTED\n-- REPEATABLE READ\n-- SERIALIZABLE (strictest)`,
    desc: 'Isolation — concurrent safety',
    explanation: 'Isolation ensures concurrent transactions don\'t interfere. Stricter levels (SERIALIZABLE) are safer but slower. Most databases default to READ COMMITTED.',
    visual: 'acid-i',
  },
  {
    title: 'Durability',
    icon: '💾',
    sql: `-- Once COMMIT succeeds,\n-- data survives crashes\nBEGIN;\nINSERT INTO orders\n  VALUES (999, 'Laptop', 1200);\nCOMMIT;  -- written to disk\n\n-- Server crashes here...\n-- After restart: order 999 exists ✓`,
    desc: 'Durability — survives crashes',
    explanation: 'After COMMIT, data is written to durable storage (disk/WAL). Even if the server crashes immediately after, committed data is preserved.',
    visual: 'acid-d',
  },
  {
    title: 'OLTP vs OLAP',
    icon: '🔄',
    sql: `-- OLTP: transactional\nINSERT INTO orders\n  VALUES (...);\nUPDATE inventory\n  SET qty = qty - 1;\n\n-- OLAP: analytical\nSELECT region,\n  SUM(revenue) AS total,\n  AVG(order_value) AS avg_val\nFROM fact_sales\nJOIN dim_date ON ...\nGROUP BY region;`,
    desc: 'OLTP vs OLAP',
    explanation: 'OLTP systems handle many small read/write transactions (e-commerce). OLAP systems handle few large analytical queries (data warehouse). Different schema designs optimize for each.',
    visual: 'oltp-olap',
  },
  {
    title: 'Star Schema ⭐',
    icon: '⭐',
    sql: `-- Fact table: measurable events\nCREATE TABLE fact_sales (\n  sale_id INT PRIMARY KEY,\n  date_key INT REFERENCES dim_date,\n  product_key INT\n    REFERENCES dim_product,\n  customer_key INT\n    REFERENCES dim_customer,\n  quantity INT,\n  revenue DECIMAL(12,2)\n);\n-- Dimension tables surround it`,
    desc: 'Star Schema — fact + dimensions',
    explanation: 'A star schema has one central fact table (events/metrics) surrounded by dimension tables (who, what, when, where). Simple joins, optimized for OLAP.',
    visual: 'star',
  },
  {
    title: 'Snowflake Schema ❄️',
    icon: '❄️',
    sql: `-- Dimension is normalized further\nCREATE TABLE dim_product (\n  product_key INT PRIMARY KEY,\n  name VARCHAR(100),\n  subcategory_key INT\n    REFERENCES dim_subcategory\n);\nCREATE TABLE dim_subcategory (\n  subcategory_key INT PRIMARY KEY,\n  name VARCHAR(50),\n  category_key INT\n    REFERENCES dim_category\n);`,
    desc: 'Snowflake Schema — normalized dims',
    explanation: 'A snowflake schema normalizes dimension tables into sub-dimensions. Less redundancy, but more joins. Star schemas are generally preferred for analytics.',
    visual: 'snowflake',
  },
];

function AcidVisual({ type }: { type: string }) {
  if (type === 'star') {
    return (
      <div className="p-6 flex flex-col items-center">
        <div className="relative w-64 h-64">
          {/* Center fact */}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-lg bg-accent/15 border-2 border-accent/40 flex items-center justify-center">
            <div className="text-center">
              <Star size={14} className="text-accent mx-auto mb-1" />
              <div className="text-[10px] font-mono font-semibold">fact_sales</div>
            </div>
          </motion.div>
          {/* Dimensions */}
          {[
            { label: 'dim_date', top: '0%', left: '50%', delay: 0.1 },
            { label: 'dim_product', top: '50%', left: '100%', delay: 0.2 },
            { label: 'dim_customer', top: '100%', left: '50%', delay: 0.3 },
            { label: 'dim_store', top: '50%', left: '0%', delay: 0.4 },
          ].map((d) => (
            <motion.div key={d.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d.delay }}
              className="absolute -translate-x-1/2 -translate-y-1/2 bg-surface-2 border border-border rounded-md px-2 py-1.5"
              style={{ top: d.top, left: d.left }}>
              <div className="text-[9px] font-mono text-text-secondary">{d.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'snowflake') {
    return (
      <div className="p-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-surface-3 border border-border rounded px-2 py-1 text-[9px] font-mono">dim_category</div>
          <span className="text-[10px] text-text-tertiary">→</span>
          <div className="bg-surface-3 border border-border rounded px-2 py-1 text-[9px] font-mono">dim_subcategory</div>
          <span className="text-[10px] text-text-tertiary">→</span>
          <div className="bg-info/10 border border-info/20 rounded px-2 py-1 text-[9px] font-mono">dim_product</div>
          <span className="text-[10px] text-text-tertiary">→</span>
          <div className="bg-accent/15 border-2 border-accent/40 rounded px-2 py-1 text-[9px] font-mono font-bold">fact_sales</div>
        </div>
        <Snowflake size={20} className="text-info my-2" />
        <div className="text-[11px] text-text-tertiary text-center">Dimensions branch into sub-tables</div>
      </div>
    );
  }

  if (type === 'oltp-olap') {
    return (
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-accent/5 border border-accent/15 rounded-lg p-3">
          <div className="text-[11px] font-semibold text-accent mb-2">OLTP</div>
          <div className="text-[10px] text-text-secondary space-y-1">
            <div>• Many small transactions</div>
            <div>• INSERT / UPDATE heavy</div>
            <div>• Normalized (3NF)</div>
            <div>• Low latency (&lt;10ms)</div>
            <div>• MySQL, PostgreSQL</div>
          </div>
        </div>
        <div className="bg-info/5 border border-info/15 rounded-lg p-3">
          <div className="text-[11px] font-semibold text-info mb-2">OLAP</div>
          <div className="text-[10px] text-text-secondary space-y-1">
            <div>• Few large queries</div>
            <div>• SELECT / aggregate heavy</div>
            <div>• Denormalized (Star)</div>
            <div>• Seconds–minutes OK</div>
            <div>• BigQuery, Redshift</div>
          </div>
        </div>
      </div>
    );
  }

  // ACID property visuals
  const acidLabels: Record<string, { color: string; items: string[] }> = {
    'acid-a': { color: 'accent', items: ['Step 1 ✓', 'Step 2 ✓', 'Step 3 ✗ → ROLLBACK ALL'] },
    'acid-c': { color: 'success', items: ['Valid State A', '→ Transaction →', 'Valid State B'] },
    'acid-i': { color: 'warning', items: ['Txn A (isolated)', '│', 'Txn B (isolated)'] },
    'acid-d': { color: 'info', items: ['COMMIT', '→ Write-Ahead Log', '→ Disk ✓'] },
  };

  const data = acidLabels[type];
  return (
    <div className="p-4 flex items-center justify-center gap-2">
      {data?.items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
          className="bg-surface-2 border border-border rounded-md px-3 py-1.5 text-[11px] font-mono text-text-secondary">
          {item}
        </motion.div>
      ))}
    </div>
  );
}

export function AcidModelingPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">ACID Properties & Data Modeling</h1>
        <p className="text-sm text-text-secondary mt-1">
          Transaction guarantees, OLTP vs OLAP, and warehouse schema design — Star and Snowflake.
        </p>
      </div>

      <AnimationControls step={step} maxSteps={steps.length - 1} isPlaying={isPlaying}
        onPlay={play} onPause={pause} onReset={reset} onNext={next} onPrev={prev}
        stepLabel={`${current.icon} ${current.desc}`} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query / Concept" compact>
          <CodeBlock code={current.sql} />
        </MacWindow>
        <MacWindow title="Visual" compact>
          <AcidVisual type={current.visual} />
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-4 bg-accent/5 border border-accent/15 rounded-lg">
          <div className="text-[13px] font-semibold text-text-primary mb-1">{current.title}</div>
          <div className="text-[12px] text-text-secondary leading-relaxed">{current.explanation}</div>
        </div>
      </motion.div>
    </div>
  );
}
