import { supabase } from '@/integrations/supabase/client';
import { ColumnSchema, DashboardSpec, DataRow } from '@/store/appStore';

export async function generateInsights(
  spec: DashboardSpec,
  data: DataRow[],
  schema: ColumnSchema[]
): Promise<string[]> {
  try {
    const { data: response, error } = await supabase.functions.invoke('generate-dashboard', {
      body: {
        schema,
        sampleData: data.slice(0, 50),
        prompt: `Analyze this data and generate 5 actionable business insights. Focus on:
1. Key performance highlights with specific numbers
2. Trends and patterns (growth, decline, seasonality)
3. Comparisons (top vs bottom performers)
4. Actionable recommendations
5. Potential concerns or opportunities

Dashboard: ${spec.title}
Visuals: ${spec.visuals.map(v => v.title).join(', ')}`,
        generateInsights: true,
        dashboardSpec: spec,
      },
    });

    if (error) throw error;

    if (response?.insights && Array.isArray(response.insights)) {
      return response.insights;
    }

    // Fallback to local insights
    return generateLocalInsights(spec, data, schema);
  } catch (err) {
    console.warn('AI insights failed, using local analysis:', err);
    return generateLocalInsights(spec, data, schema);
  }
}

function generateLocalInsights(
  spec: DashboardSpec,
  data: DataRow[],
  schema: ColumnSchema[]
): string[] {
  const insights: string[] = [];
  const measures = schema.filter((s) => s.type === 'measure');
  const dimensions = schema.filter((s) => s.type === 'dimension');

  // Calculate totals and averages for measures
  measures.forEach((measure) => {
    const values = data.map(row => {
      const val = row[measure.name];
      return typeof val === 'number' ? val : 0;
    }).filter(v => v !== 0);
    
    if (values.length > 0) {
      const total = values.reduce((sum, v) => sum + v, 0);
      const avg = total / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      insights.push(
        `📊 Total ${measure.name}: ${formatNumber(total)} (avg: ${formatNumber(avg)}, range: ${formatNumber(min)} - ${formatNumber(max)})`
      );
    }
  });

  // Find top performer by first dimension
  if (dimensions.length > 0 && measures.length > 0) {
    const dim = dimensions[0];
    const measure = measures[0];
    
    const grouped = new Map<string, number>();
    data.forEach((row) => {
      const key = String(row[dim.name] || 'Unknown');
      const rawValue = row[measure.name];
      const value = typeof rawValue === 'number' ? rawValue : 0;
      grouped.set(key, (grouped.get(key) || 0) + value);
    });

    const sorted = Array.from(grouped.entries()).sort((a, b) => b[1] - a[1]);
    
    if (sorted.length > 0) {
      const [topKey, topValue] = sorted[0];
      const total = sorted.reduce((sum, [, val]) => sum + val, 0);
      const percentage = ((topValue / total) * 100).toFixed(1);
      
      insights.push(
        `🏆 "${topKey}" leads with ${formatNumber(topValue)} ${measure.name} (${percentage}% of total)`
      );

      if (sorted.length >= 3) {
        const top3Total = sorted.slice(0, 3).reduce((sum, [, val]) => sum + val, 0);
        const top3Pct = ((top3Total / total) * 100).toFixed(1);
        insights.push(
          `📈 Top 3 ${dim.name}s account for ${top3Pct}% of all ${measure.name} — concentration opportunity`
        );
        
        // Compare top to bottom
        if (sorted.length >= 2) {
          const [, bottomValue] = sorted[sorted.length - 1];
          const ratio = (topValue / bottomValue).toFixed(1);
          insights.push(
            `⚡ Top performer outperforms bottom by ${ratio}x — investigate success factors`
          );
        }
      }
    }
  }

  // Data completeness insight
  const recordCount = data.length;
  const dimensionCount = dimensions.length;
  const measureCount = measures.length;
  insights.push(
    `📋 Dataset: ${recordCount.toLocaleString()} records, ${dimensionCount} dimensions, ${measureCount} measures`
  );

  return insights.slice(0, 5);
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  if (num < 1 && num > 0) {
    return num.toFixed(2);
  }
  return num.toLocaleString();
}
