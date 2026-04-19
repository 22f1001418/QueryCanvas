import { QueryPlayground } from '../components/QueryPlayground';
import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';

const numTable = {
  name: 'measurements',
  columns: ['id', 'sensor', 'reading', 'offset_val'],
  rows: [
    [1, 'Temp-A', 23.6789, -4.5],
    [2, 'Temp-B', 18.1234, 3.2],
    [3, 'Pressure', 101.325, -0.8],
    [4, 'Humidity', 67.891, 12.0],
    [5, 'Temp-C', 42.5678, -7.3],
  ] as (string | number | null)[][],
};

const steps = [
  {
    sql: `SELECT sensor, reading,\n  ROUND(reading, 1) AS r1,\n  ROUND(reading, 0) AS r0\nFROM measurements;`,
    desc: 'ROUND — control decimal places',
    result: {
      columns: ['sensor', 'reading', 'r1', 'r0'],
      rows: [
        ['Temp-A', 23.6789, 23.7, 24],
        ['Temp-B', 18.1234, 18.1, 18],
        ['Pressure', 101.325, 101.3, 101],
        ['Humidity', 67.891, 67.9, 68],
        ['Temp-C', 42.5678, 42.6, 43],
      ],
    },
  },
  {
    sql: `SELECT sensor, reading,\n  CEIL(reading)  AS ceiling,\n  FLOOR(reading) AS floored\nFROM measurements;`,
    desc: 'CEIL & FLOOR — rounding direction',
    result: {
      columns: ['sensor', 'reading', 'ceiling', 'floored'],
      rows: [
        ['Temp-A', 23.6789, 24, 23],
        ['Temp-B', 18.1234, 19, 18],
        ['Pressure', 101.325, 102, 101],
        ['Humidity', 67.891, 68, 67],
        ['Temp-C', 42.5678, 43, 42],
      ],
    },
  },
  {
    sql: `SELECT sensor, offset_val,\n  ABS(offset_val) AS absolute\nFROM measurements;`,
    desc: 'ABS — absolute value',
    result: {
      columns: ['sensor', 'offset_val', 'absolute'],
      rows: [
        ['Temp-A', -4.5, 4.5],
        ['Temp-B', 3.2, 3.2],
        ['Pressure', -0.8, 0.8],
        ['Humidity', 12.0, 12.0],
        ['Temp-C', -7.3, 7.3],
      ],
    },
  },
  {
    sql: `SELECT id,\n  MOD(id, 2) AS is_odd,\n  POWER(id, 2) AS squared,\n  SQRT(CAST(id AS FLOAT))\n    AS root\nFROM measurements;`,
    desc: 'MOD, POWER, SQRT',
    result: {
      columns: ['id', 'is_odd', 'squared', 'root'],
      rows: [
        [1, 1, 1, 1.0],
        [2, 0, 4, 1.414],
        [3, 1, 9, 1.732],
        [4, 0, 16, 2.0],
        [5, 1, 25, 2.236],
      ],
    },
  },
];

export function NumericFnsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Numeric Functions</h1>
        <p className="text-sm text-text-secondary mt-1">
          Mathematical transformations — rounding, absolute values, modulo, powers, and roots.
        </p>
      </div>

      <AnimationControls step={step} maxSteps={steps.length - 1} isPlaying={isPlaying}
        onPlay={play} onPause={pause} onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} />
        </MacWindow>
        <MacWindow title="measurements — source" compact>
          <div className="p-3">
            <SqlTable table={numTable} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <SqlTable
              table={{ name: 'r', columns: current.result.columns, rows: current.result.rows }}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      {/* Try it yourself */}
      <QueryPlayground
        initialQuery="SELECT sensor, ROUND(reading, 1) AS rounded, ABS(offset_val) AS abs_off FROM measurements;"
      />

    </div>
  );
}
