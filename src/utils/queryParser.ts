import { TableData } from '../data/sampleData';

export interface QueryError {
  type: string;
  message: string;
  suggestion?: string;
}

export interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
}

interface ParsedQuery {
  select: string[];
  from: string;
  where?: string;
  orderBy?: { column: string; direction: 'ASC' | 'DESC' }[];
  limit?: number;
  offset?: number;
}

// Tokenize SQL
function tokenize(sql: string): string[] {
  return sql
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

// Check if string is a number
function isNumber(val: any): boolean {
  return !isNaN(val) && val !== '';
}

// Parse a WHERE clause condition
function evaluateCondition(
  condition: string,
  row: (string | number | null)[],
  columns: string[]
): boolean {
  try {
    const trimmed = condition.trim();

    // Handle NULL checks
    if (trimmed.toUpperCase().endsWith(' IS NULL')) {
      const col = trimmed.substring(0, trimmed.length - 8).trim();
      const colIdx = columns.indexOf(col);
      if (colIdx === -1) return false;
      return row[colIdx] === null;
    }

    if (trimmed.toUpperCase().endsWith(' IS NOT NULL')) {
      const col = trimmed.substring(0, trimmed.length - 12).trim();
      const colIdx = columns.indexOf(col);
      if (colIdx === -1) return false;
      return row[colIdx] !== null;
    }

    // Handle BETWEEN
    if (trimmed.toUpperCase().includes(' BETWEEN ')) {
      const parts = trimmed.split(/\s+BETWEEN\s+/i);
      if (parts.length !== 2) return false;
      const col = parts[0].trim();
      const rangeParts = parts[1].split(/\s+AND\s+/i);
      if (rangeParts.length !== 2) return false;

      const colIdx = columns.indexOf(col);
      if (colIdx === -1) return false;

      const value = row[colIdx];
      const min = parseInt(rangeParts[0].trim());
      const max = parseInt(rangeParts[1].trim());
      return value !== null && (value as number) >= min && (value as number) <= max;
    }

    // Handle IN
    if (trimmed.toUpperCase().includes(' IN (')) {
      const parts = trimmed.split(/\s+IN\s+\(/i);
      if (parts.length !== 2) return false;
      const col = parts[0].trim();
      const valueStr = parts[1].substring(0, parts[1].length - 1); // Remove closing )
      const values = valueStr.split(',').map((v) => v.trim().replace(/['"]/g, ''));

      const colIdx = columns.indexOf(col);
      if (colIdx === -1) return false;

      return values.includes(String(row[colIdx]));
    }

    // Handle LIKE
    if (trimmed.toUpperCase().includes(' LIKE ')) {
      const parts = trimmed.split(/\s+LIKE\s+/i);
      if (parts.length !== 2) return false;
      const col = parts[0].trim();
      const pattern = parts[1].trim().replace(/['"]/g, '');

      const colIdx = columns.indexOf(col);
      if (colIdx === -1) return false;

      const stringVal = String(row[colIdx]);
      if (pattern.startsWith('%') && pattern.endsWith('%')) {
        return stringVal.includes(pattern.slice(1, -1));
      } else if (pattern.startsWith('%')) {
        return stringVal.endsWith(pattern.slice(1));
      } else if (pattern.endsWith('%')) {
        return stringVal.startsWith(pattern.slice(0, -1));
      }
      return stringVal === pattern;
    }

    // Handle comparison operators
    const operators = ['>=', '<=', '<>', '!=', '>', '<', '='];
    for (const op of operators) {
      if (trimmed.includes(op)) {
        const parts = trimmed.split(new RegExp(`\\s*\\${op}\\s*`, 'i'));
        if (parts.length !== 2) continue;

        const col = parts[0].trim();
        const colIdx = columns.indexOf(col);
        if (colIdx === -1) continue;

        const value = row[colIdx];
        const compareVal = parts[1].trim().replace(/['"]/g, '');
        const numValue = isNumber(value) ? parseFloat(String(value)) : String(value);
        const numCompare = isNumber(compareVal) ? parseFloat(compareVal) : compareVal;

        switch (op) {
          case '=':
            return String(numValue) === String(numCompare);
          case '>':
            return numValue > numCompare;
          case '<':
            return numValue < numCompare;
          case '>=':
            return numValue >= numCompare;
          case '<=':
            return numValue <= numCompare;
          case '<>':
          case '!=':
            return String(numValue) !== String(numCompare);
        }
      }
    }

    return false;
  } catch (e) {
    return false;
  }
}

// Parse SQL query
function parseQuery(sql: string): { query: ParsedQuery | null; error?: QueryError } {
  try {
    const upperSql = sql.toUpperCase();

    // Extract SELECT
    const selectMatch = sql.match(/SELECT\s+([\s\S]*?)\s+FROM/i);
    if (!selectMatch) {
      return {
        query: null,
        error: {
          type: 'Syntax Error',
          message: 'Missing SELECT or FROM clause',
          suggestion: 'Use format: SELECT columns FROM table_name',
        },
      };
    }

    const selectStr = selectMatch[1].trim();
    const selectCols = selectStr === '*' ? ['*'] : selectStr.split(',').map((c) => c.trim());

    // Extract FROM
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    if (!fromMatch) {
      return { query: null, error: { type: 'Syntax Error', message: 'Missing FROM clause' } };
    }

    const from = fromMatch[1].toLowerCase();

    // Extract WHERE
    let whereClause: string | undefined;
    const whereMatch = sql.match(/WHERE\s+([\s\S]*?)(?:ORDER BY|LIMIT|$)/i);
    if (whereMatch) {
      whereClause = whereMatch[1].trim();
    }

    // Extract ORDER BY
    let orderBy: { column: string; direction: 'ASC' | 'DESC' }[] | undefined;
    const orderMatch = sql.match(/ORDER BY\s+([\s\S]*?)(?:LIMIT|$)/i);
    if (orderMatch) {
      const orderStr = orderMatch[1].trim();
      orderBy = orderStr.split(',').map((part) => {
        const [col, dir] = part.trim().split(/\s+/);
        return { column: col, direction: (dir?.toUpperCase() as 'ASC' | 'DESC') || 'ASC' };
      });
    }

    // Extract LIMIT
    let limit: number | undefined;
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      limit = parseInt(limitMatch[1]);
    }

    // Extract OFFSET
    let offset: number | undefined;
    const offsetMatch = sql.match(/OFFSET\s+(\d+)/i);
    if (offsetMatch) {
      offset = parseInt(offsetMatch[1]);
    }

    return {
      query: {
        select: selectCols,
        from,
        where: whereClause,
        orderBy,
        limit,
        offset,
      },
    };
  } catch (e) {
    return {
      query: null,
      error: { type: 'Parse Error', message: 'Failed to parse query' },
    };
  }
}

// Execute query
export function parseAndExecuteQuery(sql: string, tables: Record<string, TableData>): { result: QueryResult | null; error: QueryError | null } {
  // Validate input
  if (!sql || !sql.trim()) {
    return { result: null, error: null };
  }

  const parseResult = parseQuery(sql);
  if (parseResult.error) {
    return { result: null, error: parseResult.error };
  }

  const parsedQuery = parseResult.query!;
  const table = tables[parsedQuery.from];

  if (!table) {
    return {
      result: null,
      error: {
        type: 'Table Not Found',
        message: `Table '${parsedQuery.from}' does not exist`,
        suggestion: `Available tables: ${Object.keys(tables).join(', ')}`,
      },
    };
  }

  try {
    // Start with all rows
    let rows = [...table.rows];

    // Apply WHERE
    if (parsedQuery.where) {
      rows = rows.filter((row) => {
        const conditions = parsedQuery.where!.split(/\s+AND\s+/i);
        return conditions.every((cond) => evaluateCondition(cond, row, table.columns));
      });
    }

    // Apply ORDER BY
    if (parsedQuery.orderBy) {
      rows.sort((a, b) => {
        for (const { column, direction } of parsedQuery.orderBy!) {
          const colIdx = table.columns.indexOf(column);
          if (colIdx === -1) continue;

          const aVal = a[colIdx];
          const bVal = b[colIdx];

          if (aVal === null && bVal === null) continue;
          if (aVal === null) return direction === 'ASC' ? 1 : -1;
          if (bVal === null) return direction === 'ASC' ? -1 : 1;

          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          if (cmp !== 0) {
            return direction === 'ASC' ? cmp : -cmp;
          }
        }
        return 0;
      });
    }

    // Apply OFFSET and LIMIT
    let offset = parsedQuery.offset || 0;
    let limit = parsedQuery.limit;
    rows = rows.slice(offset, limit ? offset + limit : undefined);

    // Select columns
    let resultColumns = parsedQuery.select;
    if (parsedQuery.select[0] === '*') {
      resultColumns = table.columns;
    } else {
      // Validate columns exist
      for (const col of resultColumns) {
        if (!table.columns.includes(col)) {
          return {
            result: null,
            error: {
              type: 'Column Not Found',
              message: `Column '${col}' does not exist in table '${parsedQuery.from}'`,
              suggestion: `Available columns: ${table.columns.join(', ')}`,
            },
          };
        }
      }
    }

    const colIndices = resultColumns.map((col) => table.columns.indexOf(col));
    const resultRows = rows.map((row) => colIndices.map((idx) => row[idx]));

    return {
      result: {
        columns: resultColumns,
        rows: resultRows,
      },
      error: null,
    };
  } catch (e) {
    return {
      result: null,
      error: {
        type: 'Execution Error',
        message: `Failed to execute query: ${e instanceof Error ? e.message : 'Unknown error'}`,
      },
    };
  }
}
