import { QueryPlayground } from '../components/QueryPlayground';
import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';

const strTable = {
  name: 'contacts',
  columns: ['id', 'full_name', 'email', 'city'],
  rows: [
    [1, 'Alice Smith', 'alice.smith@acme.com', '  New York  '],
    [2, 'Bob Jones', 'bob.jones@globaltech.co.uk', 'london'],
    [3, 'Carol White', 'carol@startup.io', 'BERLIN'],
    [4, 'Dave Brown-Lee', 'dave.brown@mega.store', 'Tokyo'],
    [5, 'Eve O\'Connor', 'eve@dataflow.paris', 'san francisco'],
  ] as (string | number | null)[][],
};

const steps = [
  {
    sql: `SELECT\n  CONCAT(full_name, ' <', email, '>')\n    AS display\nFROM contacts;`,
    desc: 'CONCAT — combine strings',
    result: {
      columns: ['display'],
      rows: [
        ['Alice Smith <alice.smith@acme.com>'],
        ['Bob Jones <bob.jones@globaltech.co.uk>'],
        ['Carol White <carol@startup.io>'],
        ['Dave Brown-Lee <dave.brown@mega.store>'],
        ["Eve O'Connor <eve@dataflow.paris>"],
      ],
    },
  },
  {
    sql: `-- Extract domain from email\nSELECT email,\n  SUBSTRING(\n    email,\n    POSITION('@' IN email) + 1\n  ) AS domain\nFROM contacts;`,
    desc: 'SUBSTRING + POSITION — extract domain',
    result: {
      columns: ['email', 'domain'],
      rows: [
        ['alice.smith@acme.com', 'acme.com'],
        ['bob.jones@globaltech.co.uk', 'globaltech.co.uk'],
        ['carol@startup.io', 'startup.io'],
        ['dave.brown@mega.store', 'mega.store'],
        ['eve@dataflow.paris', 'dataflow.paris'],
      ],
    },
  },
  {
    sql: `SELECT\n  LEFT(full_name, 1) AS initial,\n  RIGHT(email, 3) AS tld,\n  LENGTH(full_name) AS name_len\nFROM contacts;`,
    desc: 'LEFT, RIGHT, LENGTH',
    result: {
      columns: ['initial', 'tld', 'name_len'],
      rows: [['A', 'com', 11], ['B', '.uk', 9], ['C', '.io', 11], ['D', 'ore', 14], ['E', 'ris', 12]],
    },
  },
  {
    sql: `SELECT\n  TRIM(city) AS trimmed,\n  UPPER(city) AS upper_city,\n  LOWER(full_name) AS lower_name\nFROM contacts;`,
    desc: 'TRIM, UPPER, LOWER',
    result: {
      columns: ['trimmed', 'upper_city', 'lower_name'],
      rows: [
        ['New York', 'NEW YORK', 'alice smith'],
        ['london', 'LONDON', 'bob jones'],
        ['BERLIN', 'BERLIN', 'carol white'],
        ['Tokyo', 'TOKYO', 'dave brown-lee'],
        ['san francisco', 'SAN FRANCISCO', "eve o'connor"],
      ],
    },
  },
  {
    sql: `SELECT full_name,\n  REPLACE(\n    full_name, ' ', '_'\n  ) AS slug\nFROM contacts;`,
    desc: 'REPLACE — substitution',
    result: {
      columns: ['full_name', 'slug'],
      rows: [
        ['Alice Smith', 'Alice_Smith'],
        ['Bob Jones', 'Bob_Jones'],
        ['Carol White', 'Carol_White'],
        ['Dave Brown-Lee', 'Dave_Brown-Lee'],
        ["Eve O'Connor", "Eve_O'Connor"],
      ],
    },
  },
];

export function StringFnsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">String Functions</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manipulate text data — concatenate, extract, trim, change case, and replace characters.
        </p>
      </div>

      <AnimationControls step={step} maxSteps={steps.length - 1} isPlaying={isPlaying}
        onPlay={play} onPause={pause} onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} />
        </MacWindow>
        <MacWindow title="contacts — source" compact>
          <div className="p-3">
            <SqlTable table={strTable} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <SqlTable
              table={{ name: 'result', columns: current.result.columns, rows: current.result.rows }}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      {/* Try it yourself */}
      <QueryPlayground
        initialQuery="SELECT name, UPPER(name) AS upper_name, LENGTH(name) AS len FROM employees;"
      />

    </div>
  );
}
