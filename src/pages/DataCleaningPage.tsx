import { QueryPlayground } from '../components/QueryPlayground';
import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';

const dirtyTable = {
  name: 'raw_users',
  columns: ['id', 'name', 'email', 'phone', 'signup_date', 'status'],
  rows: [
    [1, 'Alice Smith', 'alice@test.com', '555-1234', '2024-01-15', 'active'],
    [2, 'BOB JONES', 'BOB@TEST.COM', null, '2024-01-16', 'Active'],
    [3, 'carol white', 'carol@test.com', '555-9999', '2024/02/01', null],
    [4, 'Alice Smith', 'alice@test.com', '555-1234', '2024-01-15', 'active'],
    [5, 'Dave Brown', null, '555-4444', '2024-03-10', 'inactive'],
    [6, ' Eve Wilson ', 'eve@test.com', '555-5555', '01-15-2024', 'ACTIVE'],
  ] as (string | number | null)[][],
};

const steps = [
  {
    sql: `-- Handle NULLs with COALESCE\nSELECT name,\n  COALESCE(email, 'no-email') AS email,\n  COALESCE(phone, 'N/A') AS phone,\n  COALESCE(status, 'unknown') AS status\nFROM raw_users;`,
    desc: 'COALESCE — replace NULLs',
    result: {
      columns: ['name', 'email', 'phone', 'status'],
      rows: [
        ['Alice Smith', 'alice@test.com', '555-1234', 'active'],
        ['BOB JONES', 'BOB@TEST.COM', 'N/A', 'Active'],
        ['carol white', 'carol@test.com', '555-9999', 'unknown'],
        ['Alice Smith', 'alice@test.com', '555-1234', 'active'],
        ['Dave Brown', 'no-email', '555-4444', 'inactive'],
        [' Eve Wilson ', 'eve@test.com', '555-5555', 'ACTIVE'],
      ],
    },
    highlightCols: [2, 3, 5],
  },
  {
    sql: `-- Remove duplicates\nSELECT DISTINCT name, email, phone\nFROM raw_users;`,
    desc: 'DISTINCT — remove duplicates',
    result: {
      columns: ['name', 'email', 'phone'],
      rows: [
        ['Alice Smith', 'alice@test.com', '555-1234'],
        ['BOB JONES', 'BOB@TEST.COM', null],
        ['carol white', 'carol@test.com', '555-9999'],
        ['Dave Brown', null, '555-4444'],
        [' Eve Wilson ', 'eve@test.com', '555-5555'],
      ],
    },
    highlightCols: [],
  },
  {
    sql: `-- Standardize with LOWER + TRIM\nSELECT\n  TRIM(LOWER(name)) AS name,\n  LOWER(email) AS email,\n  LOWER(status) AS status\nFROM raw_users;`,
    desc: 'Standardize formats — LOWER, TRIM',
    result: {
      columns: ['name', 'email', 'status'],
      rows: [
        ['alice smith', 'alice@test.com', 'active'],
        ['bob jones', 'bob@test.com', 'active'],
        ['carol white', 'carol@test.com', null],
        ['alice smith', 'alice@test.com', 'active'],
        ['dave brown', null, 'inactive'],
        ['eve wilson', 'eve@test.com', 'active'],
      ],
    },
    highlightCols: [1, 2, 5],
  },
  {
    sql: `-- Type casting\nSELECT name,\n  CAST(id AS VARCHAR) AS id_text,\n  CAST('2024-01-15' AS DATE)\n    AS parsed_date\nFROM raw_users;`,
    desc: 'CAST — convert data types',
    result: {
      columns: ['name', 'id_text', 'parsed_date'],
      rows: [
        ['Alice Smith', '1', '2024-01-15'],
        ['BOB JONES', '2', '2024-01-15'],
        ['carol white', '3', '2024-01-15'],
        ['Alice Smith', '4', '2024-01-15'],
        ['Dave Brown', '5', '2024-01-15'],
        [' Eve Wilson ', '6', '2024-01-15'],
      ],
    },
    highlightCols: [0],
  },
];

export function DataCleaningPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3000);
  const current = steps[step];

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    dirtyTable.rows.forEach((row, ri) => {
      dirtyTable.columns.forEach((_, ci) => {
        const val = row[ci];
        if (val === null) styles[`${ri}-${ci}`] = 'removed';
        else if (current.highlightCols.includes(ci)) styles[`${ri}-${ci}`] = 'highlight';
      });
    });
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Data Cleaning & Transformation</h1>
        <p className="text-sm text-text-secondary mt-1">
          Prepare raw data for analysis — handle NULLs, remove duplicates, standardize formats, and cast types.
        </p>
      </div>

      <AnimationControls step={step} maxSteps={steps.length - 1} isPlaying={isPlaying}
        onPlay={play} onPause={pause} onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} />
        </MacWindow>
        <MacWindow title="raw_users — dirty data" compact>
          <div className="p-3">
            <SqlTable table={dirtyTable} cellStyles={cellStyles} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result — cleaned">
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

      {/* Try it yourself */}
      <QueryPlayground
        initialQuery="SELECT name, COALESCE(manager_id, 0) AS mgr FROM employees;"
      />

    </div>
  );
}
