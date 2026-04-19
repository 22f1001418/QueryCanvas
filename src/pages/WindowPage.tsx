import { QueryPlayground } from '../components/QueryPlayground';
import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { motion } from 'framer-motion';

const deptColors: Record<string, CellStyle> = {
  Engineering: 'join-left',
  Marketing: 'join-right',
  Sales: 'join-match',
  HR: 'highlight',
};

const windowSteps = [
  {
    sql: `SELECT name, department, salary,\n  ROW_NUMBER() OVER (\n    ORDER BY salary DESC\n  ) AS row_num\nFROM employees;`,
    desc: 'ROW_NUMBER() — sequential numbering',
    result: {
      columns: ['name', 'department', 'salary', 'row_num'],
      rows: [
        ['Grace', 'Engineering', 102000, 1],
        ['Alice', 'Engineering', 95000, 2],
        ['Bob', 'Engineering', 88000, 3],
        ['Eve', 'Sales', 78000, 4],
        ['Carol', 'Marketing', 72000, 5],
        ['Hank', 'HR', 71000, 6],
        ['Dave', 'Marketing', 68000, 7],
        ['Frank', 'Sales', 65000, 8],
      ],
    },
  },
  {
    sql: `SELECT name, department, salary,\n  RANK() OVER (\n    PARTITION BY department\n    ORDER BY salary DESC\n  ) AS dept_rank\nFROM employees;`,
    desc: 'RANK() with PARTITION BY',
    result: {
      columns: ['name', 'department', 'salary', 'dept_rank'],
      rows: [
        ['Grace', 'Engineering', 102000, 1],
        ['Alice', 'Engineering', 95000, 2],
        ['Bob', 'Engineering', 88000, 3],
        ['Carol', 'Marketing', 72000, 1],
        ['Dave', 'Marketing', 68000, 2],
        ['Eve', 'Sales', 78000, 1],
        ['Frank', 'Sales', 65000, 2],
        ['Hank', 'HR', 71000, 1],
      ],
    },
  },
  {
    sql: `SELECT name, department, salary,\n  SUM(salary) OVER (\n    ORDER BY salary ASC\n  ) AS running_total\nFROM employees;`,
    desc: 'Running total with SUM() OVER',
    result: {
      columns: ['name', 'department', 'salary', 'running_total'],
      rows: [
        ['Frank', 'Sales', 65000, 65000],
        ['Dave', 'Marketing', 68000, 133000],
        ['Hank', 'HR', 71000, 204000],
        ['Carol', 'Marketing', 72000, 276000],
        ['Eve', 'Sales', 78000, 354000],
        ['Bob', 'Engineering', 88000, 442000],
        ['Alice', 'Engineering', 95000, 537000],
        ['Grace', 'Engineering', 102000, 639000],
      ],
    },
  },
  {
    sql: `SELECT name, salary,\n  LAG(salary) OVER (\n    ORDER BY salary\n  ) AS prev_salary,\n  salary - LAG(salary) OVER (\n    ORDER BY salary\n  ) AS diff\nFROM employees;`,
    desc: 'LAG() — compare with previous row',
    result: {
      columns: ['name', 'salary', 'prev_salary', 'diff'],
      rows: [
        ['Frank', 65000, null, null],
        ['Dave', 68000, 65000, 3000],
        ['Hank', 71000, 68000, 3000],
        ['Carol', 72000, 71000, 1000],
        ['Eve', 78000, 72000, 6000],
        ['Bob', 88000, 78000, 10000],
        ['Alice', 95000, 88000, 7000],
        ['Grace', 102000, 95000, 7000],
      ],
    },
  },
];

export function WindowPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(windowSteps.length - 1, 3500);
  const current = windowSteps[step];

  const sourceCellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    employees.rows.forEach((row, ri) => {
      const dept = row[2] as string;
      employees.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = deptColors[dept] || 'highlight';
      });
    });
    return styles;
  }, []);

  const resultCellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    if (step === 1) {
      // Color by department partition
      current.result.rows.forEach((row, ri) => {
        const dept = row[1] as string;
        current.result.columns.forEach((_, ci) => {
          styles[`${ri}-${ci}`] = deptColors[dept] || 'highlight';
        });
      });
    }
    // Highlight the window function column
    current.result.rows.forEach((_, ri) => {
      styles[`${ri}-${current.result.columns.length - 1}`] = 'selected';
    });
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-text-primary">Window Functions</h1>
          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold">IMPORTANT</span>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          Perform calculations across rows related to the current row — without collapsing rows like GROUP BY.
        </p>
      </div>

      <AnimationControls
        step={step} maxSteps={windowSteps.length - 1}
        isPlaying={isPlaying} onPlay={play} onPause={pause}
        onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} highlightLines={[2, 3, 4]} />
        </MacWindow>

        <MacWindow title="employees — source" compact>
          <div className="p-3">
            <SqlTable table={employees} cellStyles={sourceCellStyles} visibleColumns={[1, 2, 3]} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result — rows preserved, window column added">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-success">8 rows (same count!)</span>
              <span className="badge badge-accent">+ window column</span>
            </div>

            {/* Visual explanation */}
            {step === 2 && (
              <div className="mb-3 p-3 bg-surface-2 rounded-md text-[12px] text-text-secondary">
                <strong className="text-text-primary">Running total:</strong> Each row's running_total = sum of all salary values up to and including the current row.
              </div>
            )}
            {step === 3 && (
              <div className="mb-3 p-3 bg-surface-2 rounded-md text-[12px] text-text-secondary">
                <strong className="text-text-primary">LAG():</strong> Looks at the previous row's salary. The diff column shows the gap between consecutive salaries.
              </div>
            )}

            <SqlTable
              table={{ name: 'result', columns: current.result.columns, rows: current.result.rows }}
              cellStyles={resultCellStyles}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      {/* Try it yourself */}
      <QueryPlayground
        initialQuery="SELECT name, department, salary, RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rnk FROM employees;"
      />

    </div>
  );
}
