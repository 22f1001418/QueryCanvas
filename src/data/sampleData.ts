// Sample data tables used across visualizations

export interface TableData {
  name: string;
  columns: string[];
  rows: (string | number | null)[][];
}

export const employees: TableData = {
  name: 'employees',
  columns: ['id', 'name', 'department', 'salary', 'hire_date', 'manager_id'],
  rows: [
    [1, 'Alice', 'Engineering', 95000, '2020-03-15', null],
    [2, 'Bob', 'Engineering', 88000, '2021-06-01', 1],
    [3, 'Carol', 'Marketing', 72000, '2019-11-20', null],
    [4, 'Dave', 'Marketing', 68000, '2022-01-10', 3],
    [5, 'Eve', 'Sales', 78000, '2020-08-05', null],
    [6, 'Frank', 'Sales', 65000, '2023-02-14', 5],
    [7, 'Grace', 'Engineering', 102000, '2018-07-22', 1],
    [8, 'Hank', 'HR', 71000, '2021-09-30', null],
  ],
};

export const departments: TableData = {
  name: 'departments',
  columns: ['id', 'dept_name', 'location', 'budget'],
  rows: [
    [1, 'Engineering', 'Building A', 500000],
    [2, 'Marketing', 'Building B', 250000],
    [3, 'Sales', 'Building C', 300000],
    [4, 'HR', 'Building A', 150000],
    [5, 'Finance', 'Building D', 200000],
  ],
};

export const orders: TableData = {
  name: 'orders',
  columns: ['order_id', 'customer_id', 'product', 'amount', 'order_date'],
  rows: [
    [101, 1, 'Laptop', 1200, '2024-01-15'],
    [102, 2, 'Phone', 800, '2024-01-16'],
    [103, 1, 'Tablet', 500, '2024-01-18'],
    [104, 3, 'Laptop', 1200, '2024-02-01'],
    [105, 2, 'Monitor', 350, '2024-02-05'],
    [106, 4, 'Phone', 800, '2024-02-10'],
    [107, 1, 'Keyboard', 120, '2024-03-01'],
    [108, 5, 'Laptop', 1200, '2024-03-15'],
  ],
};

export const customers: TableData = {
  name: 'customers',
  columns: ['id', 'name', 'city', 'signup_date'],
  rows: [
    [1, 'Acme Corp', 'New York', '2023-01-10'],
    [2, 'GlobalTech', 'London', '2023-03-22'],
    [3, 'StartupXYZ', 'Berlin', '2023-06-15'],
    [4, 'MegaStore', 'Tokyo', '2023-08-01'],
    [5, 'DataFlow', 'Paris', '2023-11-20'],
    [6, 'CloudNine', 'Sydney', '2024-01-05'],
  ],
};
