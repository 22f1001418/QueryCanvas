import { create } from 'zustand';

export type PageId =
  | 'select' | 'where' | 'orderby'
  | 'groupby' | 'joins' | 'subqueries'
  | 'window' | 'case' | 'cte'
  | 'aggregations' | 'sets'
  | 'datacleaning' | 'stringfns' | 'numericfns' | 'datefns';

export interface NavItem {
  id: PageId;
  label: string;
  icon: string;
  category: string;
  subtopics: string[];
}

export const navItems: NavItem[] = [
  {
    id: 'select', label: 'SELECT', icon: 'MousePointerClick', category: 'Basics',
    subtopics: ['SELECT *', 'Column selection', 'DISTINCT', 'LIMIT', 'OFFSET', 'Aliases'],
  },
  {
    id: 'where', label: 'WHERE', icon: 'Filter', category: 'Basics',
    subtopics: ['Comparison ops', 'AND / OR / NOT', 'BETWEEN', 'IN', 'LIKE / %', 'IS NULL'],
  },
  {
    id: 'orderby', label: 'ORDER BY', icon: 'ArrowUpDown', category: 'Basics',
    subtopics: ['ASC / DESC', 'Multi-column sort', 'NULL ordering', 'Date sorting'],
  },
  {
    id: 'aggregations', label: 'Aggregations', icon: 'Calculator', category: 'Grouping',
    subtopics: ['COUNT()', 'SUM()', 'AVG()', 'MIN() / MAX()', 'COUNT(*) vs COUNT(col)', 'NULL handling'],
  },
  {
    id: 'groupby', label: 'GROUP BY', icon: 'Group', category: 'Grouping',
    subtopics: ['GROUP BY', 'HAVING', 'WHERE vs HAVING', 'Multi-column grouping'],
  },
  {
    id: 'joins', label: 'JOINs', icon: 'Merge', category: 'Combining',
    subtopics: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER', 'CROSS JOIN', 'Self Join'],
  },
  {
    id: 'sets', label: 'Set Operations', icon: 'Layers', category: 'Combining',
    subtopics: ['UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT / MINUS'],
  },
  {
    id: 'subqueries', label: 'Subqueries', icon: 'GitBranch', category: 'Advanced SQL',
    subtopics: ['Scalar subquery', 'Column subquery', 'Correlated subquery', 'EXISTS'],
  },
  {
    id: 'cte', label: 'CTEs', icon: 'Workflow', category: 'Advanced SQL',
    subtopics: ['WITH clause', 'Chained CTEs', 'Recursive CTE'],
  },
  {
    id: 'window', label: 'Window Fns', icon: 'LayoutGrid', category: 'Advanced SQL',
    subtopics: ['ROW_NUMBER()', 'RANK()', 'DENSE_RANK()', 'LAG() / LEAD()', 'SUM() OVER', 'PARTITION BY'],
  },
  {
    id: 'case', label: 'CASE WHEN', icon: 'GitFork', category: 'Advanced SQL',
    subtopics: ['CASE WHEN THEN', 'Conditional aggregation', 'Bucketing / tiers'],
  },
  {
    id: 'datacleaning', label: 'Data Cleaning', icon: 'Eraser', category: 'Transformation',
    subtopics: ['COALESCE()', 'IFNULL()', 'CAST / CONVERT', 'Deduplication', 'Standardizing formats'],
  },
  {
    id: 'stringfns', label: 'String Fns', icon: 'Type', category: 'Transformation',
    subtopics: ['CONCAT()', 'SUBSTRING()', 'LEFT() / RIGHT()', 'TRIM()', 'UPPER() / LOWER()', 'REPLACE()', 'LENGTH()'],
  },
  {
    id: 'numericfns', label: 'Numeric Fns', icon: 'Hash', category: 'Transformation',
    subtopics: ['ROUND()', 'CEIL() / FLOOR()', 'ABS()', 'MOD()', 'POWER()', 'SQRT()'],
  },
  {
    id: 'datefns', label: 'Date & Time', icon: 'Calendar', category: 'Transformation',
    subtopics: ['NOW()', 'EXTRACT()', 'DATE_ADD()', 'DATEDIFF()', 'DATE_FORMAT()', 'YEAR() / MONTH()'],
  },
];

interface AppState {
  page: PageId;
  sidebarOpen: boolean;
  setPage: (page: PageId) => void;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
  page: 'select',
  sidebarOpen: true,
  setPage: (page) => set({ page }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
