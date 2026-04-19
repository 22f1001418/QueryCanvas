import { QueryPlayground } from '../components/QueryPlayground';
import { useMemo, useState } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';

// Custom tables for join demos
const tableA = {
  name: 'employees',
  columns: ['id', 'name', 'dept_id'],
  rows: [
    [1, 'Alice', 1],
    [2, 'Bob', 1],
    [3, 'Carol', 2],
    [4, 'Dave', 3],
    [5, 'Eve', null],
  ] as (string | number | null)[][],
};

const tableB = {
  name: 'departments',
  columns: ['id', 'dept_name'],
  rows: [
    [1, 'Engineering'],
    [2, 'Marketing'],
    [3, 'Sales'],
    [4, 'Finance'],
  ] as (string | number | null)[][],
};

type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS';

interface JoinResult {
  columns: string[];
  rows: (string | number | null)[][];
  leftMatches: number[];
  rightMatches: number[];
}

function computeJoin(type: JoinType): JoinResult {
  const cols = ['e.id', 'e.name', 'e.dept_id', 'd.id', 'd.dept_name'];
  const rows: (string | number | null)[][] = [];
  const leftMatches = new Set<number>();
  const rightMatches = new Set<number>();

  if (type === 'CROSS') {
    tableA.rows.forEach((a, ai) => {
      tableB.rows.forEach((b, bi) => {
        rows.push([...a, ...b]);
        leftMatches.add(ai);
        rightMatches.add(bi);
      });
    });
    return { columns: cols, rows, leftMatches: [...leftMatches], rightMatches: [...rightMatches] };
  }

  // Find matches
  const matches: [number, number][] = [];
  tableA.rows.forEach((a, ai) => {
    tableB.rows.forEach((b, bi) => {
      if (a[2] !== null && a[2] === b[0]) {
        matches.push([ai, bi]);
      }
    });
  });

  const matchedLeft = new Set(matches.map(([a]) => a));
  const matchedRight = new Set(matches.map(([, b]) => b));

  if (type === 'INNER') {
    matches.forEach(([ai, bi]) => {
      rows.push([...tableA.rows[ai], ...tableB.rows[bi]]);
      leftMatches.add(ai);
      rightMatches.add(bi);
    });
  } else if (type === 'LEFT') {
    tableA.rows.forEach((a, ai) => {
      const myMatches = matches.filter(([l]) => l === ai);
      if (myMatches.length > 0) {
        myMatches.forEach(([, bi]) => {
          rows.push([...a, ...tableB.rows[bi]]);
          rightMatches.add(bi);
        });
      } else {
        rows.push([...a, null, null]);
      }
      leftMatches.add(ai);
    });
  } else if (type === 'RIGHT') {
    tableB.rows.forEach((b, bi) => {
      const myMatches = matches.filter(([, r]) => r === bi);
      if (myMatches.length > 0) {
        myMatches.forEach(([ai]) => {
          rows.push([...tableA.rows[ai], ...b]);
          leftMatches.add(ai);
        });
      } else {
        rows.push([null, null, null, ...b]);
      }
      rightMatches.add(bi);
    });
  } else if (type === 'FULL') {
    // Matched rows
    matches.forEach(([ai, bi]) => {
      rows.push([...tableA.rows[ai], ...tableB.rows[bi]]);
      leftMatches.add(ai);
      rightMatches.add(bi);
    });
    // Unmatched left
    tableA.rows.forEach((a, ai) => {
      if (!matchedLeft.has(ai)) {
        rows.push([...a, null, null]);
        leftMatches.add(ai);
      }
    });
    // Unmatched right
    tableB.rows.forEach((b, bi) => {
      if (!matchedRight.has(bi)) {
        rows.push([null, null, null, ...b]);
        rightMatches.add(bi);
      }
    });
  }

  return { columns: cols, rows, leftMatches: [...leftMatches], rightMatches: [...rightMatches] };
}

const joinTypes: { type: JoinType; sql: string; desc: string }[] = [
  {
    type: 'INNER',
    sql: `SELECT e.id, e.name, d.dept_name\nFROM employees e\nINNER JOIN departments d\n  ON e.dept_id = d.id;`,
    desc: 'Only matching rows from both tables',
  },
  {
    type: 'LEFT',
    sql: `SELECT e.id, e.name, d.dept_name\nFROM employees e\nLEFT JOIN departments d\n  ON e.dept_id = d.id;`,
    desc: 'All left rows + matching right (NULL if no match)',
  },
  {
    type: 'RIGHT',
    sql: `SELECT e.id, e.name, d.dept_name\nFROM employees e\nRIGHT JOIN departments d\n  ON e.dept_id = d.id;`,
    desc: 'All right rows + matching left (NULL if no match)',
  },
  {
    type: 'FULL',
    sql: `SELECT e.id, e.name, d.dept_name\nFROM employees e\nFULL OUTER JOIN departments d\n  ON e.dept_id = d.id;`,
    desc: 'All rows from both, NULL where no match',
  },
  {
    type: 'CROSS',
    sql: `SELECT e.id, e.name, d.dept_name\nFROM employees e\nCROSS JOIN departments d;`,
    desc: 'Every combination (cartesian product)',
  },
];

export function JoinsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(joinTypes.length - 1, 3000);
  const current = joinTypes[step];
  const result = useMemo(() => computeJoin(current.type), [step]);

  const leftStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    tableA.rows.forEach((_, ri) => {
      const matched = result.leftMatches.includes(ri);
      tableA.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = matched ? 'join-left' : 'removed';
      });
    });
    return styles;
  }, [step, result]);

  const rightStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    tableB.rows.forEach((_, ri) => {
      const matched = result.rightMatches.includes(ri);
      tableB.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = matched ? 'join-right' : 'removed';
      });
    });
    return styles;
  }, [step, result]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">JOINs</h1>
        <p className="text-sm text-text-secondary mt-1">
          Combine rows from two tables based on a related column. The most critical concept for analytics.
        </p>
      </div>

      <AnimationControls
        step={step} maxSteps={joinTypes.length - 1}
        isPlaying={isPlaying} onPlay={play} onPause={pause}
        onReset={reset} onNext={next} onPrev={prev}
        stepLabel={`${current.type} JOIN`}
      />

      {/* Venn diagram indicator */}
      <div className="flex items-center justify-center gap-6 py-2">
        {joinTypes.map((j, i) => (
          <button
            key={j.type}
            onClick={() => { reset(); setTimeout(() => { for (let k = 0; k < i; k++) next(); }, 0); }}
            className={`text-[12px] font-mono font-semibold px-3 py-1.5 rounded-md transition-all
              ${step === i ? 'bg-accent text-white' : 'bg-surface-2 text-text-secondary hover:bg-surface-3'}`}
          >
            {j.type}
          </button>
        ))}
      </div>

      <MacWindow title="Query" compact>
        <CodeBlock code={current.sql} highlightLines={[3, 4]} />
      </MacWindow>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MacWindow title="employees (left)" compact>
          <div className="p-3">
            <SqlTable table={tableA} cellStyles={leftStyles} />
          </div>
        </MacWindow>
        <MacWindow title="departments (right)" compact>
          <div className="p-3">
            <SqlTable table={tableB} cellStyles={rightStyles} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title={`Result — ${current.type} JOIN`}>
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-success">{result.rows.length} rows</span>
              <span className="text-[11px] text-text-secondary">{current.desc}</span>
            </div>
            <SqlTable
              table={{ name: 'result', columns: result.columns, rows: result.rows }}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      {/* Try it yourself */}
      <QueryPlayground
        initialQuery="SELECT e.name, d.dept_name FROM employees e INNER JOIN departments d ON e.department = d.dept_name;"
      />

    </div>
  );
}
