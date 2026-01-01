import { ColumnSchema, DashboardSpec, Visual } from '@/store/appStore';

// Generate a safe fallback dashboard when AI fails
export function generateFallbackDashboard(
  error: Error,
  schema: ColumnSchema[],
  prompt?: string
): DashboardSpec {
  console.warn('Generating fallback dashboard due to error:', error.message);

  const measures = schema.filter(s => s.type === 'measure');
  const dimensions = schema.filter(s => s.type === 'dimension');
  const dates = schema.filter(s => s.type === 'date');

  const visuals: Visual[] = [];
  let id = 1;

  // Handle case with no numeric columns
  if (measures.length === 0) {
    return {
      title: 'Data Preview',
      visuals: [{
        id: `v${id++}`,
        type: 'table',
        title: 'All Data',
        metrics: [],
        dimensions: schema.map(s => s.name).slice(0, 5),
        topN: 100
      }]
    };
  }

  const primaryMeasure = measures[0].name;
  const primaryDimension = dimensions[0]?.name || '';

  // KPI cards for first few measures
  measures.slice(0, 3).forEach(measure => {
    visuals.push({
      id: `v${id++}`,
      type: 'card',
      title: `Total ${measure.name}`,
      metrics: [`SUM(${measure.name})`],
      dimensions: []
    });
  });

  // Bar chart if we have dimensions
  if (dimensions.length > 0) {
    visuals.push({
      id: `v${id++}`,
      type: 'bar',
      title: `${primaryMeasure} by ${primaryDimension}`,
      metrics: [`SUM(${primaryMeasure})`],
      dimensions: [primaryDimension],
      sort: 'desc',
      topN: 10
    });
  }

  // Line chart if we have dates
  if (dates.length > 0) {
    visuals.push({
      id: `v${id++}`,
      type: 'line',
      title: `${primaryMeasure} Over Time`,
      metrics: [`SUM(${primaryMeasure})`],
      dimensions: [dates[0].name],
      sort: 'asc'
    });
  }

  // Pie chart for distribution
  if (dimensions.length > 0) {
    visuals.push({
      id: `v${id++}`,
      type: 'pie',
      title: `${primaryDimension} Distribution`,
      metrics: [`SUM(${primaryMeasure})`],
      dimensions: [primaryDimension]
    });
  }

  // Data table
  visuals.push({
    id: `v${id++}`,
    type: 'table',
    title: 'Detailed Data',
    metrics: measures.slice(0, 3).map(m => `SUM(${m.name})`),
    dimensions: dimensions.slice(0, 3).map(d => d.name),
    sort: 'desc',
    topN: 50
  });

  return {
    title: prompt ? `Analysis Dashboard` : 'Summary Dashboard',
    visuals: visuals.slice(0, 6) // Limit to 6 visuals
  };
}

// Validate and repair a dashboard spec
export function validateAndRepairSpec(
  spec: DashboardSpec,
  schema: ColumnSchema[]
): DashboardSpec {
  const schemaNames = schema.map(s => s.name);
  const measures = schema.filter(s => s.type === 'measure').map(s => s.name);
  const dimensions = schema.filter(s => s.type === 'dimension').map(s => s.name);
  const dates = schema.filter(s => s.type === 'date').map(s => s.name);
  const allDimensions = [...dimensions, ...dates];

  // Ensure title exists
  if (!spec.title || typeof spec.title !== 'string') {
    spec.title = 'Dashboard';
  }

  // Ensure visuals is an array
  if (!Array.isArray(spec.visuals)) {
    spec.visuals = [];
  }

  // Validate and repair each visual
  spec.visuals = spec.visuals.filter((visual, idx) => {
    try {
      // Ensure basic properties
      if (!visual.id) visual.id = `v${idx + 1}`;
      if (!visual.type) visual.type = 'bar';
      if (!visual.title) visual.title = `Visual ${idx + 1}`;
      if (!Array.isArray(visual.metrics)) visual.metrics = [];
      if (!Array.isArray(visual.dimensions)) visual.dimensions = [];

      // Validate and repair metrics
      visual.metrics = visual.metrics.map(metric => {
        const colName = extractColumnFromMetric(metric);
        
        // Check if column exists
        if (!schemaNames.includes(colName)) {
          // Try to find similar column
          const similar = findSimilarColumn(colName, schemaNames);
          if (similar) {
            return metric.replace(colName, similar);
          }
          // Use first available measure
          if (measures.length > 0) {
            return `SUM(${measures[0]})`;
          }
          return null;
        }
        return metric;
      }).filter((m): m is string => m !== null);

      // Validate and repair dimensions
      visual.dimensions = visual.dimensions.map(dim => {
        if (!schemaNames.includes(dim)) {
          const similar = findSimilarColumn(dim, schemaNames);
          if (similar) return similar;
          if (allDimensions.length > 0) return allDimensions[0];
          return null;
        }
        return dim;
      }).filter((d): d is string => d !== null);

      // Ensure at least one metric for non-table visuals
      if (visual.type !== 'table' && visual.metrics.length === 0 && measures.length > 0) {
        visual.metrics = [`SUM(${measures[0]})`];
      }

      // Validate visual type
      const validTypes = ['card', 'bar', 'line', 'pie', 'area', 'table', 'scatter', 'histogram', 'combo', 'heatmap', 'waterfall', 'funnel', 'gauge', 'treemap', 'bullet'];
      if (!validTypes.includes(visual.type)) {
        visual.type = 'bar';
      }

      return true;
    } catch (error) {
      console.warn('Removing invalid visual:', visual, error);
      return false;
    }
  });

  // Ensure at least one visual
  if (spec.visuals.length === 0 && measures.length > 0) {
    spec.visuals = [{
      id: 'v1',
      type: 'bar',
      title: `${measures[0]} Overview`,
      metrics: [`SUM(${measures[0]})`],
      dimensions: allDimensions.slice(0, 1)
    }];
  }

  return spec;
}

// Extract column name from metric like SUM(column)
function extractColumnFromMetric(metric: string): string {
  const match = metric.match(/(?:SUM|AVG|COUNT|MIN|MAX)\(([^)]+)\)/i);
  return match ? match[1] : metric;
}

// Find similar column name using fuzzy matching
function findSimilarColumn(target: string, candidates: string[]): string | null {
  const targetLower = target.toLowerCase();
  
  // Exact match (case insensitive)
  const exactMatch = candidates.find(c => c.toLowerCase() === targetLower);
  if (exactMatch) return exactMatch;
  
  // Partial match
  const partialMatch = candidates.find(c => 
    c.toLowerCase().includes(targetLower) || targetLower.includes(c.toLowerCase())
  );
  if (partialMatch) return partialMatch;
  
  // Word match
  const targetWords = targetLower.split(/[_\s-]/);
  const wordMatch = candidates.find(c => {
    const candWords = c.toLowerCase().split(/[_\s-]/);
    return targetWords.some(tw => candWords.some(cw => tw === cw || cw.includes(tw)));
  });
  
  return wordMatch || null;
}

// Validate a single visual
export function isValidVisual(visual: Visual, schema: ColumnSchema[]): boolean {
  if (!visual.type || !visual.title) return false;
  if (!Array.isArray(visual.metrics)) return false;
  if (!Array.isArray(visual.dimensions)) return false;
  
  const schemaNames = schema.map(s => s.name);
  
  // Check all referenced columns exist
  for (const metric of visual.metrics) {
    const colName = extractColumnFromMetric(metric);
    if (!schemaNames.includes(colName)) {
      return false;
    }
  }
  
  for (const dim of visual.dimensions) {
    if (!schemaNames.includes(dim)) {
      return false;
    }
  }
  
  return true;
}
