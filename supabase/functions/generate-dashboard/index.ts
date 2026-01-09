import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ColumnSchema {
  name: string;
  type: "measure" | "dimension" | "date";
  dataType: "number" | "string" | "date";
  sampleValues: (string | number)[];
}

interface GenerateRequest {
  schema: ColumnSchema[];
  sampleData: Record<string, unknown>[];
  prompt: string;
  currentSpec?: unknown;
  isRefinement?: boolean;
  conversationHistory?: { role: string; content: string }[];
}

// Cache for similar prompts (in-memory, resets on cold start)
const responseCache = new Map<string, { spec: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(schema: ColumnSchema[], prompt: string): string {
  const schemaKey = schema.map(s => `${s.name}:${s.type}`).sort().join('|');
  return `${schemaKey}::${prompt.toLowerCase().trim()}`;
}

function getFromCache(key: string): unknown | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.spec;
  }
  responseCache.delete(key);
  return null;
}

function setCache(key: string, spec: unknown): void {
  // Limit cache size
  if (responseCache.size > 100) {
    const oldest = responseCache.keys().next().value;
    if (oldest) responseCache.delete(oldest);
  }
  responseCache.set(key, { spec, timestamp: Date.now() });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schema, sampleData, prompt, isRefinement, currentSpec } = await req.json() as GenerateRequest;
    
    console.log("Generating dashboard for prompt:", prompt);
    console.log("Schema columns:", schema.map(s => `${s.name}(${s.type})`).join(", "));

    // Check cache first (skip for refinements)
    if (!isRefinement) {
      const cacheKey = getCacheKey(schema, prompt);
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.log("Cache hit!");
        return new Response(
          JSON.stringify({ spec: cached, source: "cache" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Categorize columns for better prompting
    const measures = schema.filter(s => s.type === 'measure');
    const dimensions = schema.filter(s => s.type === 'dimension');
    const dates = schema.filter(s => s.type === 'date');

    // Enhanced system prompt with BI best practices
    const systemPrompt = `You are PromptBI - an expert Power BI dashboard architect specializing in data visualization and business intelligence.

TASK: Analyze the provided data and create an optimal dashboard specification based on the user's natural language request.

DATA SCHEMA:
Measures (numeric aggregations): ${measures.map(m => m.name).join(', ') || 'None'}
Dimensions (categories): ${dimensions.map(d => d.name).join(', ') || 'None'}
Date columns: ${dates.map(d => d.name).join(', ') || 'None'}

SAMPLE DATA (first 10 rows):
${JSON.stringify(sampleData.slice(0, 10), null, 2)}

VISUALIZATION BEST PRACTICES:
1. "card" - Single KPI metrics (totals, averages, counts). Use for headline numbers.
2. "bar" - Category comparisons. Best for discrete dimension vs measure. Limit to 10-12 bars max.
3. "line" - Time series trends. ONLY use with date dimensions. Show change over time.
4. "pie" - Part-to-whole relationships. Max 6 slices. Use sparingly.
5. "area" - Cumulative trends over time. Good for stacked comparisons.
6. "table" - Detailed data with multiple columns. Use for rankings or drill-down.
7. "scatter" - Correlation between two measures. Requires 2+ numeric columns.
8. "combo" - Dual-axis with bars + line. Compare related metrics at different scales.
9. "funnel" - Sequential stages (sales pipeline, conversion). Ordered categories.
10. "treemap" - Hierarchical proportions. Nested categories.
11. "histogram" - Distribution of numeric values. Binned frequency.
12. "gauge" - Progress toward a target. Single value vs goal.
13. "waterfall" - Sequential gains/losses. Financial breakdowns.
14. "heatmap" - Cross-tabulated intensity values. Two dimensions + measure.

DASHBOARD RULES:
- Generate 4-6 visuals that tell a complete data story
- ALWAYS start with 1-2 KPI cards for key metrics
- Match chart types to data types (line for time, bar for categories)
- Include at least one detailed table for drill-down
- Use descriptive, business-friendly titles (e.g., "Monthly Revenue Trend" not "line1")
- Add sort: "desc" for rankings, "asc" for time series
- Add topN: 10 for bar charts with many categories

${isRefinement && currentSpec ? `
CURRENT DASHBOARD (for refinement):
${JSON.stringify(currentSpec, null, 2)}

Modify the above dashboard based on the user's feedback while keeping what works.
` : ''}

RESPOND WITH ONLY VALID JSON:
{
  "title": "Dashboard Title",
  "visuals": [
    {
      "id": "v1",
      "type": "card" | "bar" | "line" | "pie" | "area" | "table" | "scatter" | "combo" | "funnel" | "treemap" | "histogram" | "gauge" | "waterfall" | "heatmap",
      "title": "Visual Title",
      "metrics": ["SUM(columnName)" or "AVG(columnName)" or "COUNT(columnName)"],
      "dimensions": ["dimensionColumn"],
      "sort": "asc" | "desc",
      "topN": 10
    }
  ]
}

CRITICAL: Only use column names that exist in the schema. No explanations, just JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a dashboard for: "${prompt}"` },
        ],
        max_tokens: 2500,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment.", fallback: true }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Using smart analysis instead.", fallback: true }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service unavailable. Using smart analysis.", fallback: true }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonString = content;
    if (content.includes("```json")) {
      jsonString = content.split("```json")[1].split("```")[0].trim();
    } else if (content.includes("```")) {
      jsonString = content.split("```")[1].split("```")[0].trim();
    }

    const dashboardSpec = JSON.parse(jsonString);
    
    // Validate structure
    if (!dashboardSpec.title || !Array.isArray(dashboardSpec.visuals)) {
      throw new Error("Invalid dashboard spec structure");
    }

    // Validate and repair columns
    const schemaColumns = new Set(schema.map(s => s.name.toLowerCase()));
    const schemaMap = new Map(schema.map(s => [s.name.toLowerCase(), s.name]));
    
    for (const visual of dashboardSpec.visuals) {
      // Fix dimensions
      visual.dimensions = (visual.dimensions || []).map((dim: string) => {
        const dimLower = dim.toLowerCase();
        if (schemaMap.has(dimLower)) {
          return schemaMap.get(dimLower);
        }
        // Try partial match
        for (const [key, value] of schemaMap) {
          if (key.includes(dimLower) || dimLower.includes(key)) {
            return value;
          }
        }
        return dim;
      }).filter((dim: string) => schemaColumns.has(dim.toLowerCase()));

      // Fix metrics
      visual.metrics = (visual.metrics || []).map((metric: string) => {
        const colMatch = metric.match(/(?:SUM|AVG|COUNT|MAX|MIN)\((\w+)\)/i);
        if (!colMatch) return metric;
        
        const colName = colMatch[1];
        const colLower = colName.toLowerCase();
        
        if (schemaMap.has(colLower)) {
          return metric.replace(colName, schemaMap.get(colLower)!);
        }
        
        // Try partial match or use first measure
        for (const [key, value] of schemaMap) {
          if (key.includes(colLower) || colLower.includes(key)) {
            return metric.replace(colName, value);
          }
        }
        
        if (measures.length > 0) {
          return metric.replace(colName, measures[0].name);
        }
        return metric;
      });

      // Ensure visual has required fields
      if (!visual.id) visual.id = `v${dashboardSpec.visuals.indexOf(visual) + 1}`;
      if (!visual.type) visual.type = 'bar';
      if (!visual.title) visual.title = `Visual ${visual.id}`;
      if (!Array.isArray(visual.metrics)) visual.metrics = [];
      if (!Array.isArray(visual.dimensions)) visual.dimensions = [];
    }

    // Remove visuals with no valid data references
    dashboardSpec.visuals = dashboardSpec.visuals.filter((v: any) => 
      v.metrics.length > 0 || v.dimensions.length > 0 || v.type === 'card'
    );

    // Cache the result
    if (!isRefinement) {
      const cacheKey = getCacheKey(schema, prompt);
      setCache(cacheKey, dashboardSpec);
    }

    console.log("Dashboard generated:", dashboardSpec.title, `(${dashboardSpec.visuals.length} visuals)`);

    return new Response(
      JSON.stringify({ spec: dashboardSpec, source: "ai" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating dashboard:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error", 
        fallback: true 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
