import { QueryPlayground } from '../components/QueryPlayground';
import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { motion } from 'framer-motion';

const subSteps = [
  {
    sql: `-- Scalar subquery\nSELECT name, salary\nFROM employees\nWHERE salary > (\n  SELECT AVG(salary)\n  FROM employees\n);`,
    desc: 'Scalar subquery — filter by average',
    innerResult: { columns: ['AVG(salary)'], rows: [[79875]] },
    outerRows: [0, 6], // Alice 95k, Grace 102k, Bob 88k
    innerDesc: 'Inner query returns: 79,875',
  },
  {
    sql: `-- Column subquery\nSELECT name, department\nFROM employees\nWHERE department IN (\n  SELECT department\n  FROM employees\n  WHERE salary > 90000\n);`,
    desc: 'Column subquery — IN with subquery',
    innerResult: { columns: ['department'], rows: [['Engineering']] },
    outerRows: [0, 1, 6], // All Engineering
    innerDesc: 'Inner returns: Engineering',
  },
  {
    sql: `-- Correlated subquery\nSELECT e1.name, e1.salary,\n  e1.department\nFROM employees e1\nWHERE e1.salary = (\n  SELECT MAX(e2.salary)\n  FROM employees e2\n  WHERE e2.department =\n        e1.department\n);`,
    desc: 'Correlated — max salary per dept',
    innerResult: { columns: ['name', 'salary', 'department'], rows: [['Grace', 102000, 'Engineering'], ['Carol', 72000, 'Marketing'], ['Eve', 78000, 'Sales'], ['Hank', 71000, 'HR']] },
    outerRows: [2, 4, 6, 7],
    innerDesc: 'Runs once per outer row',
  },
];

export function SubqueriesPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(subSteps.length - 1, 3500);
  const current = subSteps[step];

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    employees.rows.forEach((_, ri) => {
      employees.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = current.outerRows.includes(ri) ? 'new' : 'removed';
      });
    });
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Subqueries</h1>
        <p className="text-sm text-text-secondary mt-1">
          Nest queries inside other queries — scalar, column, and correlated subqueries.
        </p>
      </div>

      <AnimationControls
        step={step} maxSteps={subSteps.length - 1}
        isPlaying={isPlaying} onPlay={play} onPause={pause}
        onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc}
      />

      <MacWindow title="Query" compact>
        <CodeBlock code={current.sql} highlightLines={[4, 5, 6, 7, 8, 9]} />
      </MacWindow>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Step 1: Inner query */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <MacWindow title="① Inner Query Result" compact>
            <div className="p-3">
              <div className="text-[11px] text-accent font-medium mb-2">{current.innerDesc}</div>
              <SqlTable
                table={{ name: 'inner', columns: current.innerResult.columns, rows: current.innerResult.rows }}
                animateRows
              />
            </div>
          </MacWindow>
        </motion.div>

        {/* Step 2: Outer evaluation */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <MacWindow title="② Filter Applied" compact>
            <div className="p-3">
              <SqlTable table={employees} cellStyles={cellStyles} visibleColumns={[1, 2, 3]} />
            </div>
          </MacWindow>
        </motion.div>

        {/* Step 3: Final result */}
        <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <MacWindow title="③ Final Result" compact>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-success">{current.outerRows.length} rows</span>
              </div>
              {step === 2 ? (
                <SqlTable
                  table={{ name: 'result', columns: current.innerResult.columns, rows: current.innerResult.rows }}
                  animateRows
                />
              ) : (
                <SqlTable
                  table={employees}
                  visibleRows={current.outerRows}
                  visibleColumns={[1, 3]}
                  animateRows
                />
              )}
            </div>
          </MacWindow>
        </motion.div>
      </div>

      {/* Try it yourself */}
      <QueryPlayground
        initialQuery="SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);"
      />

    </div>
  );
}
