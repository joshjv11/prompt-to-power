import { supabase } from '@/integrations/supabase/client';
import { ColumnSchema, DashboardSpec, Visual } from '@/store/appStore';

interface GenerateResult {
  spec: DashboardSpec;
  source: 'ai' | 'fallback';
}

// Fallback generator when AI fails
function generateFallbackSpec(schema: ColumnSchema[], prompt: string): DashboardSpec {
  const measures = schema.filter((s) => s.type === 'measure');
  const dimensions = schema.filter((s) => s.type === 'dimension');
  const dates = schema.filter((s) => s.type === 'date');
  
  const primaryMeasure = measures[0]?.name || 'Value';
  const primaryDimension = dimensions[0]?.name || 'Category';
  const dateDimension = dates[0]?.name;
  
  const visuals: Visual[] = [];
  let id = 1;

  // KPI Card
  visuals.push({
    id: `v${id++}`,
    type: 'card',
    title: `Total ${primaryMeasure}`,
    metrics: [`SUM(${primaryMeasure})`],
    dimensions: [],
  });

  // Bar chart
  visuals.push({
    id: `v${id++}`,
    type: 'bar',
    title: `${primaryMeasure} by ${primaryDimension}`,
    metrics: [`SUM(${primaryMeasure})`],
    dimensions: [primaryDimension],
    sort: 'desc',
  });

  // Line chart if we have dates
  if (dateDimension) {
    visuals.push({
      id: `v${id++}`,
      type: 'line',
      title: `${primaryMeasure} Over Time`,
      metrics: [`SUM(${primaryMeasure})`],
      dimensions: [dateDimension],
      sort: 'asc',
    });
  }

  // Pie chart
  if (dimensions.length > 0) {
    visuals.push({
      id: `v${id++}`,
      type: 'pie',
      title: `${primaryMeasure} Distribution`,
      metrics: [`SUM(${primaryMeasure})`],
      dimensions: [primaryDimension],
    });
  }

  // Table
  visuals.push({
    id: `v${id++}`,
    type: 'table',
    title: `Top ${primaryDimension}`,
    metrics: [`SUM(${primaryMeasure})`],
    dimensions: [primaryDimension],
    sort: 'desc',
  });

  return {
    title: `${primaryMeasure} Analysis Dashboard`,
    visuals: visuals.slice(0, 5),
  };
}

export async function generateDashboardWithAI(
  schema: ColumnSchema[],
  sampleData: Record<string, unknown>[],
  prompt: string,
  onProgress?: (step: string) => void
): Promise<GenerateResult> {
  let retries = 0;
  const maxRetries = 2;

  while (retries <= maxRetries) {
    try {
      onProgress?.('Analyzing data schema...');
      
      const { data, error } = await supabase.functions.invoke('generate-dashboard', {
        body: { schema, sampleData, prompt },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to call AI service');
      }

      if (data?.fallback) {
        console.log('AI returned fallback signal:', data.error);
        throw new Error(data.error || 'AI requested fallback');
      }

      if (data?.spec) {
        onProgress?.('Dashboard ready!');
        return { spec: data.spec, source: 'ai' };
      }

      throw new Error('Invalid response from AI service');
    } catch (err) {
      retries++;
      console.warn(`AI attempt ${retries} failed:`, err);
      
      if (retries <= maxRetries) {
        onProgress?.(`Retrying... (${retries}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, 1000 * retries));
      }
    }
  }

  // Fallback to local generation
  console.log('Using fallback generator');
  onProgress?.('Using smart fallback...');
  const fallbackSpec = generateFallbackSpec(schema, prompt);
  return { spec: fallbackSpec, source: 'fallback' };
}
