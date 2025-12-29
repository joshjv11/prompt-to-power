import { ColumnSchema, DashboardSpec, Visual } from '@/store/appStore';

interface PromptAnalysis {
  wantsSales: boolean;
  wantsRegion: boolean;
  wantsProduct: boolean;
  wantsTime: boolean;
  wantsTop: boolean;
  wantsComparison: boolean;
  wantsDistribution: boolean;
  wantsTotal: boolean;
  primaryMeasure: string | null;
  primaryDimension: string | null;
}

function analyzePrompt(prompt: string, schema: ColumnSchema[]): PromptAnalysis {
  const words = prompt.toLowerCase();
  const measures = schema.filter((s) => s.type === 'measure');
  const dimensions = schema.filter((s) => s.type === 'dimension');
  const dates = schema.filter((s) => s.type === 'date');

  // Find mentioned columns
  let primaryMeasure = measures[0]?.name || null;
  let primaryDimension = dimensions[0]?.name || null;

  // Check if specific columns are mentioned
  for (const m of measures) {
    if (words.includes(m.name.toLowerCase())) {
      primaryMeasure = m.name;
      break;
    }
  }
  for (const d of dimensions) {
    if (words.includes(d.name.toLowerCase())) {
      primaryDimension = d.name;
      break;
    }
  }

  return {
    wantsSales: words.includes('sales') || words.includes('revenue') || words.includes('amount'),
    wantsRegion: words.includes('region') || words.includes('area') || words.includes('location'),
    wantsProduct: words.includes('product') || words.includes('item') || words.includes('category'),
    wantsTime: words.includes('time') || words.includes('trend') || words.includes('month') || words.includes('date') || words.includes('daily') || words.includes('over'),
    wantsTop: words.includes('top') || words.includes('best') || words.includes('ranking') || words.includes('highest'),
    wantsComparison: words.includes('compare') || words.includes('vs') || words.includes('versus') || words.includes('by'),
    wantsDistribution: words.includes('distribution') || words.includes('breakdown') || words.includes('share') || words.includes('pie'),
    wantsTotal: words.includes('total') || words.includes('sum') || words.includes('overall'),
    primaryMeasure,
    primaryDimension,
  };
}

function generateTitle(prompt: string, analysis: PromptAnalysis): string {
  if (analysis.wantsSales) return 'Sales Performance Dashboard';
  if (analysis.wantsRegion) return 'Regional Analysis Dashboard';
  if (analysis.wantsProduct) return 'Product Performance Dashboard';
  if (analysis.wantsTime) return 'Trend Analysis Dashboard';
  
  // Generate from prompt
  const cleanPrompt = prompt.slice(0, 40).replace(/[^a-zA-Z ]/g, '').trim();
  return cleanPrompt ? `${cleanPrompt} Dashboard` : 'Business Intelligence Dashboard';
}

export function generateDashboardSpec(
  schema: ColumnSchema[],
  prompt: string
): DashboardSpec {
  const analysis = analyzePrompt(prompt, schema);
  const measures = schema.filter((s) => s.type === 'measure');
  const dimensions = schema.filter((s) => s.type === 'dimension');
  const dates = schema.filter((s) => s.type === 'date');

  const visuals: Visual[] = [];
  let id = 1;

  const primaryMeasure = analysis.primaryMeasure || measures[0]?.name || 'Value';
  const primaryDimension = analysis.primaryDimension || dimensions[0]?.name || 'Category';
  const dateDimension = dates[0]?.name || null;
  const secondaryDimension = dimensions.find((d) => d.name !== primaryDimension)?.name;

  // Always add a KPI card for the primary measure
  visuals.push({
    id: `v${id++}`,
    type: 'card',
    title: `Total ${primaryMeasure}`,
    metrics: [`SUM(${primaryMeasure})`],
    dimensions: [],
  });

  // Add bar chart if comparing by dimension
  if (analysis.wantsRegion || analysis.wantsProduct || analysis.wantsComparison || !analysis.wantsTime) {
    const dim = analysis.wantsRegion && dimensions.find((d) => d.name.toLowerCase().includes('region'))
      ? dimensions.find((d) => d.name.toLowerCase().includes('region'))!.name
      : analysis.wantsProduct && dimensions.find((d) => d.name.toLowerCase().includes('product'))
        ? dimensions.find((d) => d.name.toLowerCase().includes('product'))!.name
        : primaryDimension;

    visuals.push({
      id: `v${id++}`,
      type: 'bar',
      title: `${primaryMeasure} by ${dim}`,
      metrics: [`SUM(${primaryMeasure})`],
      dimensions: [dim],
      sort: 'desc',
    });
  }

  // Add line chart if time trend is requested
  if (analysis.wantsTime && dateDimension) {
    visuals.push({
      id: `v${id++}`,
      type: 'line',
      title: `${primaryMeasure} Over Time`,
      metrics: [`SUM(${primaryMeasure})`],
      dimensions: [dateDimension],
      sort: 'asc',
    });
  }

  // Add pie chart if distribution is requested
  if (analysis.wantsDistribution) {
    visuals.push({
      id: `v${id++}`,
      type: 'pie',
      title: `${primaryMeasure} Distribution`,
      metrics: [`SUM(${primaryMeasure})`],
      dimensions: [primaryDimension],
    });
  }

  // Add table if top/ranking is requested
  if (analysis.wantsTop) {
    visuals.push({
      id: `v${id++}`,
      type: 'table',
      title: `Top ${primaryDimension} by ${primaryMeasure}`,
      metrics: [`SUM(${primaryMeasure})`],
      dimensions: [primaryDimension],
      sort: 'desc',
    });
  }

  // If we only have the card, add a default bar chart
  if (visuals.length === 1) {
    visuals.push({
      id: `v${id++}`,
      type: 'bar',
      title: `${primaryMeasure} by ${primaryDimension}`,
      metrics: [`SUM(${primaryMeasure})`],
      dimensions: [primaryDimension],
      sort: 'desc',
    });

    // Add a pie for variety
    if (dimensions.length > 0) {
      visuals.push({
        id: `v${id++}`,
        type: 'pie',
        title: `${primaryMeasure} Share`,
        metrics: [`SUM(${primaryMeasure})`],
        dimensions: [primaryDimension],
      });
    }
  }

  // Add a secondary metric card if we have multiple measures
  if (measures.length > 1) {
    const secondaryMeasure = measures.find((m) => m.name !== primaryMeasure)?.name;
    if (secondaryMeasure) {
      visuals.push({
        id: `v${id++}`,
        type: 'card',
        title: `Total ${secondaryMeasure}`,
        metrics: [`SUM(${secondaryMeasure})`],
        dimensions: [],
      });
    }
  }

  return {
    title: generateTitle(prompt, analysis),
    visuals: visuals.slice(0, 6), // Max 6 visuals
  };
}
