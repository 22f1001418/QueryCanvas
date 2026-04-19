import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

const aggSteps = [
  {
    sql: `SELECT COUNT(*) AS total_employees\nFROM employees;`,
    desc: 'COUNT(*) — count all rows',
    detail: 'COUNT(*) counts every row in the table, regardless of NULL values. This is your answer to "how many records are there?"',
    result: { columns: ['total_employees'], rows: [[8]] },
    highlightAll: true,
  },
  {
    sql: `SELECT SUM(salary) AS total_salary\nFROM employees;`,
    desc: 'SUM() — total of salary column',
    detail: 'SUM() adds up all numeric values in a column. Here it totals salaries: 95k + 88k + 72k + ... = 639,000. NULL values are skipped.',
    result: { columns: ['total_salary'], rows: [[639000]] },
    highlightCol: 3,
  },
  {
    sql: `SELECT AVG(salary) AS avg_salary\nFROM employees;`,
    desc: 'AVG() — average salary',
    detail: 'AVG() calculates the mean: sum divided by count. Average salary is 639,000 ÷ 8 = 79,875. NULL values don\'t count.',
    result: { columns: ['avg_salary'], rows: [[79875]] },
    highlightCol: 3,
  },
  {
    sql: `SELECT MIN(salary) AS min_sal,\n       MAX(salary) AS max_sal\nFROM employees;`,
    desc: 'MIN() and MAX()',
    detail: 'MIN() finds the smallest value (65,000), MAX() finds the largest (102,000). Useful for finding ranges or extremes in your data.',
    result: { columns: ['min_sal', 'max_sal'], rows: [[65000, 102000]] },
    highlightCol: 3,
  },
  {
    sql: `SELECT COUNT(*) AS cnt,\n       COUNT(manager_id) AS with_mgr\nFROM employees;`,
    desc: 'COUNT(*) vs COUNT(column)',
    detail: 'COUNT(*) includes all rows (8). COUNT(manager_id) counts only non-NULL entries (4). This reveals how many employees have a manager assigned.',
    result: { columns: ['cnt', 'with_mgr'], rows: [[8, 4]] },
    highlightCol: 5,
  },
];

export function AggregationsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(aggSteps.length - 1, 2500);
  const current = aggSteps[step];

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    if (current.highlightAll) {
      employees.rows.forEach((_, ri) => {
        employees.columns.forEach((_, ci) => { styles[`${ri}-${ci}`] = 'selected'; });
      });
    } else if (current.highlightCol !== undefined) {
      employees.rows.forEach((_, ri) => {
        styles[`${ri}-${current.highlightCol!}`] = 'selected';
      });
    }
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Aggregate Functions</h1>
        <p className="text-sm text-text-secondary mt-1">
          Collapse multiple rows into a single value using COUNT, SUM, AVG, MIN, and MAX. Aggregates let you summarize 
          large datasets into meaningful statistics — answering questions like "total sales", "average age", or "highest price".
        </p>
      </div>

      <AnimationControls
        step={step} maxSteps={aggSteps.length - 1}
        isPlaying={isPlaying} onPlay={play} onPause={pause}
        onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc}
      />

      {/* Concept explanation */}
      <div className="p-3 bg-surface-2 rounded-mac border border-border">
        <p className="text-sm text-text-primary">{current.detail}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} highlightLines={[1]} />
        </MacWindow>

        <MacWindow title="employees — input" compact>
          <div className="p-3">
            <SqlTable table={employees} cellStyles={cellStyles} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-accent">8 rows → 1 row</span>
            </div>
            {/* Arrow visualization */}
            <div className="flex items-center justify-center gap-4 my-4">
              <div className="text-[11px] text-text-tertiary font-mono bg-surface-2 rounded-md px-3 py-1.5">
                {employees.rows.length} rows
              </div>
              <div className="text-accent text-lg">→</div>
              <div className="text-[11px] text-text-primary font-mono bg-accent-subtle rounded-md px-3 py-1.5 font-semibold">
                {current.result.rows[0].map((v, i) => `${current.result.columns[i]}: ${v}`).join(' | ')}
              </div>
            </div>
            <SqlTable
              table={{ name: 'result', columns: current.result.columns, rows: current.result.rows }}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      {/* Query Playground */}
      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery="SELECT COUNT(*) AS total, AVG(salary) AS avg_salary FROM employees;"
          description="Try different aggregate functions. Use COUNT(*), SUM(), AVG(), MIN(), MAX() on numeric or all columns!"
        />
      </div>
    </div>
  );
}
