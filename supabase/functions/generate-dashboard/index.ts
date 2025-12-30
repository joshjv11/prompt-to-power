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
    const { schema, sampleData, prompt } = await req.json() as GenerateRequest;
    
    console.log("Generating dashboard for prompt:", prompt);
    console.log("Schema columns:", schema.map(s => s.name).join(", "));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are PromptBI - an expert Power BI dashboard architect. 
Your task is to analyze the provided data schema and sample data, then create an optimal dashboard specification based on the user's natural language request.

SCHEMA (columns with their roles):
${JSON.stringify(schema, null, 2)}

SAMPLE DATA (first 10 rows):
${JSON.stringify(sampleData.slice(0, 10), null, 2)}

RULES:
1. Only use column names that exist in the schema
2. Use appropriate chart types for the data:
   - "card" for single KPI metrics (totals, averages)
   - "bar" for comparing categories (dimensions vs measures)
   - "line" for time series trends (date dimensions)
   - "pie" for distribution/share analysis (max 6 slices)
   - "table" for detailed data views (top N rankings)
3. Generate 3-6 visuals that together tell a complete data story
4. Make titles clear and business-friendly
5. Always include at least one KPI card

You MUST respond with ONLY valid JSON matching this exact structure:
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

Do not include any markdown, explanations, or text outside the JSON.`;

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
        max_tokens: 2000,
        temperature: 0.3,
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
