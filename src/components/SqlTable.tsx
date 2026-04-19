import { motion, AnimatePresence } from 'framer-motion';
import { TableData } from '../data/sampleData';

export type CellStyle = '' | 'highlight' | 'join-left' | 'join-right' | 'join-match' | 'null' | 'selected' | 'new' | 'removed';

interface SqlTableProps {
  table: TableData;
  visibleColumns?: number[];
  visibleRows?: number[];
  cellStyles?: Record<string, CellStyle>;
  highlightColumns?: number[];
  animateRows?: boolean;
  caption?: string;
  compact?: boolean;
}

export function SqlTable({
  table,
  visibleColumns,
  visibleRows,
  cellStyles = {},
  highlightColumns = [],
  animateRows = false,
  caption,
  compact = false,
}: SqlTableProps) {
  const cols = visibleColumns ?? table.columns.map((_, i) => i);
  const rows = visibleRows ? visibleRows.map((i) => table.rows[i]) : table.rows;

  return (
    <div className="overflow-auto">
      {caption && (
        <div className="text-[11px] font-mono text-text-tertiary mb-1.5 uppercase tracking-wide">
          {caption}
        </div>
      )}
      <table className="sql-table w-full">
        <thead>
          <tr>
            {cols.map((ci) => (
              <th
                key={ci}
                className={highlightColumns.includes(ci) ? 'cell-highlight' : ''}
              >
                {table.columns[ci]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {rows.map((row, ri) => {
              const rowIndex = visibleRows ? visibleRows[ri] : ri;
              return (
                <motion.tr
                  key={`row-${rowIndex}`}
                  initial={animateRows ? { opacity: 0, x: -10 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25, delay: animateRows ? ri * 0.05 : 0 }}
                >
                  {cols.map((ci) => {
                    const key = `${rowIndex}-${ci}`;
                    const style = cellStyles[key] || '';
                    const val = row[ci];
                    const isNull = val === null;
                    const cellClass = style ? `cell-${style}` : isNull ? 'cell-null' : '';

                    return (
                      <td
                        key={ci}
                        className={`${cellClass} ${compact ? 'py-1 px-2 text-[12px]' : ''}`}
                      >
                        {isNull ? 'NULL' : String(val)}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
