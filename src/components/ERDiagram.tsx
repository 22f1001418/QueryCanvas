import React from 'react';

export interface TableSchema {
  name: string;
  columns: { name: string; type: string }[];
}

export interface Relationship {
  from: { table: string; column: string };
  to: { table: string; column: string };
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
}

interface ERDiagramProps {
  tables: TableSchema[];
  relationships: Relationship[];
}

export function ERDiagram({ tables, relationships }: ERDiagramProps) {
  // Color palette - Rose Pink & Slate
  const colors = {
    accent: '#DB2777',
    accentSubtle: 'rgba(219, 39, 119, 0.10)',
    textPrimary: '#1A1625',
    textSecondary: '#5C4B5A',
    textTertiary: '#8B7A8D',
    border: 'rgba(219, 39, 119, 0.08)',
    surface0: '#FBF7FC',
    surface1: '#FFFFFF',
  };
  const tableWidth = 200;
  const tableHeight = 120;
  const padding = 40;
  const spacing = tableWidth + 80;

  // Calculate positions
  const positions: Record<string, { x: number; y: number }> = {};
  tables.forEach((table, idx) => {
    positions[table.name] = {
      x: idx * spacing + padding,
      y: 50,
    };
  });

  // Get cardinality symbol
  const getCardinalitySymbol = (type: string) => {
    switch (type) {
      case 'one-to-one':
        return '1:1';
      case 'one-to-many':
        return '1:N';
      case 'many-to-one':
        return 'N:1';
      case 'many-to-many':
        return 'N:M';
      default:
        return '';
    }
  };

  return (
    <div className="w-full border border-border rounded-lg p-6 bg-surface-0">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Entity Relationship Diagram</h3>

      <div className="overflow-x-auto">
        <svg
          width={Math.max(800, (tables.length * spacing) + padding * 2)}
          height="300"
          className="mx-auto"
          style={{ background: colors.surface0 }}
        >
          {/* Draw relationship lines */}
          {relationships.map((rel, idx) => {
            const fromTable = positions[rel.from.table];
            const toTable = positions[rel.to.table];

            if (!fromTable || !toTable) return null;

            const fromX = fromTable.x + tableWidth;
            const fromY = fromTable.y + tableHeight / 2;
            const toX = toTable.x;
            const toY = toTable.y + tableHeight / 2;

            const midX = (fromX + toX) / 2;

            const isFromMany = rel.type === 'one-to-many' || rel.type === 'many-to-many' || rel.type === 'many-to-one';
            const isToMany = rel.type === 'one-to-many' || rel.type === 'many-to-many';

            return (
              <g key={`rel-${idx}`}>
                {/* Connection line */}
                <path
                  d={`M ${fromX} ${fromY} Q ${midX} ${fromY - 30} ${toX} ${toY}`}
                  stroke={colors.accent}
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                />

                {/* From cardinality */}
                {isFromMany ? (
                  <line
                    x1={fromX - 5}
                    y1={fromY - 4}
                    x2={fromX - 5}
                    y2={fromY + 4}
                    stroke={colors.accent}
                    strokeWidth="2"
                  />
                ) : (
                  <circle cx={fromX - 5} cy={fromY} r="4" fill={colors.accent} />
                )}

                {/* To cardinality */}
                {isToMany ? (
                  <line
                    x1={toX + 5}
                    y1={toY - 4}
                    x2={toX + 5}
                    y2={toY + 4}
                    stroke={colors.accent}
                    strokeWidth="2"
                  />
                ) : (
                  <circle cx={toX + 5} cy={toY} r="4" fill={colors.accent} />
                )}

                {/* Label */}
                <text
                  x={midX}
                  y={fromY - 35}
                  fontSize="11"
                  fill={colors.textSecondary}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {getCardinalitySymbol(rel.type)}
                </text>
              </g>
            );
          })}

          {/* Draw tables */}
          {tables.map((table) => {
            const pos = positions[table.name];
            if (!pos) return null;

            return (
              <g key={table.name}>
                {/* Table box */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={tableWidth}
                  height={tableHeight}
                  fill={colors.surface1}
                  stroke={colors.accent}
                  strokeWidth="2"
                  rx="4"
                />

                {/* Table name */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={tableWidth}
                  height="24"
                  fill={colors.accentSubtle}
                  rx="3"
                />
                <text
                  x={pos.x + tableWidth / 2}
                  y={pos.y + 16}
                  fontSize="12"
                  fontWeight="bold"
                  fill={colors.accent}
                  textAnchor="middle"
                >
                  {table.name.toUpperCase()}
                </text>

                {/* Columns */}
                {table.columns.slice(0, 4).map((col, idx) => (
                  <text
                    key={col.name}
                    x={pos.x + 8}
                    y={pos.y + 42 + idx * 16}
                    fontSize="10"
                    fill={colors.textSecondary}
                    fontFamily="monospace"
                  >
                    {col.name}
                    <tspan fontSize="9" fill={colors.textTertiary}>
                      {' '}
                      {col.type}
                    </tspan>
                  </text>
                ))}

                {table.columns.length > 4 && (
                  <text
                    x={pos.x + 8}
                    y={pos.y + 42 + 4 * 16}
                    fontSize="9"
                    fill={colors.textTertiary}
                    fontStyle="italic"
                  >
                    ... +{table.columns.length - 4} more
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-6 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.accent }} />
          <span>One (Primary Key)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5" style={{ backgroundColor: colors.accent }} />
          <span>Many (Foreign Key)</span>
        </div>
      </div>
    </div>
  );
}
