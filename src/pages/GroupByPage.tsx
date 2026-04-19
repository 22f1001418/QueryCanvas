import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

const deptColors: Record<string, CellStyle> = {
  Engineering: 'join-left',
  Marketing: 'join-right',
  Sales: 'join-match',
  HR: 'highlight',
};

const groupSteps = [
  {
    sql: `SELECT department, COUNT(*) AS cnt\nFROM employees\nGROUP BY department;`,
    desc: 'GROUP BY with COUNT',
    detail: 'GROUP BY department creates one row per unique department. COUNT(*) then counts how many employees are in each group.',
    result: {
      columns: ['department', 'cnt'],
      rows: [['Engineering', 3], ['Marketing', 2], ['Sales', 2], ['HR', 1]],
    },
  },
  {
    sql: `SELECT department,\n       AVG(salary) AS avg_sal\nFROM employees\nGROUP BY department;`,
    desc: 'GROUP BY with AVG',
    detail: 'GROUP BY creates groups, then AVG() calculates average salary within each group. Engineering has 3 employees with average 95,000.',
    result: {
      columns: ['department', 'avg_sal'],
      rows: [['Engineering', 95000], ['Marketing', 70000], ['Sales', 71500], ['HR', 71000]],
    },
  },
  {
    sql: `SELECT department,\n       SUM(salary) AS total\nFROM employees\nGROUP BY department\nHAVING SUM(salary) > 150000;`,
    desc: 'HAVING filters groups',
    detail: 'HAVING acts like WHERE but for groups. It filters AFTER aggregation. Only departments with total salary > 150k appear.',
    result: {
      columns: ['department', 'total'],
      rows: [['Engineering', 285000]],
    },
  },
  {
    sql: `SELECT department, COUNT(*) AS cnt\nFROM employees\nWHERE salary > 70000\nGROUP BY department\nHAVING COUNT(*) >= 2;`,
    desc: 'WHERE + GROUP BY + HAVING',
    detail: 'First, WHERE filters rows (salary > 70k), then GROUP BY groups by department, then HAVING filters groups (count >= 2).',
    result: {
      columns: ['department', 'cnt'],
      rows: [['Engineering', 3], ['Sales', 2]],
    },
  },
];

export function GroupByPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(groupSteps.length - 1, 3000);
  const current = groupSteps[step];

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    employees.rows.forEach((row, ri) => {
      const dept = row[2] as string;
      const color = deptColors[dept] || 'highlight';
      employees.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = color;
      });
    });
    return styles;
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">GROUP BY & HAVING</h1>
        <p className="text-sm text-text-secondary mt-1">
          Group rows by column values and apply aggregate functions to each group. HAVING filters groups based on aggregate 
          conditions (like WHERE but applied after grouping). Perfect for "sales by region", "employees per department", etc.
        </p>
      </div>

      <AnimationControls
        step={step} maxSteps={groupSteps.length - 1}
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
          <CodeBlock code={current.sql} />
        </MacWindow>

        <MacWindow title="employees — grouped by department" compact>
          <div className="p-3">
            <SqlTable table={employees} cellStyles={cellStyles} highlightColumns={[2]} />
          </div>
        </MacWindow>
      </div>

      {/* Visual grouping breakdown */}
      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(deptColors).map(([dept, color]) => (
            <div key={dept} className={`cell-${color} rounded-md px-3 py-1.5 text-[12px] font-mono font-medium`}>
              {dept}
            </div>
          ))}
        </div>

        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-success">{current.result.rows.length} groups</span>
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
          initialQuery="SELECT department, COUNT(*) AS emp_count FROM employees GROUP BY department;"
          description="Write your own GROUP BY queries. Try grouping by different columns, use aggregate functions with HAVING filters!"
        />
      </div>
    </div>
  );
}
