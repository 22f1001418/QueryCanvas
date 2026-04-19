import { QueryPlayground } from '../components/QueryPlayground';
import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';

const setA = {
  name: 'q1_customers',
  columns: ['name', 'city'],
  rows: [
    ['Acme Corp', 'New York'],
    ['GlobalTech', 'London'],
    ['StartupXYZ', 'Berlin'],
    ['MegaStore', 'Tokyo'],
  ] as (string | number | null)[][],
};

const setB = {
  name: 'q2_customers',
  columns: ['name', 'city'],
  rows: [
    ['StartupXYZ', 'Berlin'],
    ['MegaStore', 'Tokyo'],
    ['DataFlow', 'Paris'],
    ['CloudNine', 'Sydney'],
  ] as (string | number | null)[][],
};

const setSteps = [
  {
    sql: `SELECT name, city FROM q1_customers\nUNION\nSELECT name, city FROM q2_customers;`,
    desc: 'UNION — distinct combined rows',
    result: {
      columns: ['name', 'city'],
      rows: [
        ['Acme Corp', 'New York'],
        ['GlobalTech', 'London'],
        ['StartupXYZ', 'Berlin'],
        ['MegaStore', 'Tokyo'],
        ['DataFlow', 'Paris'],
        ['CloudNine', 'Sydney'],
      ],
    },
    leftHighlight: [0, 1, 2, 3],
    rightHighlight: [0, 1, 2, 3],
  },
  {
    sql: `SELECT name, city FROM q1_customers\nUNION ALL\nSELECT name, city FROM q2_customers;`,
    desc: 'UNION ALL — all rows including duplicates',
    result: {
      columns: ['name', 'city'],
      rows: [
        ['Acme Corp', 'New York'],
        ['GlobalTech', 'London'],
        ['StartupXYZ', 'Berlin'],
        ['MegaStore', 'Tokyo'],
        ['StartupXYZ', 'Berlin'],
        ['MegaStore', 'Tokyo'],
        ['DataFlow', 'Paris'],
        ['CloudNine', 'Sydney'],
      ],
    },
    leftHighlight: [0, 1, 2, 3],
    rightHighlight: [0, 1, 2, 3],
  },
  {
    sql: `SELECT name, city FROM q1_customers\nINTERSECT\nSELECT name, city FROM q2_customers;`,
    desc: 'INTERSECT — only rows in both',
    result: {
      columns: ['name', 'city'],
      rows: [
        ['StartupXYZ', 'Berlin'],
        ['MegaStore', 'Tokyo'],
      ],
    },
    leftHighlight: [2, 3],
    rightHighlight: [0, 1],
  },
  {
    sql: `SELECT name, city FROM q1_customers\nEXCEPT\nSELECT name, city FROM q2_customers;`,
    desc: 'EXCEPT — only in left, not in right',
    result: {
      columns: ['name', 'city'],
      rows: [
        ['Acme Corp', 'New York'],
        ['GlobalTech', 'London'],
      ],
    },
    leftHighlight: [0, 1],
    rightHighlight: [],
  },
];

export function SetsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(setSteps.length - 1, 3000);
  const current = setSteps[step];

  const leftStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    setA.rows.forEach((_, ri) => {
      setA.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = current.leftHighlight.includes(ri) ? 'join-left' : 'removed';
      });
    });
    return styles;
  }, [step]);

  const rightStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    setB.rows.forEach((_, ri) => {
      setB.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = current.rightHighlight.includes(ri) ? 'join-right' : 'removed';
      });
    });
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Set Operations</h1>
        <p className="text-sm text-text-secondary mt-1">
          Combine result sets — UNION, UNION ALL, INTERSECT, EXCEPT.
        </p>
      </div>

      <AnimationControls
        step={step} maxSteps={setSteps.length - 1}
        isPlaying={isPlaying} onPlay={play} onPause={pause}
        onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc}
      />

      <MacWindow title="Query" compact>
        <CodeBlock code={current.sql} highlightLines={[2]} />
      </MacWindow>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MacWindow title="q1_customers (Set A)" compact>
          <div className="p-3">
            <SqlTable table={setA} cellStyles={leftStyles} />
          </div>
        </MacWindow>
        <MacWindow title="q2_customers (Set B)" compact>
          <div className="p-3">
            <SqlTable table={setB} cellStyles={rightStyles} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-success">{current.result.rows.length} rows</span>
            </div>
            <SqlTable
              table={{ name: 'result', columns: current.result.columns, rows: current.result.rows }}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      {/* Try it yourself */}
      <QueryPlayground
        initialQuery="SELECT department FROM employees WHERE salary > 80000 UNION SELECT dept_name FROM departments WHERE budget > 200000;"
      />

    </div>
  );
}
