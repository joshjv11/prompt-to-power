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

  // Validate inputs first
  if (!schema || schema.length === 0) {
    throw new Error('No data schema detected. Please upload a valid CSV file with headers.');
  }
  
  if (!prompt || prompt.trim().length < 3) {
    throw new Error('Please provide a more detailed prompt to generate your dashboard.');
  }

  while (retries <= maxRetries) {
    try {
      // Step 1: Connecting
      onProgress?.('Connecting to AI service...');
      await new Promise((r) => setTimeout(r, 300)); // Small delay for UX
      
      // Step 2: Analyzing
      onProgress?.('Analyzing data schema...');
      
      const { data, error } = await supabase.functions.invoke('generate-dashboard', {
        body: { schema, sampleData: sampleData.slice(0, 50), prompt },
      });

      // Handle network/function errors
      if (error) {
        console.error('Edge function error:', error);
        const errorMessage = error.message?.toLowerCase() || '';
        
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        if (errorMessage.includes('timeout')) {
          throw new Error('Request timed out. The AI service is busy, please try again.');
        }
        if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
          throw new Error('Authentication error. Please refresh the page and try again.');
        }
        
        throw new Error(`AI service error: ${error.message || 'Unknown error occurred'}`);
      }

      // Handle fallback signal from AI
      if (data?.fallback) {
        console.log('AI returned fallback signal:', data.error);
        onProgress?.('Using smart fallback...');
        const fallbackSpec = generateFallbackSpec(schema, prompt);
        return { spec: fallbackSpec, source: 'fallback' };
      }

      // Validate response
      if (data?.spec) {
        onProgress?.('Generating visualizations...');
        await new Promise((r) => setTimeout(r, 200)); // Small delay for UX
        
        // Validate spec structure
        if (!data.spec.title || !Array.isArray(data.spec.visuals) || data.spec.visuals.length === 0) {
          console.warn('Invalid spec structure, using fallback');
          throw new Error('AI returned invalid dashboard structure');
        }
        
        onProgress?.('Dashboard ready!');
        return { spec: data.spec, source: 'ai' };
      }

      throw new Error('No dashboard generated. Please try a different prompt.');
    } catch (err) {
      retries++;
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.warn(`AI attempt ${retries} failed:`, errorMessage);
      
      if (retries <= maxRetries) {
        onProgress?.(`Retry attempt ${retries}/${maxRetries}...`);
        await new Promise((r) => setTimeout(r, 1000 * retries));
      }
    }
  }

  // Fallback to local generation
  console.log('Using fallback generator after retries');
  onProgress?.('Using smart fallback...');
  await new Promise((r) => setTimeout(r, 300)); // Small delay for UX
  const fallbackSpec = generateFallbackSpec(schema, prompt);
  return { spec: fallbackSpec, source: 'fallback' };
}
