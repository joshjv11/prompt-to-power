import { supabase } from '@/integrations/supabase/client';
import { ColumnSchema, DashboardSpec, ChatMessage } from '@/store/appStore';

interface RefinementResult {
  spec: DashboardSpec;
  message: string;
}

export async function refineDashboard(
  currentSpec: DashboardSpec,
  schema: ColumnSchema[],
  sampleData: Record<string, unknown>[],
  refinement: string,
  chatHistory: ChatMessage[]
): Promise<RefinementResult> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-dashboard', {
      body: {
        schema,
        sampleData: sampleData.slice(0, 10),
        prompt: refinement,
        currentSpec,
        isRefinement: true,
        conversationHistory: chatHistory.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to refine dashboard');
    }

    if (data?.fallback) {
      // Apply simple local refinement as fallback
      return applyLocalRefinement(currentSpec, refinement);
    }

    if (data?.spec) {
      // Generate a more conversational message
      const message = generateRefinementMessage(refinement, currentSpec, data.spec);
      return {
        spec: data.spec,
        message,
      };
    }

    throw new Error('Invalid response from AI service');
  } catch (err) {
    console.warn('AI refinement failed, using local fallback:', err);
    return applyLocalRefinement(currentSpec, refinement);
  }
}

function generateRefinementMessage(
  refinement: string,
  oldSpec: DashboardSpec,
  newSpec: DashboardSpec
): string {
  const oldVisualCount = oldSpec.visuals.length;
  const newVisualCount = newSpec.visuals.length;
  const visualDiff = newVisualCount - oldVisualCount;
  
  const lower = refinement.toLowerCase();
  
  if (lower.includes('add') || lower.includes('include') || lower.includes('show')) {
    if (visualDiff > 0) {
      return `Added ${visualDiff} new visualization${visualDiff > 1 ? 's' : ''} to your dashboard.`;
    }
  }
  
  if (lower.includes('remove') || lower.includes('delete') || lower.includes('hide')) {
    if (visualDiff < 0) {
      return `Removed ${Math.abs(visualDiff)} visualization${Math.abs(visualDiff) > 1 ? 's' : ''} from your dashboard.`;
    }
  }
  
  if (lower.includes('change') || lower.includes('update') || lower.includes('modify')) {
    return `Updated your dashboard based on: "${refinement}"`;
  }
  
  if (lower.includes('chart') || lower.includes('graph') || lower.includes('visual')) {
    return `Modified the visualizations in your dashboard.`;
  }
  
  return `Dashboard updated successfully! I've applied your changes: "${refinement}"`;
}

function applyLocalRefinement(spec: DashboardSpec, refinement: string): RefinementResult {
  const lower = refinement.toLowerCase();
  const newSpec = JSON.parse(JSON.stringify(spec)) as DashboardSpec;
  
  const message = generateRefinementMessage(refinement, spec, newSpec);

  // Chart type changes
  if (lower.includes('pie')) {
    const barChart = newSpec.visuals.find((v) => v.type === 'bar');
    if (barChart) {
      barChart.type = 'pie';
      return { spec: newSpec, message: 'Changed bar chart to pie chart' };
    }
  }

  if (lower.includes('line')) {
    const barChart = newSpec.visuals.find((v) => v.type === 'bar');
    if (barChart) {
      barChart.type = 'line';
      return { spec: newSpec, message: 'Changed bar chart to line chart' };
    }
  }

  if (lower.includes('bar')) {
    const pieChart = newSpec.visuals.find((v) => v.type === 'pie');
    if (pieChart) {
      pieChart.type = 'bar';
      return { spec: newSpec, message: 'Changed pie chart to bar chart' };
    }
  }

  if (lower.includes('table')) {
    const chart = newSpec.visuals.find((v) => ['bar', 'pie', 'line'].includes(v.type));
    if (chart) {
      chart.type = 'table';
      return { spec: newSpec, message: 'Changed chart to table view' };
    }
  }

  // Sorting changes
  if (lower.includes('ascending') || lower.includes('asc')) {
    newSpec.visuals.forEach((v) => {
      v.sort = 'asc';
    });
    return { spec: newSpec, message: 'Changed sort order to ascending' };
  }

  if (lower.includes('descending') || lower.includes('desc')) {
    newSpec.visuals.forEach((v) => {
      v.sort = 'desc';
    });
    return { spec: newSpec, message: 'Changed sort order to descending' };
  }

  // Add/remove visuals
  if (lower.includes('remove') || lower.includes('delete')) {
    if (lower.includes('card')) {
      newSpec.visuals = newSpec.visuals.filter((v) => v.type !== 'card');
      return { spec: newSpec, message: 'Removed KPI cards' };
    }
    if (lower.includes('table')) {
      newSpec.visuals = newSpec.visuals.filter((v) => v.type !== 'table');
      return { spec: newSpec, message: 'Removed tables' };
    }
  }

  // Title change
  if (lower.includes('title') || lower.includes('rename')) {
    const titleMatch = refinement.match(/(?:title|rename)\s+(?:to\s+)?["']?([^"']+)["']?/i);
    if (titleMatch) {
      newSpec.title = titleMatch[1].trim();
      return { spec: newSpec, message: `Changed title to "${newSpec.title}"` };
    }
  }

  return {
    spec: newSpec,
    message: 'Applied refinement (limited local processing)',
  };
}
