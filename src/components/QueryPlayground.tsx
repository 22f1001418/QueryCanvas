import { useState, useEffect, useCallback } from 'react';
import { MacWindow } from './MacWindow';
import { SqlTable } from './SqlTable';
import { AnimationControls } from './AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import {
  AlertCircle, Play, Loader2, Database, ChevronRight, Table2, Trash2,
} from 'lucide-react';
import {
  runQuery, explainStepByStep, getAvailableTables,
  type ExecResult, type ExecutionStep,
} from '../utils/sqlEngine';
import { motion, AnimatePresence } from 'framer-motion';

interface QueryPlaygroundProps {
  initialQuery?: string;
  description?: string;
}

export function QueryPlayground({
  initialQuery = '',
  description = 'Write and execute SQL queries against real SQLite tables',
}: QueryPlaygroundProps) {
  const [userQuery, setUserQuery] = useState(initialQuery);
  const [result, setResult] = useState<ExecResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [showSchema, setShowSchema] = useState(false);
  const [schemas, setSchemas] = useState<Record<string, ExecResult>>({});

  // Step-by-step animation
  const { step: animStep, isPlaying, play, pause, reset, next, prev } = useAnimation(
    Math.max(steps.length - 1, 0),
    1200,
  );

  const handleExecute = useCallback(async () => {
    if (!userQuery.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setShowSteps(false);
    setSteps([]);
    reset();

    try {
      const res = await runQuery(userQuery);
      setResult(res);
    } catch (e: any) {
      setError(e?.message || 'Query execution failed');
    } finally {
      setLoading(false);
    }
  }, [userQuery, reset]);

  const handleExplain = useCallback(async () => {
    if (!userQuery.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSteps([]);
    reset();

    try {
      const s = await explainStepByStep(userQuery);
      setSteps(s);
      setShowSteps(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to explain query');
    } finally {
      setLoading(false);
    }
  }, [userQuery, reset]);

  const handleClear = () => {
    setUserQuery('');
    setResult(null);
    setError(null);
    setShowSteps(false);
    setSteps([]);
    reset();
  };

  // Load schema info
  const loadSchemas = useCallback(async () => {
    const tables = getAvailableTables();
    const s: Record<string, ExecResult> = {};
    for (const t of tables) {
      try {
        s[t] = await runQuery(`PRAGMA table_info(${t})`);
      } catch { /* skip */ }
    }
    setSchemas(s);
    setShowSchema((v) => !v);
  }, []);

  // Keyboard shortcut: Ctrl/Cmd + Enter to execute
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  const currentStep = steps[animStep] || null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-0.5 flex items-center gap-1.5">
            <Database size={14} className="text-accent" />
            Try It Yourself
            <span className="text-[9px] font-normal bg-success/15 text-success px-1.5 py-0.5 rounded-full">
              SQLite Engine
            </span>
          </h3>
          <p className="text-[11px] text-text-tertiary">{description}</p>
        </div>
        <button
          onClick={loadSchemas}
          className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-accent transition-colors"
        >
          <Table2 size={12} />
          {showSchema ? 'Hide' : 'Show'} Tables
        </button>
      </div>

      {/* Schema browser */}
      <AnimatePresence>
        {showSchema && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-2">
              {Object.entries(schemas).map(([table, info]) => (
                <div
                  key={table}
                  className="bg-surface-2 border border-border rounded-md p-2 cursor-pointer hover:border-accent/30 transition-colors"
                  onClick={() => setUserQuery(`SELECT * FROM ${table} LIMIT 10;`)}
                >
                  <div className="text-[11px] font-mono font-semibold text-text-primary mb-1">{table}</div>
                  <div className="space-y-0.5">
                    {info.rows.map((col, i) => (
                      <div key={i} className="text-[9px] font-mono text-text-tertiary flex justify-between">
                        <span>{String(col[1])}</span>
                        <span className="text-text-tertiary/50">{String(col[2])}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Query Input */}
      <MacWindow title="Your Query" compact>
        <div className="p-3 space-y-2">
          <textarea
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-28 p-3 font-mono text-[13px] bg-surface-1 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 leading-relaxed"
            placeholder="SELECT * FROM employees WHERE salary > 80000 ORDER BY salary DESC;"
            spellCheck={false}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleExecute}
              disabled={loading || !userQuery.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent text-white rounded-md text-[12px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-40"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
              Run
            </button>
            <button
              onClick={handleExplain}
              disabled={loading || !userQuery.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-3 text-text-primary rounded-md text-[12px] font-medium hover:bg-surface-3/80 transition-colors disabled:opacity-40 border border-border"
            >
              <ChevronRight size={12} />
              Step-by-Step
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1.5 text-text-tertiary hover:text-text-secondary text-[11px] transition-colors"
            >
              <Trash2 size={11} />
              Clear
            </button>
            <span className="text-[10px] text-text-tertiary ml-auto">⌘+Enter to run</span>
          </div>
        </div>
      </MacWindow>

      {/* Error */}
      {error && (
        <div className="p-3 bg-error/5 border border-error/15 rounded-mac-inner flex gap-2">
          <AlertCircle size={15} className="text-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-semibold text-error mb-0.5">SQL Error</p>
            <p className="text-[11px] text-text-secondary font-mono">{error}</p>
          </div>
        </div>
      )}

      {/* Direct result (from Run) */}
      {result && !showSteps && (
        <MacWindow title="Result">
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="badge badge-success">{result.rows.length} rows</span>
              <span className="badge badge-info">{result.columns.length} columns</span>
            </div>
            {result.rows.length > 0 ? (
              <SqlTable
                table={{ name: 'result', columns: result.columns, rows: result.rows }}
                animateRows
              />
            ) : (
              <p className="text-[11px] text-text-tertiary py-2">
                {result.columns.length === 0 ? 'Statement executed successfully (no output).' : 'No rows match the query.'}
              </p>
            )}
          </div>
        </MacWindow>
      )}

      {/* Step-by-step execution visualization */}
      {showSteps && steps.length > 0 && (
        <div className="space-y-3">
          <AnimationControls
            step={animStep}
            maxSteps={steps.length - 1}
            isPlaying={isPlaying}
            onPlay={play}
            onPause={pause}
            onReset={reset}
            onNext={next}
            onPrev={prev}
            stepLabel={currentStep?.phase}
          />

          {/* Phase pipeline bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => { reset(); for (let k = 0; k < i; k++) next(); }}
                className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all whitespace-nowrap
                  ${i === animStep
                    ? 'bg-accent text-white'
                    : i < animStep
                    ? 'bg-accent/10 text-accent'
                    : 'bg-surface-3 text-text-tertiary'
                  }`}
              >
                {s.phase}
              </button>
            ))}
          </div>

          {/* Current step detail */}
          {currentStep && (
            <motion.div
              key={animStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <MacWindow title={`${currentStep.phase} — ${currentStep.description}`} compact>
                <div className="p-3 space-y-3">
                  {/* Show the intermediate SQL */}
                  <div className="bg-surface-2 rounded-md p-2.5 font-mono text-[11px] text-text-secondary overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {currentStep.sql}
                  </div>

                  {/* Intermediate result */}
                  {currentStep.result.rows.length > 0 ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-success">{currentStep.result.rows.length} rows</span>
                        <span className="badge badge-info">{currentStep.result.columns.length} cols</span>
                      </div>
                      <SqlTable
                        table={{
                          name: 'step',
                          columns: currentStep.result.columns,
                          rows: currentStep.result.rows,
                        }}
                        animateRows
                      />
                    </div>
                  ) : (
                    <p className="text-[11px] text-text-tertiary">No rows at this stage.</p>
                  )}
                </div>
              </MacWindow>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
