import { DataRow, Visual } from '@/store/appStore';

export interface AggregatedRow {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface AggregationConfig {
  metrics: string[];
  dimensions: string[];
  sort?: 'asc' | 'desc' | null;
  topN?: number | null;
  filters?: Record<string, string[]>;
  aggregationType?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

// Extract column name from aggregate function like SUM(column)
export function extractColumnName(metric: string): string {
  const match = metric.match(/(?:SUM|AVG|COUNT|MIN|MAX)\(([^)]+)\)/i);
  return match ? match[1] : metric;
}

// Detect aggregation type from metric string
function detectAggregationType(metric: string): 'sum' | 'avg' | 'count' | 'min' | 'max' {
  const metricUpper = metric.toUpperCase();
  if (metricUpper.startsWith('AVG')) return 'avg';
  if (metricUpper.startsWith('COUNT')) return 'count';
  if (metricUpper.startsWith('MIN')) return 'min';
  if (metricUpper.startsWith('MAX')) return 'max';
  return 'sum';
}

// Group data by specified dimensions
function groupByDimensions(
  data: DataRow[], 
  dimensions: string[]
): Map<string, DataRow[]> {
  const groups = new Map<string, DataRow[]>();
  
  data.forEach(row => {
    const key = dimensions.map(d => String(row[d] ?? 'Unknown')).join('|');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  });
  
  return groups;
}

// Calculate aggregate value for a group
function calculateAggregate(
  rows: DataRow[],
  columnName: string,
  aggType: 'sum' | 'avg' | 'count' | 'min' | 'max'
): number {
  if (rows.length === 0) return 0;

  const values = rows.map(row => {
    const val = row[columnName];
    if (typeof val === 'number') return val;
    const parsed = parseFloat(String(val));
    return isNaN(parsed) ? 0 : parsed;
  });

  switch (aggType) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'count':
      return values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return values.reduce((a, b) => a + b, 0);
  }
}

// Main aggregation function
export function aggregateData(
  rawData: DataRow[],
  config: AggregationConfig
): AggregatedRow[] {
  const { metrics, dimensions, sort, topN, filters } = config;

  // Step 1: Apply filters
  let filteredData = rawData;
  if (filters && Object.keys(filters).length > 0) {
    filteredData = rawData.filter(row => {
      return Object.entries(filters).every(([column, allowedValues]) => {
        const rowValue = String(row[column] ?? '');
        return allowedValues.includes(rowValue);
      });
    });
  }

  // Step 2: Handle no dimensions (total aggregation)
  if (!dimensions || dimensions.length === 0) {
    const result: AggregatedRow = { name: 'Total', value: 0 };
    
    metrics.forEach(metric => {
      const colName = extractColumnName(metric);
      const aggType = detectAggregationType(metric);
      result[metric] = calculateAggregate(filteredData, colName, aggType);
      if (metric === metrics[0]) {
        result.value = result[metric] as number;
      }
    });
    
    return [result];
  }

  // Step 3: Group by dimensions
  const groups = groupByDimensions(filteredData, dimensions);

  // Step 4: Calculate metrics for each group
  const results: AggregatedRow[] = [];
  
  groups.forEach((rows, key) => {
    const keyParts = key.split('|');
    const result: AggregatedRow = {
      name: keyParts[0],
      value: 0
    };

    // Add dimension values
    dimensions.forEach((dim, idx) => {
      result[dim] = keyParts[idx] ?? '';
    });

    // Calculate each metric
    metrics.forEach(metric => {
      const colName = extractColumnName(metric);
      const aggType = detectAggregationType(metric);
      result[metric] = calculateAggregate(rows, colName, aggType);
      
      // Set primary value for charting
      if (metric === metrics[0]) {
        result.value = result[metric] as number;
      }
    });

    results.push(result);
  });

  // Step 5: Sort results
  if (sort) {
    results.sort((a, b) => {
      const aVal = a.value;
      const bVal = b.value;
      return sort === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }

  // Step 6: Apply topN limit
  if (topN && topN > 0) {
    return results.slice(0, topN);
  }

  return results;
}

// Helper function to aggregate data for a specific visual
export function aggregateForVisual(
  rawData: DataRow[],
  visual: Visual
): AggregatedRow[] {
  const metrics = visual.metrics || [];
  const dimensions = visual.dimensions || [];

  return aggregateData(rawData, {
    metrics,
    dimensions,
    sort: visual.sort || null,
    topN: visual.topN,
    filters: visual.filters
  });
}

// Calculate histogram bins
export function calculateHistogram(
  data: DataRow[],
  metricName: string,
  bins: number = 10
): AggregatedRow[] {
  const colName = extractColumnName(metricName);
  const values = data.map(row => {
    const val = row[colName];
    return typeof val === 'number' ? val : parseFloat(String(val)) || 0;
  }).filter(v => !isNaN(v) && isFinite(v));

  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const binWidth = range / bins;

  const histogram: AggregatedRow[] = [];
  
  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = values.filter(v => v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)).length;
    
    histogram.push({
      name: `${binStart.toFixed(0)}-${binEnd.toFixed(0)}`,
      value: count,
      binStart,
      binEnd
    });
  }

  return histogram;
}

// Calculate scatter plot data points
export function calculateScatterData(
  data: DataRow[],
  xMetric: string,
  yMetric: string,
  labelDimension?: string
): Array<{ x: number; y: number; label: string }> {
  const xCol = extractColumnName(xMetric);
  const yCol = extractColumnName(yMetric);

  return data.map((row, idx) => {
    const x = typeof row[xCol] === 'number' ? row[xCol] : parseFloat(String(row[xCol])) || 0;
    const y = typeof row[yCol] === 'number' ? row[yCol] : parseFloat(String(row[yCol])) || 0;
    const label = labelDimension ? String(row[labelDimension] ?? `Point ${idx}`) : `Point ${idx}`;
    
    return { x, y, label };
  }).filter(point => !isNaN(point.x) && !isNaN(point.y));
}
