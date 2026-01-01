import { ColumnSchema, DashboardSpec, Visual } from '@/store/appStore';

// Intent types for classification
export type IntentType = 'comparison' | 'trend' | 'breakdown' | 'correlation' | 'outliers' | 'distribution' | 'summary';

export interface IntentResult {
  type: IntentType;
  confidence: number;
  reasoning: string;
}

export interface ColumnMapping {
  metrics: string[];
  dimensions: string[];
  filters: Record<string, string[]>;
  timeColumn: string | null;
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
  topN: number | null;
}

// STEP 1: Intent Classification - Determine what user is really asking
export function classifyIntent(prompt: string, schema: ColumnSchema[]): IntentResult {
  const promptLower = prompt.toLowerCase();
  
  // Keyword-based intent classification
  const intentPatterns: Record<IntentType, RegExp[]> = {
    trend: [
      /over\s+time/i, /trend/i, /growth/i, /change/i, /timeline/i,
      /month|year|week|day|quarter/i, /historical/i, /progression/i
    ],
    comparison: [
      /compare/i, /vs\.?|versus/i, /between/i, /difference/i,
      /better|worse/i, /side.?by.?side/i, /against/i
    ],
    breakdown: [
      /breakdown/i, /by\s+\w+/i, /split/i, /segment/i, /category/i,
      /distribution/i, /composition/i, /parts/i
    ],
    correlation: [
      /correlation/i, /relationship/i, /impact/i, /affect/i,
      /influence/i, /connection/i, /link/i
    ],
    outliers: [
      /top\s+\d+/i, /bottom\s+\d+/i, /best/i, /worst/i, /highest/i,
      /lowest/i, /extreme/i, /outlier/i, /exceptional/i
    ],
    distribution: [
      /distribution/i, /spread/i, /range/i, /frequency/i,
      /histogram/i, /pattern/i, /variance/i
    ],
    summary: [
      /total/i, /sum/i, /average/i, /overview/i, /summary/i,
      /kpi/i, /metric/i, /all\s+\w+/i
    ]
  };

  let bestIntent: IntentType = 'summary';
  let bestScore = 0;

  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    const matches = patterns.filter(p => p.test(promptLower)).length;
    if (matches > bestScore) {
      bestScore = matches;
      bestIntent = intent as IntentType;
    }
  }

  // Check for "by" pattern which indicates breakdown/comparison
  if (/\bby\s+\w+/i.test(promptLower) && bestIntent === 'summary') {
    bestIntent = 'comparison';
    bestScore = 1;
  }

  return {
    type: bestIntent,
    confidence: Math.min(0.95, 0.5 + (bestScore * 0.15)),
    reasoning: `Detected ${bestIntent} intent based on keyword analysis`
  };
}

// STEP 2: Intelligent Column Mapping
export function mapColumnsIntelligently(
  prompt: string,
  schema: ColumnSchema[],
  sampleData: Record<string, unknown>[]
): ColumnMapping {
  const promptLower = prompt.toLowerCase();
  const measures = schema.filter(s => s.type === 'measure');
  const dimensions = schema.filter(s => s.type === 'dimension');
  const dates = schema.filter(s => s.type === 'date');

  // Find referenced columns in prompt
  const findReferencedColumns = (columns: ColumnSchema[]): string[] => {
    return columns.filter(col => {
      const colLower = col.name.toLowerCase();
      // Direct match or partial match
      return promptLower.includes(colLower) || 
        colLower.split(/[_\s-]/).some(part => promptLower.includes(part));
    }).map(col => col.name);
  };

  // Extract metrics mentioned in prompt, fallback to first available
  let selectedMetrics = findReferencedColumns(measures);
  if (selectedMetrics.length === 0 && measures.length > 0) {
    selectedMetrics = [measures[0].name];
  }

  // Extract dimensions mentioned in prompt
  let selectedDimensions = findReferencedColumns(dimensions);
  if (selectedDimensions.length === 0 && dimensions.length > 0) {
    // If prompt mentions "by", look for the word after it
    const byMatch = promptLower.match(/by\s+(\w+)/);
    if (byMatch) {
      const byWord = byMatch[1];
      const matchedDim = dimensions.find(d => 
        d.name.toLowerCase().includes(byWord) || byWord.includes(d.name.toLowerCase())
      );
      if (matchedDim) {
        selectedDimensions = [matchedDim.name];
      }
    }
    // Still empty? Use first dimension
    if (selectedDimensions.length === 0) {
      selectedDimensions = [dimensions[0].name];
    }
  }

  // Find time column
  let timeColumn: string | null = null;
  if (dates.length > 0) {
    const referencedDates = findReferencedColumns(dates);
    timeColumn = referencedDates[0] || dates[0].name;
  }

  // Parse top N from prompt
  let topN: number | null = null;
  const topMatch = promptLower.match(/top\s+(\d+)/);
  const bottomMatch = promptLower.match(/bottom\s+(\d+)/);
  if (topMatch) topN = parseInt(topMatch[1], 10);
  if (bottomMatch) topN = parseInt(bottomMatch[1], 10);

  // Determine sort direction
  let sortDirection: 'asc' | 'desc' = 'desc';
  if (bottomMatch || /lowest|worst|least|ascending/i.test(promptLower)) {
    sortDirection = 'asc';
  }

  return {
    metrics: selectedMetrics,
    dimensions: selectedDimensions,
    filters: {},
    timeColumn,
    sortBy: selectedMetrics[0] || null,
    sortDirection,
    topN
  };
}

// STEP 3: Validation
export function validateMapping(mapping: ColumnMapping, schema: ColumnSchema[]): void {
  const schemaNames = schema.map(s => s.name);

  // Validate metrics exist
  for (const metric of mapping.metrics) {
    if (!schemaNames.includes(metric)) {
      throw new Error(`Column "${metric}" doesn't exist in data`);
    }
    const col = schema.find(s => s.name === metric);
    if (col && col.type !== 'measure') {
      console.warn(`Column "${metric}" is not a measure, using anyway`);
    }
  }

  // Validate dimensions exist
  for (const dim of mapping.dimensions) {
    if (!schemaNames.includes(dim)) {
      throw new Error(`Column "${dim}" doesn't exist in data`);
    }
  }

  // Validate time column
  if (mapping.timeColumn && !schemaNames.includes(mapping.timeColumn)) {
    throw new Error(`Time column "${mapping.timeColumn}" doesn't exist`);
  }
}

// STEP 4: Smart Visual Selection
export function selectOptimalVisuals(
  intent: IntentResult,
  mapping: ColumnMapping,
  schema: ColumnSchema[]
): Visual[] {
  const visuals: Visual[] = [];
  let visualId = 1;

  const primaryMetric = mapping.metrics[0] || 'value';
  const primaryDimension = mapping.dimensions[0] || '';

  // Always add a KPI card first
  visuals.push({
    id: `v${visualId++}`,
    type: 'card',
    title: `Total ${primaryMetric}`,
    metrics: [`SUM(${primaryMetric})`],
    dimensions: []
  });

  // Choose main visualization based on intent
  switch (intent.type) {
    case 'trend':
      const timeCol = mapping.timeColumn || primaryDimension;
      visuals.push({
        id: `v${visualId++}`,
        type: 'line',
        title: `${primaryMetric} Over Time`,
        metrics: [`SUM(${primaryMetric})`],
        dimensions: [timeCol],
        sort: 'asc'
      });
      // Add area chart for additional trend view
      visuals.push({
        id: `v${visualId++}`,
        type: 'area',
        title: `${primaryMetric} Trend`,
        metrics: [`SUM(${primaryMetric})`],
        dimensions: [timeCol],
        sort: 'asc'
      });
      break;

    case 'comparison':
      visuals.push({
        id: `v${visualId++}`,
        type: 'bar',
        title: `${primaryMetric} by ${primaryDimension}`,
        metrics: [`SUM(${primaryMetric})`],
        dimensions: [primaryDimension],
        sort: 'desc',
        topN: mapping.topN || 10
      });
      break;

    case 'breakdown':
      visuals.push({
        id: `v${visualId++}`,
        type: 'pie',
        title: `${primaryDimension} Distribution`,
        metrics: [`SUM(${primaryMetric})`],
        dimensions: [primaryDimension]
      });
      // Add bar for breakdown detail
      visuals.push({
        id: `v${visualId++}`,
        type: 'bar',
        title: `${primaryMetric} Breakdown`,
        metrics: [`SUM(${primaryMetric})`],
        dimensions: [primaryDimension],
        sort: 'desc'
      });
      break;

    case 'outliers':
      visuals.push({
        id: `v${visualId++}`,
        type: 'table',
        title: `Top ${mapping.topN || 10} ${primaryDimension}`,
        metrics: [`SUM(${primaryMetric})`],
        dimensions: [primaryDimension],
        sort: mapping.sortDirection,
        topN: mapping.topN || 10
      });
      visuals.push({
        id: `v${visualId++}`,
        type: 'bar',
        title: `${primaryMetric} Leaders`,
        metrics: [`SUM(${primaryMetric})`],
        dimensions: [primaryDimension],
        sort: mapping.sortDirection,
        topN: mapping.topN || 10
      });
      break;

    case 'distribution':
      visuals.push({
        id: `v${visualId++}`,
        type: 'histogram',
        title: `${primaryMetric} Distribution`,
        metrics: [`SUM(${primaryMetric})`],
        dimensions: [primaryDimension],
        bins: 10
      });
      break;

    case 'correlation':
      if (mapping.metrics.length >= 2) {
        visuals.push({
          id: `v${visualId++}`,
          type: 'scatter',
          title: `${mapping.metrics[0]} vs ${mapping.metrics[1]}`,
          metrics: mapping.metrics.slice(0, 2).map(m => `SUM(${m})`),
          dimensions: [primaryDimension]
        });
      } else {
        visuals.push({
          id: `v${visualId++}`,
          type: 'scatter',
          title: `${primaryMetric} Analysis`,
          metrics: [`SUM(${primaryMetric})`],
          dimensions: [primaryDimension]
        });
      }
      break;

    case 'summary':
    default:
      // Multiple KPI cards for summary
      if (mapping.metrics.length > 1) {
        mapping.metrics.slice(1, 4).forEach(metric => {
          visuals.push({
            id: `v${visualId++}`,
            type: 'card',
            title: `Total ${metric}`,
            metrics: [`SUM(${metric})`],
            dimensions: []
          });
        });
      }
      // Bar chart overview
      visuals.push({
        id: `v${visualId++}`,
        type: 'bar',
        title: `${primaryMetric} by ${primaryDimension}`,
        metrics: [`SUM(${primaryMetric})`],
        dimensions: [primaryDimension],
        sort: 'desc',
        topN: 10
      });
      // Pie chart for distribution
      visuals.push({
        id: `v${visualId++}`,
        type: 'pie',
        title: `${primaryDimension} Split`,
        metrics: [`SUM(${primaryMetric})`],
        dimensions: [primaryDimension]
      });
      break;
  }

  // Always add a detail table at the end
  visuals.push({
    id: `v${visualId++}`,
    type: 'table',
    title: 'Detailed Data',
    metrics: mapping.metrics.map(m => `SUM(${m})`),
    dimensions: mapping.dimensions.slice(0, 2),
    sort: 'desc',
    topN: 20
  });

  return visuals;
}

// STEP 5: Generate smart title
function generateSmartTitle(intent: IntentResult, mapping: ColumnMapping): string {
  const metric = mapping.metrics[0] || 'Data';
  const dim = mapping.dimensions[0] || '';
  
  const titleMap: Record<IntentType, string> = {
    trend: `${metric} Trend Analysis`,
    comparison: `${metric} Comparison${dim ? ` by ${dim}` : ''}`,
    breakdown: `${metric} Breakdown${dim ? ` by ${dim}` : ''}`,
    correlation: `${mapping.metrics.slice(0, 2).join(' vs ')} Analysis`,
    outliers: `Top ${mapping.topN || 10} ${dim || metric}`,
    distribution: `${metric} Distribution`,
    summary: `${metric} Dashboard`
  };

  return titleMap[intent.type] || `${metric} Dashboard`;
}

// Main robust dashboard generation function
export function generateRobustDashboard(
  schema: ColumnSchema[],
  sampleData: Record<string, unknown>[],
  userPrompt: string
): DashboardSpec {
  // Step 1: Classify intent
  const intent = classifyIntent(userPrompt, schema);
  console.log('Intent classified:', intent);

  // Step 2: Map columns
  const mapping = mapColumnsIntelligently(userPrompt, schema, sampleData);
  console.log('Columns mapped:', mapping);

  // Step 3: Validate mapping
  try {
    validateMapping(mapping, schema);
  } catch (error) {
    console.warn('Mapping validation warning:', error);
    // Continue with best-effort mapping
  }

  // Step 4: Select visuals
  const visuals = selectOptimalVisuals(intent, mapping, schema);
  console.log('Visuals selected:', visuals.length);

  // Step 5: Generate spec
  return {
    title: generateSmartTitle(intent, mapping),
    visuals
  };
}
