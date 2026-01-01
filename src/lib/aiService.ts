import { supabase } from '@/integrations/supabase/client';
import { ColumnSchema, DashboardSpec } from '@/store/appStore';
import { generateRobustDashboard } from './robustPrompting';
import { generateFallbackDashboard, validateAndRepairSpec } from './errorRecovery';

interface GenerateResult {
  spec: DashboardSpec;
  source: 'ai' | 'fallback' | 'robust';
}

// Main dashboard generation with robust prompting fallback
export async function generateDashboardWithAI(
  schema: ColumnSchema[],
  sampleData: Record<string, unknown>[],
  prompt: string,
  onProgress?: (step: string) => void
): Promise<GenerateResult> {
  let retries = 0;
  const maxRetries = 2;

  if (!schema || schema.length === 0) {
    throw new Error('No data schema detected. Please upload a valid CSV file with headers.');
  }
  
  if (!prompt || prompt.trim().length < 3) {
    throw new Error('Please provide a more detailed prompt to generate your dashboard.');
  }

  while (retries <= maxRetries) {
    try {
      onProgress?.('Connecting to AI service...');
      await new Promise((r) => setTimeout(r, 300));
      
      onProgress?.('Analyzing data schema...');
      
      const { data, error } = await supabase.functions.invoke('generate-dashboard', {
        body: { schema, sampleData: sampleData.slice(0, 50), prompt },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`AI service error: ${error.message || 'Unknown error occurred'}`);
      }

      if (data?.fallback) {
        console.log('AI returned fallback signal, using robust prompting');
        onProgress?.('Using smart analysis...');
        
        try {
          const robustSpec = generateRobustDashboard(schema, sampleData, prompt);
          return { spec: validateAndRepairSpec(robustSpec, schema), source: 'robust' };
        } catch (robustError) {
          const fallbackSpec = generateFallbackDashboard(robustError as Error, schema, prompt);
          return { spec: fallbackSpec, source: 'fallback' };
        }
      }

      if (data?.spec) {
        onProgress?.('Generating visualizations...');
        
        if (!data.spec.title || !Array.isArray(data.spec.visuals) || data.spec.visuals.length === 0) {
          const robustSpec = generateRobustDashboard(schema, sampleData, prompt);
          return { spec: validateAndRepairSpec(robustSpec, schema), source: 'robust' };
        }
        
        onProgress?.('Dashboard ready!');
        return { spec: validateAndRepairSpec(data.spec, schema), source: 'ai' };
      }

      throw new Error('No dashboard generated.');
    } catch (err) {
      retries++;
      if (retries <= maxRetries) {
        onProgress?.(`Retry attempt ${retries}/${maxRetries}...`);
        await new Promise((r) => setTimeout(r, 1000 * retries));
      }
    }
  }

  onProgress?.('Using smart analysis...');
  try {
    const robustSpec = generateRobustDashboard(schema, sampleData, prompt);
    return { spec: validateAndRepairSpec(robustSpec, schema), source: 'robust' };
  } catch (robustError) {
    const fallbackSpec = generateFallbackDashboard(robustError as Error, schema, prompt);
    return { spec: fallbackSpec, source: 'fallback' };
  }
}
