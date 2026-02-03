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
  generateInsights?: boolean;
  dashboardSpec?: unknown;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schema, sampleData, prompt, currentSpec, isRefinement, conversationHistory } = await req.json() as GenerateRequest;
    
    console.log("Generating dashboard for prompt:", prompt);
    console.log("Schema columns:", schema.map(s => s.name).join(", "));
    console.log("Is refinement:", isRefinement);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are PromptBI - an expert Power BI dashboard architect with deep understanding of data visualization best practices. 
Your task is to analyze the provided data schema and sample data, then create an optimal, production-ready dashboard specification based on the user's natural language request.

CONTEXT:
- You understand business intelligence and data storytelling
- You create dashboards that are both informative and visually appealing
- You consider the user's intent and provide comprehensive insights

DATA SCHEMA (columns with their roles):
${JSON.stringify(schema, null, 2)}

SAMPLE DATA (first 10 rows for context):
${JSON.stringify(sampleData.slice(0, 10), null, 2)}

CHART TYPE GUIDELINES:
1. "card" - Use for single KPI metrics (totals, averages, percentages). Perfect for key performance indicators.
2. "bar" - Use for comparing categories (dimensions vs measures). Best for ranking, comparisons, and categorical analysis.
3. "line" - Use for time series trends (date dimensions). Ideal for showing trends over time, growth patterns, and temporal changes.
4. "pie" - Use for distribution/share analysis (max 6 slices). Great for showing proportions and market share.
5. "table" - Use for detailed data views (top N rankings). Perfect for drill-down data, detailed lists, and comprehensive views.

DASHBOARD DESIGN PRINCIPLES:
1. Always include at least one KPI card to highlight key metrics
2. Generate 3-6 visuals that together tell a complete, coherent data story
3. Make titles clear, business-friendly, and descriptive
4. Use appropriate aggregations: SUM for totals, AVG for averages, COUNT for counts
5. Consider data relationships and create visuals that complement each other
6. Only use column names that exist in the schema (case-insensitive matching)
7. For time-based analysis, prioritize line charts
8. For categorical comparisons, use bar charts
9. For distributions, use pie charts (when slices ≤ 6)

OUTPUT FORMAT:
You MUST respond with ONLY valid JSON matching this exact structure (no markdown, no explanations):
{
  "title": "Dashboard Title",
  "visuals": [
    {
      "id": "v1",
      "type": "card" | "bar" | "line" | "pie" | "table",
      "title": "Visual Title",
      "metrics": ["SUM(columnName)"],
      "dimensions": ["columnName"],
      "sort": "asc" | "desc"
    }
  ]
}

Remember: Think like a business analyst. Create dashboards that answer real business questions and provide actionable insights.`;

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
          ...(isRefinement && currentSpec
            ? [
                {
                  role: "user",
                  content: `CURRENT DASHBOARD SPECIFICATION:
${JSON.stringify(currentSpec, null, 2)}

CONVERSATION HISTORY:
${conversationHistory?.map(m => `${m.role}: ${m.content}`).join('\n') || 'No previous conversation'}

USER REQUEST: "${prompt}"

Please update the dashboard specification based on the user's request. Maintain the overall structure but modify visuals, metrics, dimensions, or chart types as requested. If the user wants to add something new, add it. If they want to change something, update it. If they want to remove something, remove it. Return the complete updated specification.`,
                },
              ]
            : [{ role: "user", content: `Create a dashboard for: "${prompt}"` }]),
        ],
        max_tokens: 2000,
        temperature: isRefinement ? 0.2 : 0.3, // Lower temperature for refinements for more consistency
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
          JSON.stringify({ error: "AI usage limit reached. Using fallback generation.", fallback: true }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service error. Using fallback generation.", fallback: true }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    // Extract content from AI response
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
    
    // Validate the spec
    if (!dashboardSpec.title || !Array.isArray(dashboardSpec.visuals)) {
      throw new Error("Invalid dashboard spec structure");
    }

    // Validate columns exist in schema
    const schemaColumns = new Set(schema.map(s => s.name.toLowerCase()));
    for (const visual of dashboardSpec.visuals) {
      // Validate dimensions
      for (const dim of visual.dimensions || []) {
        if (!schemaColumns.has(dim.toLowerCase())) {
          console.warn(`Dimension "${dim}" not found in schema, attempting to fix`);
          // Try to find closest match
          const match = schema.find(s => s.name.toLowerCase().includes(dim.toLowerCase()) || dim.toLowerCase().includes(s.name.toLowerCase()));
          if (match) {
            visual.dimensions = visual.dimensions.map((d: string) => d.toLowerCase() === dim.toLowerCase() ? match.name : d);
          }
        }
      }
      
      // Validate metrics - extract column names from SUM(), AVG(), etc.
      for (let i = 0; i < (visual.metrics || []).length; i++) {
        const metric = visual.metrics[i];
        const colMatch = metric.match(/(?:SUM|AVG|COUNT|MAX|MIN)\((\w+)\)/i);
        if (colMatch) {
          const colName = colMatch[1];
          if (!schemaColumns.has(colName.toLowerCase())) {
            console.warn(`Metric column "${colName}" not found in schema`);
            // Try to find a measure column
            const measureCol = schema.find(s => s.type === 'measure');
            if (measureCol) {
              visual.metrics[i] = metric.replace(colName, measureCol.name);
            }
          }
        }
      }
    }

    console.log("Dashboard spec generated successfully:", dashboardSpec.title);

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
