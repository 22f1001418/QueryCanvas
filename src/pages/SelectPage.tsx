import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

const queries = [
  {
    sql: `SELECT * FROM employees;`,
    desc: 'Select all columns',
    detail: 'The asterisk (*) is a wildcard that means "all columns". This returns every column from the employee records.',
    cols: [0, 1, 2, 3, 4, 5],
    rows: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    sql: `SELECT name, salary\nFROM employees;`,
    desc: 'Select specific columns',
    detail: 'List the exact columns you want. Only "name" and "salary" are returned, ignoring other columns like department and hire_date.',
    cols: [1, 3],
    rows: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    sql: `SELECT DISTINCT department\nFROM employees;`,
    desc: 'Select distinct values',
    detail: 'DISTINCT removes duplicate values. Since many employees share departments, 4 unique departments appear instead of 8 rows.',
    cols: [2],
    rows: [0, 2, 4, 7],
  },
  {
    sql: `SELECT name, salary\nFROM employees\nLIMIT 3;`,
    desc: 'Limit results',
    detail: 'LIMIT restricts the number of rows returned. This query returns only the first 3 employees from the dataset.',
    cols: [1, 3],
    rows: [0, 1, 2],
  },
  {
    sql: `SELECT name, salary\nFROM employees\nLIMIT 3 OFFSET 2;`,
    desc: 'Offset and limit',
    detail: 'OFFSET skips a number of rows before returning results. Combined with LIMIT, this implements pagination: skip 2 rows, then return 3.',
    cols: [1, 3],
    rows: [2, 3, 4],
  },
];

export function SelectPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(queries.length - 1, 2000);
  const query = queries[step];

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    query.rows.forEach((ri) => {
      query.cols.forEach((ci) => {
        styles[`${ri}-${ci}`] = 'selected';
      });
    });
    return styles;
  }, [step]);

  const highlightLines = useMemo(() => {
    if (step === 0) return [1];
    if (step === 1) return [1];
    if (step === 2) return [1];
    if (step === 3) return [3];
    if (step === 4) return [3];
    return [];
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">SELECT Statement</h1>
        <p className="text-sm text-text-secondary mt-1">
          The foundation of SQL — retrieve data from tables by specifying columns and rows. The SELECT statement is the most 
          commonly used SQL command. It allows you to extract and view data from databases, choosing which columns to display 
          and which rows to include. Every SQL query begins with SELECT.
        </p>
      </div>

      <AnimationControls
        step={step}
        maxSteps={queries.length - 1}
        isPlaying={isPlaying}
        onPlay={play}
        onPause={pause}
        onReset={reset}
        onNext={next}
        onPrev={prev}
        stepLabel={query.desc}
      />

      {/* Concept explanation */}
      <div className="p-3 bg-surface-2 rounded-mac border border-border">
        <p className="text-sm text-text-primary">{query.detail}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Query */}
        <MacWindow title="Query" compact>
          <CodeBlock code={query.sql} highlightLines={highlightLines} />
        </MacWindow>

        {/* Source Table */}
        <MacWindow title="employees" compact>
          <div className="p-3">
            <SqlTable
              table={employees}
              cellStyles={cellStyles}
              animateRows
            />
          </div>
        </MacWindow>
      </div>

      {/* Result */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-success">{query.rows.length} rows</span>
              <span className="badge badge-info">{query.cols.length} columns</span>
            </div>
            <SqlTable
              table={
                step === 2
                  ? {
                      name: 'result',
                      columns: ['department'],
                      rows: [['Engineering'], ['Marketing'], ['Sales'], ['HR']],
                    }
                  : employees
              }
              visibleColumns={step === 2 ? undefined : query.cols}
              visibleRows={step === 2 ? undefined : query.rows}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      {/* Query Playground */}
      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery="SELECT * FROM employees;"
          description="Write your own SELECT queries. Try different column combinations, use DISTINCT, LIMIT, OFFSET, and more!"
        />
      </div>
    </div>
  );
}
