import { DataRow, ColumnSchema } from '@/store/appStore';

// Sales Dataset
export const salesData: DataRow[] = [
  { Date: '2024-01-15', Product: 'Laptop Pro', Region: 'North', Sales: 15000, Quantity: 10, Cost: 12000 },
  { Date: '2024-01-16', Product: 'Wireless Mouse', Region: 'South', Sales: 2500, Quantity: 50, Cost: 1500 },
  { Date: '2024-01-17', Product: 'Laptop Pro', Region: 'East', Sales: 18000, Quantity: 12, Cost: 14400 },
  { Date: '2024-01-18', Product: 'Monitor 4K', Region: 'West', Sales: 8000, Quantity: 8, Cost: 6000 },
  { Date: '2024-01-19', Product: 'Keyboard RGB', Region: 'North', Sales: 3500, Quantity: 35, Cost: 2100 },
  { Date: '2024-01-20', Product: 'Laptop Pro', Region: 'South', Sales: 22500, Quantity: 15, Cost: 18000 },
  { Date: '2024-01-21', Product: 'Wireless Mouse', Region: 'East', Sales: 3000, Quantity: 60, Cost: 1800 },
  { Date: '2024-01-22', Product: 'Monitor 4K', Region: 'North', Sales: 12000, Quantity: 12, Cost: 9000 },
  { Date: '2024-01-23', Product: 'Keyboard RGB', Region: 'West', Sales: 4200, Quantity: 42, Cost: 2520 },
  { Date: '2024-01-24', Product: 'Headphones Pro', Region: 'South', Sales: 6000, Quantity: 20, Cost: 4000 },
  { Date: '2024-02-01', Product: 'Laptop Pro', Region: 'North', Sales: 19500, Quantity: 13, Cost: 15600 },
  { Date: '2024-02-02', Product: 'Monitor 4K', Region: 'East', Sales: 10000, Quantity: 10, Cost: 7500 },
  { Date: '2024-02-03', Product: 'Wireless Mouse', Region: 'West', Sales: 2800, Quantity: 56, Cost: 1680 },
  { Date: '2024-02-04', Product: 'Headphones Pro', Region: 'North', Sales: 7500, Quantity: 25, Cost: 5000 },
  { Date: '2024-02-05', Product: 'Keyboard RGB', Region: 'South', Sales: 3800, Quantity: 38, Cost: 2280 },
  { Date: '2024-02-06', Product: 'Laptop Pro', Region: 'East', Sales: 21000, Quantity: 14, Cost: 16800 },
  { Date: '2024-02-07', Product: 'Monitor 4K', Region: 'West', Sales: 9000, Quantity: 9, Cost: 6750 },
  { Date: '2024-02-08', Product: 'Wireless Mouse', Region: 'North', Sales: 3200, Quantity: 64, Cost: 1920 },
  { Date: '2024-02-09', Product: 'Headphones Pro', Region: 'South', Sales: 8400, Quantity: 28, Cost: 5600 },
  { Date: '2024-02-10', Product: 'Keyboard RGB', Region: 'East', Sales: 4500, Quantity: 45, Cost: 2700 },
  { Date: '2024-03-01', Product: 'Laptop Pro', Region: 'West', Sales: 24000, Quantity: 16, Cost: 19200 },
  { Date: '2024-03-02', Product: 'Monitor 4K', Region: 'North', Sales: 11000, Quantity: 11, Cost: 8250 },
  { Date: '2024-03-03', Product: 'Wireless Mouse', Region: 'South', Sales: 2600, Quantity: 52, Cost: 1560 },
  { Date: '2024-03-04', Product: 'Headphones Pro', Region: 'East', Sales: 9000, Quantity: 30, Cost: 6000 },
  { Date: '2024-03-05', Product: 'Keyboard RGB', Region: 'West', Sales: 5000, Quantity: 50, Cost: 3000 },
];

export const salesSchema: ColumnSchema[] = [
  { name: 'Date', type: 'date', dataType: 'date', sampleValues: ['2024-01-15', '2024-01-16', '2024-01-17'] },
  { name: 'Product', type: 'dimension', dataType: 'string', sampleValues: ['Laptop Pro', 'Wireless Mouse', 'Monitor 4K'] },
  { name: 'Region', type: 'dimension', dataType: 'string', sampleValues: ['North', 'South', 'East', 'West'] },
  { name: 'Sales', type: 'measure', dataType: 'number', sampleValues: [15000, 2500, 18000] },
  { name: 'Quantity', type: 'measure', dataType: 'number', sampleValues: [10, 50, 12] },
  { name: 'Cost', type: 'measure', dataType: 'number', sampleValues: [12000, 1500, 14400] },
];

// Employees Dataset
export const employeesData: DataRow[] = [
  { ID: 1, Name: 'Alice Johnson', Department: 'Engineering', Salary: 95000, JoinDate: '2021-03-15', PerformanceScore: 4.5 },
  { ID: 2, Name: 'Bob Smith', Department: 'Marketing', Salary: 72000, JoinDate: '2020-07-22', PerformanceScore: 4.2 },
  { ID: 3, Name: 'Carol Williams', Department: 'Engineering', Salary: 105000, JoinDate: '2019-01-10', PerformanceScore: 4.8 },
  { ID: 4, Name: 'David Brown', Department: 'Sales', Salary: 68000, JoinDate: '2022-02-28', PerformanceScore: 3.9 },
  { ID: 5, Name: 'Eva Martinez', Department: 'HR', Salary: 62000, JoinDate: '2021-09-05', PerformanceScore: 4.1 },
  { ID: 6, Name: 'Frank Lee', Department: 'Engineering', Salary: 115000, JoinDate: '2018-06-20', PerformanceScore: 4.9 },
  { ID: 7, Name: 'Grace Chen', Department: 'Marketing', Salary: 78000, JoinDate: '2020-11-12', PerformanceScore: 4.4 },
  { ID: 8, Name: 'Henry Wilson', Department: 'Sales', Salary: 82000, JoinDate: '2019-04-18', PerformanceScore: 4.6 },
  { ID: 9, Name: 'Ivy Thompson', Department: 'Engineering', Salary: 98000, JoinDate: '2021-01-25', PerformanceScore: 4.3 },
  { ID: 10, Name: 'Jack Davis', Department: 'HR', Salary: 58000, JoinDate: '2022-06-10', PerformanceScore: 3.8 },
  { ID: 11, Name: 'Karen White', Department: 'Sales', Salary: 75000, JoinDate: '2020-03-08', PerformanceScore: 4.0 },
  { ID: 12, Name: 'Leo Garcia', Department: 'Marketing', Salary: 85000, JoinDate: '2019-08-14', PerformanceScore: 4.7 },
  { ID: 13, Name: 'Mia Robinson', Department: 'Engineering', Salary: 110000, JoinDate: '2018-12-01', PerformanceScore: 4.8 },
  { ID: 14, Name: 'Noah Clark', Department: 'Sales', Salary: 71000, JoinDate: '2021-05-20', PerformanceScore: 4.2 },
  { ID: 15, Name: 'Olivia Lewis', Department: 'HR', Salary: 65000, JoinDate: '2020-09-30', PerformanceScore: 4.5 },
];

export const employeesSchema: ColumnSchema[] = [
  { name: 'ID', type: 'dimension', dataType: 'number', sampleValues: [1, 2, 3] },
  { name: 'Name', type: 'dimension', dataType: 'string', sampleValues: ['Alice Johnson', 'Bob Smith', 'Carol Williams'] },
  { name: 'Department', type: 'dimension', dataType: 'string', sampleValues: ['Engineering', 'Marketing', 'Sales', 'HR'] },
  { name: 'Salary', type: 'measure', dataType: 'number', sampleValues: [95000, 72000, 105000] },
  { name: 'JoinDate', type: 'date', dataType: 'date', sampleValues: ['2021-03-15', '2020-07-22', '2019-01-10'] },
  { name: 'PerformanceScore', type: 'measure', dataType: 'number', sampleValues: [4.5, 4.2, 4.8] },
];

// Analytics Dataset
export const analyticsData: DataRow[] = [
  { Date: '2024-01-01', Page: 'Homepage', Visitors: 12500, BounceRate: 35.2, Conversions: 450 },
  { Date: '2024-01-01', Page: 'Products', Visitors: 8200, BounceRate: 28.5, Conversions: 380 },
  { Date: '2024-01-01', Page: 'Blog', Visitors: 5600, BounceRate: 42.1, Conversions: 120 },
  { Date: '2024-01-01', Page: 'Contact', Visitors: 2100, BounceRate: 22.3, Conversions: 85 },
  { Date: '2024-01-02', Page: 'Homepage', Visitors: 13200, BounceRate: 33.8, Conversions: 485 },
  { Date: '2024-01-02', Page: 'Products', Visitors: 8900, BounceRate: 26.9, Conversions: 420 },
  { Date: '2024-01-02', Page: 'Blog', Visitors: 6100, BounceRate: 40.5, Conversions: 135 },
  { Date: '2024-01-02', Page: 'Contact', Visitors: 2300, BounceRate: 20.8, Conversions: 95 },
  { Date: '2024-01-03', Page: 'Homepage', Visitors: 11800, BounceRate: 36.5, Conversions: 420 },
  { Date: '2024-01-03', Page: 'Products', Visitors: 7800, BounceRate: 29.2, Conversions: 350 },
  { Date: '2024-01-03', Page: 'Blog', Visitors: 5200, BounceRate: 43.8, Conversions: 110 },
  { Date: '2024-01-03', Page: 'Contact', Visitors: 1900, BounceRate: 24.1, Conversions: 78 },
  { Date: '2024-01-04', Page: 'Homepage', Visitors: 14500, BounceRate: 32.1, Conversions: 520 },
  { Date: '2024-01-04', Page: 'Products', Visitors: 9500, BounceRate: 25.6, Conversions: 445 },
  { Date: '2024-01-04', Page: 'Blog', Visitors: 6800, BounceRate: 39.2, Conversions: 155 },
  { Date: '2024-01-04', Page: 'Contact', Visitors: 2600, BounceRate: 19.5, Conversions: 108 },
  { Date: '2024-01-05', Page: 'Homepage', Visitors: 15200, BounceRate: 31.4, Conversions: 545 },
  { Date: '2024-01-05', Page: 'Products', Visitors: 10200, BounceRate: 24.8, Conversions: 480 },
  { Date: '2024-01-05', Page: 'Blog', Visitors: 7200, BounceRate: 38.5, Conversions: 168 },
  { Date: '2024-01-05', Page: 'Contact', Visitors: 2800, BounceRate: 18.9, Conversions: 115 },
];

export const analyticsSchema: ColumnSchema[] = [
  { name: 'Date', type: 'date', dataType: 'date', sampleValues: ['2024-01-01', '2024-01-02', '2024-01-03'] },
  { name: 'Page', type: 'dimension', dataType: 'string', sampleValues: ['Homepage', 'Products', 'Blog', 'Contact'] },
  { name: 'Visitors', type: 'measure', dataType: 'number', sampleValues: [12500, 8200, 5600] },
  { name: 'BounceRate', type: 'measure', dataType: 'number', sampleValues: [35.2, 28.5, 42.1] },
  { name: 'Conversions', type: 'measure', dataType: 'number', sampleValues: [450, 380, 120] },
];

export interface DemoDataset {
  name: string;
  description: string;
  icon: string;
  data: DataRow[];
  schema: ColumnSchema[];
  suggestedPrompts: string[];
}

export const demoDatasets: DemoDataset[] = [
  {
    name: 'Sales Data',
    description: 'Product sales across regions',
    icon: '📊',
    data: salesData,
    schema: salesSchema,
    suggestedPrompts: [
      'Show total sales by region with a bar chart',
      'Compare product performance over time',
      'Display top selling products with profit margins',
    ],
  },
  {
    name: 'Employee Data',
    description: 'HR analytics & performance',
    icon: '👥',
    data: employeesData,
    schema: employeesSchema,
    suggestedPrompts: [
      'Show salary distribution by department',
      'Display performance scores across teams',
      'Analyze employee tenure and compensation',
    ],
  },
  {
    name: 'Web Analytics',
    description: 'Website traffic & conversions',
    icon: '📈',
    data: analyticsData,
    schema: analyticsSchema,
    suggestedPrompts: [
      'Show visitor trends by page',
      'Compare bounce rates across pages',
      'Display conversion funnel analysis',
    ],
  },
];
