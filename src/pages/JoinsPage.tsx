import { QueryPlayground } from '../components/QueryPlayground';
import { useMemo, useState } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';
import { ERDiagram, type TableSchema, type Relationship } from '../components/ERDiagram';

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

// Self-join table — employees with manager_id referencing same table
const selfEmpTable = {
  name: 'employees',
  columns: ['id', 'name', 'manager_id'],
  rows: [
    [1, 'Alice', null],
    [2, 'Bob', 1],
    [3, 'Carol', null],
    [4, 'Dave', 1],
    [5, 'Eve', 2],
  ] as (string | number | null)[][],
};

// Non-equi join tables — employees joined to salary grade bands
const nonEquiLeft = {
  name: 'employees',
  columns: ['id', 'name', 'salary'],
  rows: [
    [1, 'Alice', 95000],
    [2, 'Bob', 88000],
    [3, 'Carol', 72000],
    [4, 'Dave', 68000],
    [5, 'Eve', 78000],
  ] as (string | number | null)[][],
};

const salaryGrades = {
  name: 'salary_grades',
  columns: ['grade', 'min_sal', 'max_sal'],
  rows: [
    ['Junior', 60000, 74999],
    ['Mid', 75000, 89999],
    ['Senior', 90000, 110000],
  ] as (string | number | null)[][],
};

// ER Diagram schemas
const schemas: TableSchema[] = [
  {
    name: 'employees',
    columns: [
      { name: 'id', type: 'INT (PK)' },
      { name: 'name', type: 'VARCHAR' },
      { name: 'dept_id', type: 'INT (FK)' },
    ],
  },
  {
    name: 'departments',
    columns: [
      { name: 'id', type: 'INT (PK)' },
      { name: 'dept_name', type: 'VARCHAR' },
    ],
  },
];

const relationships: Relationship[] = [
  {
    from: { table: 'employees', column: 'dept_id' },
    to: { table: 'departments', column: 'id' },
    type: 'many-to-one',
  },
];

type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS' | 'SELF' | 'NONEQUI';

interface TableData {
  name: string;
  columns: string[];
  rows: (string | number | null)[][];
}

interface JoinResult {
  columns: string[];
  rows: (string | number | null)[][];
  leftMatches: number[];
  rightMatches: number[];
}

function getDisplayTables(type: JoinType): { left: TableData; right: TableData } {
  if (type === 'SELF') return { left: selfEmpTable, right: selfEmpTable };
  if (type === 'NONEQUI') return { left: nonEquiLeft, right: salaryGrades };
  return { left: tableA, right: tableB };
}

function getTableTitles(type: JoinType): { left: string; right: string } {
  if (type === 'SELF') return { left: 'employees e1 (employee)', right: 'employees e2 (manager)' };
  if (type === 'NONEQUI') return { left: 'employees (left)', right: 'salary_grades (right)' };
  return { left: 'employees (left)', right: 'departments (right)' };
}

function computeSelfJoin(): JoinResult {
  const cols = ['e1.id', 'employee', 'e1.manager_id', 'e2.id', 'manager'];
  const rows: (string | number | null)[][] = [];
  const leftMatches = new Set<number>();
  const rightMatches = new Set<number>();

  selfEmpTable.rows.forEach((e1, i) => {
    if (e1[2] === null) {
      rows.push([e1[0], e1[1], null, null, null]);
    } else {
      const mgr = selfEmpTable.rows.find((e2) => e2[0] === e1[2]);
      const mgrIdx = selfEmpTable.rows.findIndex((e2) => e2[0] === e1[2]);
      rows.push([e1[0], e1[1], e1[2], mgr ? mgr[0] : null, mgr ? mgr[1] : null]);
      if (mgrIdx !== -1) rightMatches.add(mgrIdx);
    }
    leftMatches.add(i);
  });

  return { columns: cols, rows, leftMatches: [...leftMatches], rightMatches: [...rightMatches] };
}

function computeNonEquiJoin(): JoinResult {
  const cols = ['e.name', 'e.salary', 'g.grade', 'g.min_sal', 'g.max_sal'];
  const rows: (string | number | null)[][] = [];
  const leftMatches = new Set<number>();
  const rightMatches = new Set<number>();

  nonEquiLeft.rows.forEach((e, i) => {
    const salary = e[2] as number;
    salaryGrades.rows.forEach((g, j) => {
      const minSal = g[1] as number;
      const maxSal = g[2] as number;
      if (salary >= minSal && salary <= maxSal) {
        rows.push([e[1], e[2], g[0], g[1], g[2]]);
        leftMatches.add(i);
        rightMatches.add(j);
      }
    });
  });

  return { columns: cols, rows, leftMatches: [...leftMatches], rightMatches: [...rightMatches] };
}

function computeJoin(type: JoinType): JoinResult {
  if (type === 'SELF') return computeSelfJoin();
  if (type === 'NONEQUI') return computeNonEquiJoin();
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
  {
    type: 'SELF',
    sql: `SELECT e1.name AS employee,\n       e2.name AS manager\nFROM employees e1\nLEFT JOIN employees e2\n  ON e1.manager_id = e2.id;`,
    desc: 'Join a table to itself — find each employee\'s manager',
  },
  {
    type: 'NONEQUI',
    sql: `SELECT e.name, e.salary,\n       g.grade\nFROM employees e\nJOIN salary_grades g\n  ON e.salary BETWEEN\n     g.min_sal AND g.max_sal;`,
    desc: 'Join condition uses inequality (BETWEEN) instead of equality',
  },
];

export function JoinsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(joinTypes.length - 1, 3000);
  const current = joinTypes[step];
  const result = useMemo(() => computeJoin(current.type), [step]);
  const displayTables = useMemo(() => getDisplayTables(current.type), [step]);
  const tableTitles = useMemo(() => getTableTitles(current.type), [step]);

  const leftStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    displayTables.left.rows.forEach((_, ri) => {
      const matched = result.leftMatches.includes(ri);
      displayTables.left.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = matched ? 'join-left' : 'removed';
      });
    });
    return styles;
  }, [step, result, displayTables]);

  const rightStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    displayTables.right.rows.forEach((_, ri) => {
      const matched = result.rightMatches.includes(ri);
      displayTables.right.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = matched ? 'join-right' : 'removed';
      });
    });
    return styles;
  }, [step, result, displayTables]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">JOINs</h1>
        <p className="text-sm text-text-secondary mt-1">
          Combine rows from two tables based on a related column. The most critical concept for analytics.
        </p>
      </div>

      {current.type !== 'SELF' && current.type !== 'NONEQUI' && (
        <ERDiagram tables={schemas} relationships={relationships} />
      )}

      {current.type === 'SELF' && (
        <div className="rounded-lg border border-border bg-surface-2 p-3 text-[12px] text-text-secondary">
          <span className="font-semibold text-text-primary">Self Join:</span> Both aliases (e1, e2) reference the same{' '}
          <span className="font-mono text-accent">employees</span> table. The ON condition links{' '}
          <span className="font-mono">e1.manager_id = e2.id</span> to resolve the manager's name.
        </div>
      )}

      {current.type === 'NONEQUI' && (
        <div className="rounded-lg border border-border bg-surface-2 p-3 text-[12px] text-text-secondary">
          <span className="font-semibold text-text-primary">Non-Equi Join:</span> The ON condition uses{' '}
          <span className="font-mono text-accent">BETWEEN</span> instead of <span className="font-mono">=</span>. Each
          employee salary is matched to the band whose range it falls within.
        </div>
      )}

      <AnimationControls
        step={step} maxSteps={joinTypes.length - 1}
        isPlaying={isPlaying} onPlay={play} onPause={pause}
        onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.type === 'NONEQUI' ? 'NON-EQUI JOIN' : `${current.type} JOIN`}
      />

      {/* Join type selector */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-2">
        {joinTypes.map((j, i) => (
          <button
            key={j.type}
            onClick={() => { reset(); setTimeout(() => { for (let k = 0; k < i; k++) next(); }, 0); }}
            className={`text-[12px] font-mono font-semibold px-3 py-1.5 rounded-md transition-all
              ${step === i ? 'bg-accent text-white' : 'bg-surface-2 text-text-secondary hover:bg-surface-3'}`}
          >
            {j.type === 'NONEQUI' ? 'NON-EQUI' : j.type}
          </button>
        ))}
      </div>

      <MacWindow title="Query" compact>
        <CodeBlock code={current.sql} highlightLines={[3, 4]} />
      </MacWindow>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MacWindow title={tableTitles.left} compact>
          <div className="p-3">
            <SqlTable table={displayTables.left} cellStyles={leftStyles} />
          </div>
        </MacWindow>
        <MacWindow title={tableTitles.right} compact>
          <div className="p-3">
            <SqlTable table={displayTables.right} cellStyles={rightStyles} />
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
        initialQuery="SELECT e.name, d.dept_name FROM employees e INNER JOIN departments d ON e.dept_id = d.id;"
      />

    </div>
  );
}
