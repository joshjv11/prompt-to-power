import { DashboardSpec, ColumnSchema, Visual } from '@/store/appStore';

export interface ChatSuggestion {
  text: string;
  category: 'chart' | 'filter' | 'layout' | 'style' | 'data';
  priority: number;
}

/**
 * Generate contextual chat suggestions based on the current dashboard state
 */
export function generateContextualSuggestions(
  spec: DashboardSpec,
  schema: ColumnSchema[],
  existingSuggestions: string[] = []
): ChatSuggestion[] {
  const suggestions: ChatSuggestion[] = [];
  const visualTypes = spec.visuals.map(v => v.type);
  const dimensions = schema.filter(s => s.type === 'dimension');
  const measures = schema.filter(s => s.type === 'measure');
  const dateColumns = schema.filter(s => s.type === 'date');
  
  // Chart type conversions based on what exists
  const hasBarChart = visualTypes.includes('bar');
  const hasPieChart = visualTypes.includes('pie');
  const hasLineChart = visualTypes.includes('line');
  const hasAreaChart = visualTypes.includes('area');
  const hasTable = visualTypes.includes('table');
  const hasCards = visualTypes.includes('card');
  
  // Suggest chart type changes
  if (hasBarChart && !hasPieChart) {
    suggestions.push({
      text: 'Change bar chart to pie chart',
      category: 'chart',
      priority: 10,
    });
  }
  
  if (hasPieChart && !hasBarChart) {
    suggestions.push({
      text: 'Change pie chart to bar chart',
      category: 'chart',
      priority: 10,
    });
  }
  
  if (hasBarChart && !hasLineChart && dateColumns.length > 0) {
    suggestions.push({
      text: 'Show as a line chart to see trends',
      category: 'chart',
      priority: 9,
    });
  }
  
  if (hasLineChart && !hasAreaChart) {
    suggestions.push({
      text: 'Change to area chart for better visualization',
      category: 'chart',
      priority: 8,
    });
  }
  
  // Data filtering suggestions
  if (dateColumns.length > 0) {
    suggestions.push({
      text: `Filter to last 6 months`,
      category: 'filter',
      priority: 9,
    });
    suggestions.push({
      text: `Show only this year's data`,
      category: 'filter',
      priority: 8,
    });
  }
  
  // Top N suggestions for charts
  const chartsWithDimensions = spec.visuals.filter(
    v => v.dimensions.length > 0 && !v.topN && ['bar', 'pie', 'table'].includes(v.type)
  );
  if (chartsWithDimensions.length > 0) {
    suggestions.push({
      text: 'Show only top 5 items',
      category: 'data',
      priority: 9,
    });
    suggestions.push({
      text: 'Show top 10 by value',
      category: 'data',
      priority: 8,
    });
  }
  
  // Sorting suggestions
  const unsortedCharts = spec.visuals.filter(
    v => !v.sort && ['bar', 'table'].includes(v.type)
  );
  if (unsortedCharts.length > 0) {
    suggestions.push({
      text: 'Sort by value descending',
      category: 'data',
      priority: 7,
    });
    suggestions.push({
      text: 'Sort in ascending order',
      category: 'data',
      priority: 6,
    });
  }
  
  // Add new visual suggestions based on what's missing
  if (!hasCards && measures.length > 0) {
    suggestions.push({
      text: `Add KPI cards for key metrics`,
      category: 'layout',
      priority: 8,
    });
  }
  
  if (!hasTable && spec.visuals.length > 2) {
    suggestions.push({
      text: 'Add a detailed data table',
      category: 'layout',
      priority: 7,
    });
  }
  
  if (!hasLineChart && dateColumns.length > 0 && measures.length > 0) {
    suggestions.push({
      text: `Add a trend chart over time`,
      category: 'chart',
      priority: 8,
    });
  }
  
  // Dimension-based suggestions
  const unusedDimensions = dimensions.filter(
    d => !spec.visuals.some(v => v.dimensions.includes(d.name))
  );
  if (unusedDimensions.length > 0) {
    const dim = unusedDimensions[0];
    suggestions.push({
      text: `Break down by ${dim.name}`,
      category: 'data',
      priority: 7,
    });
  }
  
  // Measure-based suggestions
  const unusedMeasures = measures.filter(
    m => !spec.visuals.some(v => v.metrics.includes(m.name))
  );
  if (unusedMeasures.length > 0) {
    const measure = unusedMeasures[0];
    suggestions.push({
      text: `Add ${measure.name} to the dashboard`,
      category: 'data',
      priority: 6,
    });
  }
  
  // Layout and style suggestions
  if (spec.visuals.length > 4) {
    suggestions.push({
      text: 'Simplify - keep only the most important charts',
      category: 'layout',
      priority: 5,
    });
  }
  
  if (spec.visuals.length < 3) {
    suggestions.push({
      text: 'Add more visualizations for a complete view',
      category: 'layout',
      priority: 5,
    });
  }
  
  // Combo chart suggestion
  if (hasBarChart && measures.length >= 2 && !visualTypes.includes('combo')) {
    suggestions.push({
      text: 'Create a combo chart with two metrics',
      category: 'chart',
      priority: 6,
    });
  }
  
  // Remove suggestions
  if (hasCards && spec.visuals.filter(v => v.type === 'card').length > 3) {
    suggestions.push({
      text: 'Remove some KPI cards to reduce clutter',
      category: 'layout',
      priority: 4,
    });
  }
  
  // Title change suggestion
  suggestions.push({
    text: 'Rename the dashboard title',
    category: 'style',
    priority: 3,
  });
  
  // Filter out already used suggestions
  const filtered = suggestions.filter(
    s => !existingSuggestions.includes(s.text)
  );
  
  // Sort by priority and return top suggestions
  return filtered
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8);
}

/**
 * Get suggestion icon based on category
 */
export function getSuggestionIcon(category: ChatSuggestion['category']): string {
  switch (category) {
    case 'chart': return '📊';
    case 'filter': return '🔍';
    case 'layout': return '📐';
    case 'style': return '🎨';
    case 'data': return '📈';
    default: return '💡';
  }
}

/**
 * Get category color class
 */
export function getSuggestionColor(category: ChatSuggestion['category']): string {
  switch (category) {
    case 'chart': return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20';
    case 'filter': return 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20';
    case 'layout': return 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20';
    case 'style': return 'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20';
    case 'data': return 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20';
    default: return 'bg-muted hover:bg-muted/80';
  }
}
