import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { customers, orders } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

// customers with orders : 1(Acme), 2(GlobalTech), 3(StartupXYZ), 4(MegaStore), 5(DataFlow)
// customers without orders: 6(CloudNine)
// customers with order > $1000 (Laptop @1200): 1(Acme), 3(StartupXYZ), 5(DataFlow)

const steps = [
  {
    sql: `-- EXISTS: true if subquery returns ANY row\nSELECT c.id, c.name\nFROM customers c\nWHERE EXISTS (\n  SELECT 1              -- we only care if a row exists\n  FROM orders o\n  WHERE o.customer_id = c.id  -- correlated: this customer\n);`,
    desc: 'EXISTS — customers who have placed at least one order',
    detail:
      'EXISTS returns true as soon as the inner query finds one matching row for the current outer row — it stops searching immediately. SELECT 1 is conventional: EXISTS only cares whether any row exists, not what columns are returned. Customer 6 (CloudNine) has no orders, so EXISTS returns false and they are excluded.',
    matchedIds: [1, 2, 3, 4, 5],
    resultData: {
      columns: ['id', 'name'],
      rows: [[1, 'Acme Corp'], [2, 'GlobalTech'], [3, 'StartupXYZ'], [4, 'MegaStore'], [5, 'DataFlow']],
    },
    visibleCols: [0, 1],
  },
  {
    sql: `-- NOT EXISTS: true if subquery returns NO rows\nSELECT c.id, c.name, c.signup_date\nFROM customers c\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM orders o\n  WHERE o.customer_id = c.id\n)\nORDER BY c.signup_date DESC;`,
    desc: 'NOT EXISTS — customers with no orders, newest signup first',
    detail:
      "NOT EXISTS is the inverse — it returns true only when the inner query finds zero matching rows. CloudNine (id=6) never placed an order, so NOT EXISTS is true for them. The ORDER BY signup_date DESC matches the pattern of finding recently-signed-up customers who haven't transacted yet — a common churn-risk report.",
    matchedIds: [6],
    resultData: {
      columns: ['id', 'name', 'signup_date'],
      rows: [[6, 'CloudNine', '2024-01-05']],
    },
    visibleCols: [0, 1, 3],
  },
  {
    sql: `-- EXISTS with a condition on the inner table\nSELECT c.id, c.name\nFROM customers c\nWHERE EXISTS (\n  SELECT 1\n  FROM orders o\n  WHERE o.customer_id = c.id   -- correlated: this customer\n    AND o.amount > 1000        -- condition on the related row\n);`,
    desc: 'EXISTS with condition — customers who placed a high-value order (> $1,000)',
    detail:
      'Adding a filter inside the EXISTS subquery narrows which matching rows count. Here we only trigger true if at least one of the customer\'s orders exceeds $1,000. Acme (Laptop ×2), StartupXYZ (Laptop), and DataFlow (Laptop) qualify. GlobalTech\'s largest order is $800 (Phone) and MegaStore\'s is $800 — they are excluded.',
    matchedIds: [1, 3, 5],
    resultData: {
      columns: ['id', 'name'],
      rows: [[1, 'Acme Corp'], [3, 'StartupXYZ'], [5, 'DataFlow']],
    },
    visibleCols: [0, 1],
  },
  {
    sql: `-- EXISTS vs IN — same result, different mechanics\n\n-- Using IN:\nSELECT id, name FROM customers\nWHERE id IN (\n  SELECT DISTINCT customer_id FROM orders\n);\n\n-- Using EXISTS (equivalent):\nSELECT id, name FROM customers c\nWHERE EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id\n);`,
    desc: 'EXISTS vs IN — when to use which',
    detail:
      'Both return the same 5 customers here. Key difference: IN materialises the full subquery result into memory then does a membership check; EXISTS short-circuits per outer row as soon as one match is found. EXISTS is safer with NULLs (no NULL trap) and often faster when the inner result set is large. Prefer EXISTS when asking "does a related row exist?".',
    matchedIds: [1, 2, 3, 4, 5],
    resultData: {
      columns: ['id', 'name'],
      rows: [[1, 'Acme Corp'], [2, 'GlobalTech'], [3, 'StartupXYZ'], [4, 'MegaStore'], [5, 'DataFlow']],
    },
    visibleCols: [0, 1],
  },
  {
    sql: `-- NOT EXISTS vs NOT IN — NOT IN has a NULL trap\n\n-- ✅ Safe:\nSELECT id, name FROM customers c\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id\n);\n\n-- ⚠️ Risky (returns 0 rows if any customer_id is NULL):\n-- WHERE id NOT IN (SELECT customer_id FROM orders)`,
    desc: 'NOT EXISTS vs NOT IN — NULL safety',
    detail:
      'NOT EXISTS is always safe. NOT IN silently fails if the subquery returns any NULL: the entire result becomes empty because NULL comparisons are unknown, not false. Since orders.customer_id could theoretically be NULL (e.g. a guest checkout), always prefer NOT EXISTS over NOT IN for "find rows with no match" queries.',
    matchedIds: [6],
    resultData: {
      columns: ['id', 'name'],
      rows: [[6, 'CloudNine']],
    },
    visibleCols: [0, 1],
  },
];

export function ExistsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3000);
  const current = steps[step];

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    customers.rows.forEach((row, ri) => {
      const id = row[0] as number;
      const matched = current.matchedIds.includes(id);
      customers.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = matched ? 'selected' : 'removed';
      });
    });
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">EXISTS / NOT EXISTS</h1>
        <p className="text-sm text-text-secondary mt-1">
          EXISTS tests whether a correlated subquery returns at least one row. It short-circuits on
          the first match, ignores NULLs, and is the preferred pattern for checking whether a related
          row exists. NOT EXISTS finds rows with no matching related record.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-green-500/10 border border-green-500/30 rounded-mac px-3 py-2">
          <p className="font-semibold text-green-600 dark:text-green-400 mb-1">EXISTS</p>
          <p className="text-text-secondary">True if ≥ 1 row returned</p>
          <p className="text-text-secondary">Short-circuits on first hit</p>
          <p className="text-text-secondary">NULL-safe</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-mac px-3 py-2">
          <p className="font-semibold text-red-600 dark:text-red-400 mb-1">NOT EXISTS</p>
          <p className="text-text-secondary">True if 0 rows returned</p>
          <p className="text-text-secondary">Safer than NOT IN</p>
          <p className="text-text-secondary">No NULL trap</p>
        </div>
      </div>

      <AnimationControls
        step={step} maxSteps={steps.length - 1}
        isPlaying={isPlaying} onPlay={play} onPause={pause}
        onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc}
      />

      <div className="p-3 bg-surface-2 rounded-mac border border-border">
        <p className="text-sm text-text-primary">{current.detail}</p>
      </div>

      <MacWindow title="Query" compact>
        <CodeBlock code={current.sql} />
      </MacWindow>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MacWindow title="customers — EXISTS checked per row" compact>
            <div className="p-3">
              <div className="text-xs text-text-secondary mb-2">
                <span className="text-green-500 font-semibold">Highlighted</span> = EXISTS true &nbsp;
                <span className="text-text-tertiary">Greyed</span> = EXISTS false
              </div>
              <SqlTable
                table={customers}
                visibleColumns={current.visibleCols}
                cellStyles={cellStyles}
              />
            </div>
          </MacWindow>

          <MacWindow title="Result" compact>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-success">{current.resultData.rows.length} rows</span>
              </div>
              <SqlTable
                table={{ name: 'result', columns: current.resultData.columns, rows: current.resultData.rows }}
                animateRows
              />
            </div>
          </MacWindow>
        </div>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery={`-- Customers with no orders (safe NOT EXISTS pattern)\nSELECT id, name, signup_date\nFROM customers c\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id\n)\nORDER BY signup_date DESC;`}
          description="Try EXISTS to find customers who ordered a Laptop. Use NOT EXISTS for customers with no orders. Compare with IN / NOT IN to see the NULL trap difference."
        />
      </div>
    </div>
  );
}
