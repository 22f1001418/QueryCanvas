import { QueryPlayground } from '../components/QueryPlayground';
import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { motion } from 'framer-motion';

const caseSteps = [
  {
    sql: `SELECT name, salary,\n  CASE\n    WHEN salary >= 90000 THEN 'Senior'\n    WHEN salary >= 70000 THEN 'Mid'\n    ELSE 'Junior'\n  END AS level\nFROM employees;`,
    desc: 'Bucketing with CASE WHEN',
    compute: (row: (string|number|null)[]) => {
      const s = row[3] as number;
      return s >= 90000 ? 'Senior' : s >= 70000 ? 'Mid' : 'Junior';
    },
    resultCols: ['name', 'salary', 'level'],
  },
  {
    sql: `SELECT department,\n  COUNT(CASE\n    WHEN salary > 80000 THEN 1\n  END) AS high_earners,\n  COUNT(CASE\n    WHEN salary <= 80000 THEN 1\n  END) AS others\nFROM employees\nGROUP BY department;`,
    desc: 'Conditional aggregation',
    resultTable: {
      columns: ['department', 'high_earners', 'others'],
      rows: [
        ['Engineering', 3, 0],
        ['Marketing', 0, 2],
        ['Sales', 0, 2],
        ['HR', 0, 1],
      ],
    },
  },
  {
    sql: `SELECT name, salary,\n  CASE\n    WHEN salary >= 100000 THEN '💎 Top'\n    WHEN salary >= 80000  THEN '🥇 High'\n    WHEN salary >= 70000  THEN '🥈 Mid'\n    ELSE '🥉 Entry'\n  END AS tier\nFROM employees\nORDER BY salary DESC;`,
    desc: 'Revenue tier bucketing',
    compute: (row: (string|number|null)[]) => {
      const s = row[3] as number;
      if (s >= 100000) return '💎 Top';
      if (s >= 80000) return '🥇 High';
      if (s >= 70000) return '🥈 Mid';
      return '🥉 Entry';
    },
    resultCols: ['name', 'salary', 'tier'],
  },
];

export function CasePage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(caseSteps.length - 1, 3000);
  const current = caseSteps[step];

  const resultTable = useMemo(() => {
    if ('resultTable' in current && current.resultTable) return current.resultTable;
    const compute = current.compute!;
    const sorted = step === 2
      ? [...employees.rows].sort((a, b) => (b[3] as number) - (a[3] as number))
      : employees.rows;
    return {
      columns: current.resultCols!,
      rows: sorted.map((row) => [row[1], row[3], compute(row)]),
    };
  }, [step]);

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    employees.rows.forEach((_, ri) => {
      styles[`${ri}-3`] = 'selected';
    });
    return styles;
  }, []);

  const tierColors: Record<string, string> = {
    Senior: 'badge-accent',
    Mid: 'badge-info',
    Junior: 'badge-warning',
    '💎 Top': 'badge-accent',
    '🥇 High': 'badge-success',
    '🥈 Mid': 'badge-info',
    '🥉 Entry': 'badge-warning',
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">CASE WHEN</h1>
        <p className="text-sm text-text-secondary mt-1">
          Add conditional logic to SQL — bucketing, conditional aggregation, and business rule transformations.
        </p>
      </div>

      <AnimationControls
        step={step} maxSteps={caseSteps.length - 1}
        isPlaying={isPlaying} onPlay={play} onPause={pause}
        onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} highlightLines={[2, 3, 4, 5, 6]} />
        </MacWindow>

        <MacWindow title="employees — input" compact>
          <div className="p-3">
            <SqlTable table={employees} cellStyles={cellStyles} visibleColumns={[1, 2, 3]} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            {/* Visual tier legend for step 0 and 2 */}
            {(step === 0 || step === 2) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(tierColors).filter(([k]) =>
                  step === 0 ? ['Senior','Mid','Junior'].includes(k) : k.includes('💎') || k.includes('🥇') || k.includes('🥈') || k.includes('🥉')
                ).map(([label, cls]) => (
                  <span key={label} className={`badge ${cls}`}>{label}</span>
                ))}
              </div>
            )}
            <SqlTable
              table={{ name: 'result', columns: resultTable.columns, rows: resultTable.rows }}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      {/* Try it yourself */}
      <QueryPlayground
        initialQuery="SELECT name, salary, CASE WHEN salary >= 90000 THEN 'Senior' WHEN salary >= 70000 THEN 'Mid' ELSE 'Junior' END AS level FROM employees;"
      />

    </div>
  );
}
