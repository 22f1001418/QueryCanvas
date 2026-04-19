import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

const filters = [
  {
    sql: `SELECT name, salary\nFROM employees\nWHERE salary > 80000;`,
    desc: 'Comparison: salary > 80000',
    detail: 'The > operator filters rows where salary is strictly greater than 80,000. Other comparison operators include <, <=, >=, and !=.',
    test: (row: (string | number | null)[]) => (row[3] as number) > 80000,
    highlight: [3],
  },
  {
    sql: `SELECT name, department\nFROM employees\nWHERE department = 'Engineering';`,
    desc: "Equality: department = 'Engineering'",
    detail: 'The = operator matches exact values. Only rows where department exactly equals "Engineering" are returned.',
    test: (row: (string | number | null)[]) => row[2] === 'Engineering',
    highlight: [2],
  },
  {
    sql: `SELECT name, salary\nFROM employees\nWHERE salary BETWEEN 70000 AND 90000;`,
    desc: 'BETWEEN: salary 70k–90k',
    detail: 'BETWEEN is a shorthand for checking if a value falls within an inclusive range. It\'s equivalent to "salary >= 70000 AND salary <= 90000".',
    test: (row: (string | number | null)[]) => (row[3] as number) >= 70000 && (row[3] as number) <= 90000,
    highlight: [3],
  },
  {
    sql: `SELECT name, department\nFROM employees\nWHERE department IN ('Sales', 'HR');`,
    desc: "IN: Sales or HR",
    detail: 'IN tests if a value matches any item in a list. This query returns employees in either Sales OR HR department, not both conditions simultaneously.',
    test: (row: (string | number | null)[]) => ['Sales', 'HR'].includes(row[2] as string),
    highlight: [2],
  },
  {
    sql: `SELECT name, department, salary\nFROM employees\nWHERE department = 'Engineering'\n  AND salary > 90000;`,
    desc: 'AND: Engineering + salary > 90k',
    detail: 'AND combines multiple conditions where ALL must be true. Only employees in Engineering with a salary above 90,000 pass this filter.',
    test: (row: (string | number | null)[]) => row[2] === 'Engineering' && (row[3] as number) > 90000,
    highlight: [2, 3],
  },
  {
    sql: `SELECT name, name\nFROM employees\nWHERE name LIKE 'A%';`,
    desc: "LIKE: name starts with 'A'",
    detail: 'LIKE matches patterns. % is a wildcard for any characters. "A%" means names starting with A. You can also use %text%, _char, etc.',
    test: (row: (string | number | null)[]) => (row[1] as string).startsWith('A'),
    highlight: [1],
  },
  {
    sql: `SELECT name, manager_id\nFROM employees\nWHERE manager_id IS NULL;`,
    desc: 'IS NULL: no manager',
    detail: 'IS NULL checks for missing values. Unlike = NULL (which never matches), IS NULL correctly identifies rows with no manager assigned.',
    test: (row: (string | number | null)[]) => row[5] === null,
    highlight: [5],
  },
];

export function WherePage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(filters.length - 1, 2500);
  const filter = filters[step];

  const matchingRows = useMemo(
    () => employees.rows.map((row, i) => ({ row, index: i, matches: filter.test(row) })),
    [step]
  );

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    matchingRows.forEach(({ index, matches }) => {
      employees.columns.forEach((_, ci) => {
        if (matches) {
          styles[`${index}-${ci}`] = filter.highlight.includes(ci) ? 'selected' : 'new';
        } else {
          styles[`${index}-${ci}`] = 'removed';
        }
      });
    });
    return styles;
  }, [step]);

  const resultRows = matchingRows.filter((r) => r.matches).map((r) => r.index);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">WHERE Clause</h1>
        <p className="text-sm text-text-secondary mt-1">
          Filter rows based on conditions — use comparison operators, logical operators, pattern matching with LIKE, and 
          NULL checks with IS NULL. WHERE is applied before other operations like ORDER BY or LIMIT, making it one of the 
          most essential SQL tools.
        </p>
      </div>

      <AnimationControls
        step={step}
        maxSteps={filters.length - 1}
        isPlaying={isPlaying}
        onPlay={play}
        onPause={pause}
        onReset={reset}
        onNext={next}
        onPrev={prev}
        stepLabel={filter.desc}
      />

      {/* Concept explanation */}
      <div className="p-3 bg-surface-2 rounded-mac border border-border">
        <p className="text-sm text-text-primary">{filter.detail}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={filter.sql} highlightLines={[3, 4]} />
        </MacWindow>

        <MacWindow title="employees — filtering" compact>
          <div className="p-3">
            <SqlTable
              table={employees}
              cellStyles={cellStyles}
              highlightColumns={filter.highlight}
            />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-success">{resultRows.length} rows matched</span>
              <span className="badge badge-warning">{employees.rows.length - resultRows.length} filtered out</span>
            </div>
            <SqlTable table={employees} visibleRows={resultRows} animateRows />
          </div>
        </MacWindow>
      </motion.div>

      {/* Query Playground */}
      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery="SELECT * FROM employees WHERE salary > 80000;"
          description="Write your own WHERE conditions. Try comparison operators (>, <, =), BETWEEN, IN, LIKE patterns, and IS NULL checks!"
        />
      </div>
    </div>
  );
}
