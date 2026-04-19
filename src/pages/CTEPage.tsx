import { QueryPlayground } from '../components/QueryPlayground';
import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';

const cteSteps = [
  {
    sql: `WITH dept_stats AS (\n  SELECT department,\n    AVG(salary) AS avg_sal,\n    COUNT(*) AS cnt\n  FROM employees\n  GROUP BY department\n)\nSELECT * FROM dept_stats\nWHERE avg_sal > 75000;`,
    desc: 'Simple CTE — dept averages',
    ctes: [
      {
        name: 'dept_stats',
        columns: ['department', 'avg_sal', 'cnt'],
        rows: [['Engineering', 95000, 3], ['Marketing', 70000, 2], ['Sales', 71500, 2], ['HR', 71000, 1]],
      },
    ],
    result: {
      columns: ['department', 'avg_sal', 'cnt'],
      rows: [['Engineering', 95000, 3]],
    },
  },
  {
    sql: `WITH high_earners AS (\n  SELECT name, department, salary\n  FROM employees\n  WHERE salary > 80000\n),\ndept_counts AS (\n  SELECT department,\n    COUNT(*) AS high_cnt\n  FROM high_earners\n  GROUP BY department\n)\nSELECT * FROM dept_counts;`,
    desc: 'Chained CTEs',
    ctes: [
      {
        name: 'high_earners',
        columns: ['name', 'department', 'salary'],
        rows: [['Alice', 'Engineering', 95000], ['Bob', 'Engineering', 88000], ['Grace', 'Engineering', 102000]],
      },
      {
        name: 'dept_counts',
        columns: ['department', 'high_cnt'],
        rows: [['Engineering', 3]],
      },
    ],
    result: {
      columns: ['department', 'high_cnt'],
      rows: [['Engineering', 3]],
    },
  },
  {
    sql: `-- Recursive CTE: 1 to 5\nWITH RECURSIVE nums AS (\n  SELECT 1 AS n          -- base\n  UNION ALL\n  SELECT n + 1 FROM nums -- step\n  WHERE n < 5\n)\nSELECT * FROM nums;`,
    desc: 'Recursive CTE',
    ctes: [
      {
        name: 'nums (iteration)',
        columns: ['n', 'iteration'],
        rows: [[1, 'base'], [2, 'step 1'], [3, 'step 2'], [4, 'step 3'], [5, 'step 4']],
      },
    ],
    result: {
      columns: ['n'],
      rows: [[1], [2], [3], [4], [5]],
    },
  },
];

export function CTEPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(cteSteps.length - 1, 3500);
  const current = cteSteps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Common Table Expressions (CTEs)</h1>
        <p className="text-sm text-text-secondary mt-1">
          Write clean, modular SQL with the WITH clause — chain multiple CTEs and use recursive queries.
        </p>
      </div>

      <AnimationControls
        step={step} maxSteps={cteSteps.length - 1}
        isPlaying={isPlaying} onPlay={play} onPause={pause}
        onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc}
      />

      <MacWindow title="Query" compact>
        <CodeBlock code={current.sql} />
      </MacWindow>

      {/* CTE pipeline visualization */}
      <div className="flex flex-wrap items-start gap-4">
        {current.ctes.map((cte, i) => (
          <motion.div
            key={`${step}-${i}`}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex-1 min-w-[250px]"
          >
            <MacWindow title={`CTE: ${cte.name}`} compact>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-info">Step {i + 1}</span>
                  <span className="text-[11px] text-text-tertiary">{cte.rows.length} rows</span>
                </div>
                <SqlTable
                  table={{ name: cte.name, columns: cte.columns, rows: cte.rows }}
                  animateRows
                />
              </div>
            </MacWindow>
          </motion.div>
        ))}

        {/* Arrow */}
        <div className="flex items-center self-center text-accent text-2xl font-light">→</div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: current.ctes.length * 0.2 }}
          className="flex-1 min-w-[250px]"
        >
          <MacWindow title="Final Result" compact>
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
      </div>

      {/* Try it yourself */}
      <QueryPlayground
        initialQuery="WITH dept_avg AS (SELECT department, AVG(salary) AS avg_sal FROM employees GROUP BY department) SELECT * FROM dept_avg WHERE avg_sal > 75000;"
      />

    </div>
  );
}
