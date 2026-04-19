import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

const sortSteps = [
  {
    sql: `SELECT name, salary\nFROM employees\nORDER BY salary ASC;`,
    desc: 'Sort by salary ascending',
    detail: 'ASC (ascending) arranges values from smallest to largest. The lowest salary (65,000) appears first, highest (102,000) last.',
    sortFn: (a: (string|number|null)[], b: (string|number|null)[]) => (a[3] as number) - (b[3] as number),
    highlightCol: 3,
  },
  {
    sql: `SELECT name, salary\nFROM employees\nORDER BY salary DESC;`,
    desc: 'Sort by salary descending',
    detail: 'DESC (descending) arranges values from largest to smallest. The highest salary (102,000) appears first, lowest (65,000) last.',
    sortFn: (a: (string|number|null)[], b: (string|number|null)[]) => (b[3] as number) - (a[3] as number),
    highlightCol: 3,
  },
  {
    sql: `SELECT name, department, salary\nFROM employees\nORDER BY department ASC,\n         salary DESC;`,
    desc: 'Multi-column sort',
    detail: 'Multiple ORDER BY columns create a hierarchy. First sort by department A-Z, then within each department sort by salary highest to lowest.',
    sortFn: (a: (string|number|null)[], b: (string|number|null)[]) => {
      const deptCmp = (a[2] as string).localeCompare(b[2] as string);
      if (deptCmp !== 0) return deptCmp;
      return (b[3] as number) - (a[3] as number);
    },
    highlightCol: 2,
  },
  {
    sql: `SELECT name, hire_date\nFROM employees\nORDER BY hire_date ASC;`,
    desc: 'Sort by date ascending',
    detail: 'ORDER BY works with dates too. Dates are sorted chronologically — earliest hire (2018-07) comes first, latest hire (2023-02) comes last.',
    sortFn: (a: (string|number|null)[], b: (string|number|null)[]) =>
      new Date(a[4] as string).getTime() - new Date(b[4] as string).getTime(),
    highlightCol: 4,
  },
];

export function OrderByPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(sortSteps.length - 1, 2500);
  const current = sortSteps[step];

  const sortedIndices = useMemo(() => {
    const indexed = employees.rows.map((row, i) => ({ row, i }));
    indexed.sort((a, b) => current.sortFn(a.row, b.row));
    return indexed.map((x) => x.i);
  }, [step]);

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    employees.rows.forEach((_, ri) => {
      styles[`${ri}-${current.highlightCol}`] = 'selected';
    });
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">ORDER BY</h1>
        <p className="text-sm text-text-secondary mt-1">
          Sort result sets by one or more columns in ascending (A→Z, 0→9) or descending (Z→A, 9→0) order. ORDER BY is 
          commonly used with numeric, text, and date columns. Combined with LIMIT, it lets you find "top 10" or "bottom 5" results.
        </p>
      </div>

      <AnimationControls
        step={step} maxSteps={sortSteps.length - 1}
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
          <CodeBlock code={current.sql} highlightLines={[3, 4]} />
        </MacWindow>

        <MacWindow title="employees — original order" compact>
          <div className="p-3">
            <SqlTable table={employees} cellStyles={cellStyles} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result — sorted">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-info">
                {current.desc}
              </span>
            </div>
            <SqlTable
              table={employees}
              visibleRows={sortedIndices}
              highlightColumns={[current.highlightCol]}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      {/* Query Playground */}
      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery="SELECT name, salary FROM employees ORDER BY salary DESC;"
          description="Write your own ORDER BY queries. Try sorting by different columns with ASC/DESC, combine multiple columns, or sort by dates!"
        />
      </div>
    </div>
  );
}
