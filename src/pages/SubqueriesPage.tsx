import { QueryPlayground } from '../components/QueryPlayground';
import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { motion } from 'framer-motion';

interface SubStep {
  sql: string;
  desc: string;
  innerResult: { columns: string[]; rows: (string | number | null)[][] };
  innerDesc: string;
  outerRows: number[];
  filterVisibleCols?: number[];
  resultVisibleCols?: number[];
  // Derived-table mode: show a custom table in the filter panel instead of employees
  filterMode?: 'derived';
  derivedFilterTable?: { name: string; columns: string[]; rows: (string | number | null)[][] };
  derivedPassRows?: number[];
  finalResult?: { columns: string[]; rows: (string | number | null)[][] };
}

// Derived table data (dept averages): Engineering=95000, Marketing=70000, Sales=71500, HR=71000
const deptAvgTable = {
  name: 'dept_avg',
  columns: ['department', 'avg_sal'],
  rows: [
    ['Engineering', 95000],
    ['Marketing', 70000],
    ['Sales', 71500],
    ['HR', 71000],
  ] as (string | number | null)[][],
};

const subSteps: SubStep[] = [
  {
    sql: `-- Scalar subquery\nSELECT name, salary\nFROM employees\nWHERE salary > (\n  SELECT AVG(salary)\n  FROM employees\n);`,
    desc: 'Scalar subquery — filter by average',
    innerResult: { columns: ['AVG(salary)'], rows: [[79875]] },
    outerRows: [0, 1, 6],
    innerDesc: 'Inner query returns: 79,875',
    filterVisibleCols: [1, 3],
    resultVisibleCols: [1, 3],
  },
  {
    sql: `-- IN subquery\nSELECT name, department\nFROM employees\nWHERE department IN (\n  SELECT department\n  FROM employees\n  WHERE salary > 90000\n);`,
    desc: 'IN subquery — keep rows matching the inner list',
    innerResult: { columns: ['department'], rows: [['Engineering']] },
    outerRows: [0, 1, 6],
    innerDesc: 'Inner returns: Engineering',
    filterVisibleCols: [1, 2, 3],
    resultVisibleCols: [1, 2],
  },
  {
    sql: `-- NOT IN subquery\nSELECT name, department\nFROM employees\nWHERE department NOT IN (\n  SELECT department\n  FROM employees\n  WHERE salary > 90000\n);`,
    desc: 'NOT IN subquery — exclude rows matching the inner list',
    innerResult: { columns: ['department'], rows: [['Engineering']] },
    // Carol(Marketing), Dave(Marketing), Eve(Sales), Frank(Sales), Hank(HR)
    outerRows: [2, 3, 4, 5, 7],
    innerDesc: 'Inner returns: Engineering (excluded)',
    filterVisibleCols: [1, 2, 3],
    resultVisibleCols: [1, 2],
  },
  {
    sql: `-- Correlated subquery\nSELECT e1.name, e1.salary,\n  e1.department\nFROM employees e1\nWHERE e1.salary = (\n  SELECT MAX(e2.salary)\n  FROM employees e2\n  WHERE e2.department =\n        e1.department\n);`,
    desc: 'Correlated — max salary per dept',
    innerResult: { columns: ['name', 'salary', 'department'], rows: [['Grace', 102000, 'Engineering'], ['Carol', 72000, 'Marketing'], ['Eve', 78000, 'Sales'], ['Hank', 71000, 'HR']] },
    outerRows: [2, 4, 6, 7],
    innerDesc: 'Runs once per outer row',
    finalResult: { columns: ['name', 'salary', 'department'], rows: [['Grace', 102000, 'Engineering'], ['Carol', 72000, 'Marketing'], ['Eve', 78000, 'Sales'], ['Hank', 71000, 'HR']] },
  },
  {
    sql: `-- Derived table (inline view)\nSELECT d.department,\n       d.avg_sal\nFROM (\n  SELECT department,\n         AVG(salary) AS avg_sal\n  FROM employees\n  GROUP BY department\n) AS d\nWHERE d.avg_sal > 75000;`,
    desc: 'Derived table — inline view in FROM clause',
    innerResult: deptAvgTable,
    outerRows: [],
    innerDesc: 'Inner query builds a temporary derived table',
    filterMode: 'derived',
    derivedFilterTable: deptAvgTable,
    derivedPassRows: [0],
    finalResult: {
      columns: ['department', 'avg_sal'],
      rows: [['Engineering', 95000]],
    },
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

  const derivedCellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    if (current.filterMode === 'derived' && current.derivedFilterTable && current.derivedPassRows) {
      current.derivedFilterTable.rows.forEach((_, ri) => {
        current.derivedFilterTable!.columns.forEach((_, ci) => {
          styles[`${ri}-${ci}`] = current.derivedPassRows!.includes(ri) ? 'new' : 'removed';
        });
      });
    }
    return styles;
  }, [step]);

  const finalRowCount = current.finalResult
    ? current.finalResult.rows.length
    : current.outerRows.length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Subqueries</h1>
        <p className="text-sm text-text-secondary mt-1">
          Nest queries inside other queries — scalar, IN, NOT IN, correlated, and derived table subqueries.
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
        {/* Panel 1: Inner query / derived table result */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <MacWindow title={current.filterMode === 'derived' ? '① Derived Table' : '① Inner Query Result'} compact>
            <div className="p-3">
              <div className="text-[11px] text-accent font-medium mb-2">{current.innerDesc}</div>
              <SqlTable
                table={{ name: 'inner', columns: current.innerResult.columns, rows: current.innerResult.rows }}
                animateRows
              />
            </div>
          </MacWindow>
        </motion.div>

        {/* Panel 2: Filter applied */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <MacWindow title="② Filter Applied" compact>
            <div className="p-3">
              {current.filterMode === 'derived' && current.derivedFilterTable ? (
                <SqlTable
                  table={current.derivedFilterTable}
                  cellStyles={derivedCellStyles}
                />
              ) : (
                <SqlTable
                  table={employees}
                  cellStyles={cellStyles}
                  visibleColumns={current.filterVisibleCols ?? [1, 2, 3]}
                />
              )}
            </div>
          </MacWindow>
        </motion.div>

        {/* Panel 3: Final result */}
        <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <MacWindow title="③ Final Result" compact>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-success">{finalRowCount} rows</span>
              </div>
              {current.finalResult ? (
                <SqlTable
                  table={{ name: 'result', columns: current.finalResult.columns, rows: current.finalResult.rows }}
                  animateRows
                />
              ) : (
                <SqlTable
                  table={employees}
                  visibleRows={current.outerRows}
                  visibleColumns={current.resultVisibleCols ?? [1, 3]}
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
