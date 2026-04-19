import { QueryPlayground } from '../components/QueryPlayground';
import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';

const eventsTable = {
  name: 'user_events',
  columns: ['user_id', 'event', 'event_date', 'signup_date'],
  rows: [
    [1, 'login', '2024-03-15', '2024-01-10'],
    [1, 'purchase', '2024-03-18', '2024-01-10'],
    [2, 'login', '2024-02-20', '2023-11-05'],
    [2, 'login', '2024-04-01', '2023-11-05'],
    [3, 'purchase', '2024-01-25', '2024-01-20'],
    [3, 'login', '2024-05-10', '2024-01-20'],
  ] as (string | number | null)[][],
};

const steps = [
  {
    sql: `-- Current date functions\nSELECT\n  NOW()          AS right_now,\n  CURRENT_DATE   AS today,\n  CURRENT_TIME   AS time_now;`,
    desc: 'NOW(), CURRENT_DATE, CURRENT_TIME',
    result: {
      columns: ['right_now', 'today', 'time_now'],
      rows: [['2024-06-15 14:30:00', '2024-06-15', '14:30:00']],
    },
  },
  {
    sql: `-- Extract parts of a date\nSELECT event_date,\n  YEAR(event_date)  AS yr,\n  MONTH(event_date) AS mo,\n  DAY(event_date)   AS dy,\n  EXTRACT(QUARTER\n    FROM event_date) AS qtr\nFROM user_events;`,
    desc: 'YEAR, MONTH, DAY, EXTRACT',
    result: {
      columns: ['event_date', 'yr', 'mo', 'dy', 'qtr'],
      rows: [
        ['2024-03-15', 2024, 3, 15, 1],
        ['2024-03-18', 2024, 3, 18, 1],
        ['2024-02-20', 2024, 2, 20, 1],
        ['2024-04-01', 2024, 4, 1, 2],
        ['2024-01-25', 2024, 1, 25, 1],
        ['2024-05-10', 2024, 5, 10, 2],
      ],
    },
  },
  {
    sql: `-- Date arithmetic\nSELECT event_date,\n  DATE_ADD(event_date,\n    INTERVAL 30 DAY) AS plus_30,\n  DATE_SUB(event_date,\n    INTERVAL 7 DAY)  AS minus_7\nFROM user_events;`,
    desc: 'DATE_ADD, DATE_SUB — arithmetic',
    result: {
      columns: ['event_date', 'plus_30', 'minus_7'],
      rows: [
        ['2024-03-15', '2024-04-14', '2024-03-08'],
        ['2024-03-18', '2024-04-17', '2024-03-11'],
        ['2024-02-20', '2024-03-21', '2024-02-13'],
        ['2024-04-01', '2024-05-01', '2024-03-25'],
        ['2024-01-25', '2024-02-24', '2024-01-18'],
        ['2024-05-10', '2024-06-09', '2024-05-03'],
      ],
    },
  },
  {
    sql: `-- Days between dates\nSELECT user_id, event,\n  event_date, signup_date,\n  DATEDIFF(event_date,\n    signup_date) AS days_since\nFROM user_events;`,
    desc: 'DATEDIFF — days between dates',
    result: {
      columns: ['user_id', 'event', 'event_date', 'signup_date', 'days_since'],
      rows: [
        [1, 'login', '2024-03-15', '2024-01-10', 65],
        [1, 'purchase', '2024-03-18', '2024-01-10', 68],
        [2, 'login', '2024-02-20', '2023-11-05', 107],
        [2, 'login', '2024-04-01', '2023-11-05', 148],
        [3, 'purchase', '2024-01-25', '2024-01-20', 5],
        [3, 'login', '2024-05-10', '2024-01-20', 111],
      ],
    },
  },
  {
    sql: `-- Monthly active users (MAU)\nSELECT\n  DATE_FORMAT(event_date,\n    '%Y-%m') AS month,\n  COUNT(DISTINCT user_id)\n    AS active_users\nFROM user_events\nGROUP BY month\nORDER BY month;`,
    desc: 'DATE_FORMAT — MAU analysis',
    result: {
      columns: ['month', 'active_users'],
      rows: [
        ['2024-01', 1],
        ['2024-02', 1],
        ['2024-03', 1],
        ['2024-04', 1],
        ['2024-05', 1],
      ],
    },
  },
];

export function DateFnsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3000);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-text-primary">Date & Time Functions</h1>
          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold">IMPORTANT</span>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          Time-based analysis — extract date parts, do date math, compute intervals, and format for reporting.
        </p>
      </div>

      <AnimationControls step={step} maxSteps={steps.length - 1} isPlaying={isPlaying}
        onPlay={play} onPause={pause} onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} />
        </MacWindow>
        <MacWindow title="user_events — source" compact>
          <div className="p-3">
            <SqlTable table={eventsTable} />
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
        initialQuery="SELECT event, event_date, signup_date FROM user_events;"
      />

    </div>
  );
}
