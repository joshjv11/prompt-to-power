import { DashboardSpec, Visual, ColumnSchema } from '@/store/appStore';

export interface PowerBIExport {
  measures: DAXMeasure[];
  visuals: PowerBIVisual[];
  mCode: string;
  dataModel: DataModelConfig;
  instructions: string[];
}

export interface DAXMeasure {
  name: string;
  formula: string;
  description: string;
  formatString?: string;
}

export interface PowerBIVisual {
  name: string;
  type: string;
  powerBIType: string;
  axis?: string[];
  values?: string[];
  legend?: string[];
  tooltips?: string[];
  configuration: string;
}

export interface DataModelConfig {
  tableName: string;
  columns: ColumnConfig[];
  relationships: RelationshipConfig[];
}

export interface ColumnConfig {
  name: string;
  dataType: string;
  role: 'measure' | 'dimension' | 'date';
  formatString?: string;
}

export interface RelationshipConfig {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

// Map visual types to Power BI visual types
const VISUAL_TYPE_MAP: Record<string, { type: string; description: string }> = {
  card: { type: 'Card', description: 'Single value KPI card' },
  bar: { type: 'Clustered Bar Chart', description: 'Horizontal bar comparison' },
  line: { type: 'Line Chart', description: 'Trend over time' },
  pie: { type: 'Pie Chart', description: 'Part-to-whole distribution' },
  combo: { type: 'Line and Clustered Column Chart', description: 'Dual-axis comparison' },
  area: { type: 'Area Chart', description: 'Cumulative trend visualization' },
  scatter: { type: 'Scatter Chart', description: 'Correlation analysis' },
  histogram: { type: 'Histogram', description: 'Frequency distribution' },
  heatmap: { type: 'Matrix', description: 'Cross-tabulated heat values' },
  waterfall: { type: 'Waterfall Chart', description: 'Sequential gains/losses' },
  gauge: { type: 'Gauge', description: 'Progress toward a goal' },
  table: { type: 'Table', description: 'Detailed data grid' },
  funnel: { type: 'Funnel', description: 'Conversion pipeline' },
  bullet: { type: 'Bullet Chart (Custom Visual)', description: 'Actual vs target' },
  treemap: { type: 'Treemap', description: 'Hierarchical proportions' },
};

// Generate DAX measure from metric column
function generateDAXMeasure(metric: string, schema: ColumnSchema[]): DAXMeasure {
  const column = schema.find(c => c.name === metric);
  const cleanName = metric.replace(/[^a-zA-Z0-9_]/g, '_');
  
  // Detect aggregation type from name or default to SUM
  let aggregation = 'SUM';
  let formatString = '#,##0';
  
  if (metric.toLowerCase().includes('count')) {
    aggregation = 'COUNT';
    formatString = '#,##0';
  } else if (metric.toLowerCase().includes('avg') || metric.toLowerCase().includes('average')) {
    aggregation = 'AVERAGE';
    formatString = '#,##0.00';
  } else if (metric.toLowerCase().includes('max')) {
    aggregation = 'MAX';
  } else if (metric.toLowerCase().includes('min')) {
    aggregation = 'MIN';
  } else if (metric.toLowerCase().includes('percent') || metric.toLowerCase().includes('rate')) {
    formatString = '0.00%';
  } else if (metric.toLowerCase().includes('price') || metric.toLowerCase().includes('revenue') || metric.toLowerCase().includes('sales') || metric.toLowerCase().includes('amount')) {
    formatString = '$#,##0.00';
  }
  
  return {
    name: `Total ${cleanName}`,
    formula: `${aggregation}('Data'[${metric}])`,
    description: `Calculates the ${aggregation.toLowerCase()} of ${metric}`,
    formatString,
  };
}

// Generate additional calculated measures
function generateCalculatedMeasures(schema: ColumnSchema[]): DAXMeasure[] {
  const measures: DAXMeasure[] = [];
  const numericColumns = schema.filter(c => c.type === 'measure');
  
  // Year-over-Year if date column exists
  const dateColumn = schema.find(c => c.type === 'date');
  if (dateColumn && numericColumns.length > 0) {
    const firstMetric = numericColumns[0].name;
    measures.push({
      name: `${firstMetric} YoY Growth`,
      formula: `
VAR CurrentYear = [Total ${firstMetric.replace(/[^a-zA-Z0-9_]/g, '_')}]
VAR PreviousYear = CALCULATE(
    [Total ${firstMetric.replace(/[^a-zA-Z0-9_]/g, '_')}],
    SAMEPERIODLASTYEAR('Data'[${dateColumn.name}])
)
RETURN
DIVIDE(CurrentYear - PreviousYear, PreviousYear, 0)`,
      description: 'Year-over-year growth percentage',
      formatString: '0.0%',
    });
    
    measures.push({
      name: `${firstMetric} Running Total`,
      formula: `
CALCULATE(
    [Total ${firstMetric.replace(/[^a-zA-Z0-9_]/g, '_')}],
    FILTER(
        ALLSELECTED('Data'[${dateColumn.name}]),
        'Data'[${dateColumn.name}] <= MAX('Data'[${dateColumn.name}])
    )
)`,
      description: 'Cumulative running total',
      formatString: '$#,##0.00',
    });
  }
  
  // Percentage of total
  if (numericColumns.length > 0) {
    const firstMetric = numericColumns[0].name;
    measures.push({
      name: `${firstMetric} % of Total`,
      formula: `
DIVIDE(
    [Total ${firstMetric.replace(/[^a-zA-Z0-9_]/g, '_')}],
    CALCULATE(
        [Total ${firstMetric.replace(/[^a-zA-Z0-9_]/g, '_')}],
        ALLSELECTED('Data')
    ),
    0
)`,
      description: 'Percentage contribution to total',
      formatString: '0.00%',
    });
  }
  
  // Average per dimension
  const dimensions = schema.filter(c => c.type === 'dimension');
  if (numericColumns.length > 0 && dimensions.length > 0) {
    const firstMetric = numericColumns[0].name;
    const firstDimension = dimensions[0].name;
    measures.push({
      name: `Avg ${firstMetric} per ${firstDimension}`,
      formula: `AVERAGEX(VALUES('Data'[${firstDimension}]), [Total ${firstMetric.replace(/[^a-zA-Z0-9_]/g, '_')}])`,
      description: `Average ${firstMetric} across each ${firstDimension}`,
      formatString: '#,##0.00',
    });
  }
  
  return measures;
}

// Convert visual to Power BI visual configuration
function convertVisualToPowerBI(visual: Visual, schema: ColumnSchema[]): PowerBIVisual {
  const pbiType = VISUAL_TYPE_MAP[visual.type] || { type: 'Table', description: 'Data table' };
  
  const config: PowerBIVisual = {
    name: visual.title,
    type: visual.type,
    powerBIType: pbiType.type,
    configuration: '',
  };
  
  switch (visual.type) {
    case 'card':
      config.values = visual.metrics.map(m => `[Total ${m.replace(/[^a-zA-Z0-9_]/g, '_')}]`);
      config.configuration = `Fields: ${visual.metrics.join(', ')}`;
      break;
      
    case 'bar':
    case 'line':
    case 'area':
      config.axis = visual.dimensions;
      config.values = visual.metrics.map(m => `[Total ${m.replace(/[^a-zA-Z0-9_]/g, '_')}]`);
      config.configuration = `Axis: ${visual.dimensions.join(', ')} | Values: ${visual.metrics.join(', ')}`;
      if (visual.topN) {
        config.configuration += ` | Top N Filter: ${visual.topN}`;
      }
      break;
      
    case 'combo':
      config.axis = visual.dimensions;
      config.values = visual.metrics.map(m => `[Total ${m.replace(/[^a-zA-Z0-9_]/g, '_')}]`);
      config.configuration = `Shared Axis: ${visual.dimensions.join(', ')} | Column Values: ${visual.metrics[0] || ''} | Line Values: ${visual.metrics[1] || ''}`;
      break;
      
    case 'pie':
      config.legend = visual.dimensions;
      config.values = visual.metrics.map(m => `[Total ${m.replace(/[^a-zA-Z0-9_]/g, '_')}]`);
      config.configuration = `Legend: ${visual.dimensions.join(', ')} | Values: ${visual.metrics.join(', ')}`;
      break;
      
    case 'scatter':
      config.axis = [visual.metrics[0] || ''];
      config.values = [visual.metrics[1] || ''];
      config.legend = visual.dimensions;
      config.configuration = `X Axis: ${visual.metrics[0] || ''} | Y Axis: ${visual.metrics[1] || ''} | Details: ${visual.dimensions.join(', ')}`;
      break;
      
    case 'table':
      config.values = [...visual.dimensions, ...visual.metrics];
      config.configuration = `Columns: ${[...visual.dimensions, ...visual.metrics].join(', ')}`;
      if (visual.topN) {
        config.configuration += ` | Row Limit: ${visual.topN}`;
      }
      break;
      
    case 'funnel':
      config.axis = visual.dimensions;
      config.values = visual.metrics.map(m => `[Total ${m.replace(/[^a-zA-Z0-9_]/g, '_')}]`);
      config.configuration = `Category: ${visual.dimensions.join(', ')} | Values: ${visual.metrics.join(', ')}`;
      break;
      
    case 'waterfall':
      config.axis = visual.dimensions;
      config.values = visual.metrics.map(m => `[Total ${m.replace(/[^a-zA-Z0-9_]/g, '_')}]`);
      config.configuration = `Category: ${visual.dimensions.join(', ')} | Breakdown: ${visual.metrics.join(', ')}`;
      break;
      
    case 'treemap':
      config.axis = visual.dimensions;
      config.values = visual.metrics.map(m => `[Total ${m.replace(/[^a-zA-Z0-9_]/g, '_')}]`);
      config.configuration = `Group: ${visual.dimensions.join(', ')} | Values: ${visual.metrics.join(', ')}`;
      break;
      
    default:
      config.values = [...visual.dimensions, ...visual.metrics];
      config.configuration = `Fields: ${[...visual.dimensions, ...visual.metrics].join(', ')}`;
  }
  
  return config;
}

// Generate M Code (Power Query) for data transformation
function generateMCode(schema: ColumnSchema[], tableName: string = 'Data'): string {
  const columnTransforms = schema.map(col => {
    switch (col.dataType) {
      case 'number':
        return `{"${col.name}", type number}`;
      case 'date':
        return `{"${col.name}", type date}`;
      default:
        return `{"${col.name}", type text}`;
    }
  });
  
  return `let
    // Step 1: Load your data source
    Source = Csv.Document(File.Contents("YOUR_FILE_PATH.csv"),[Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.None]),
    
    // Step 2: Promote headers
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    
    // Step 3: Set column types
    TypedColumns = Table.TransformColumnTypes(PromotedHeaders, {
        ${columnTransforms.join(',\n        ')}
    }),
    
    // Step 4: Remove empty rows
    FilteredRows = Table.SelectRows(TypedColumns, each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),
    
    // Step 5: Trim text columns
    TrimmedText = Table.TransformColumns(FilteredRows, {}, Text.Trim)
in
    TrimmedText`;
}

// Generate complete Power BI export
export function generatePowerBIExport(
  spec: DashboardSpec,
  schema: ColumnSchema[],
  data: Record<string, unknown>[]
): PowerBIExport {
  // Generate measures for all metrics used in visuals
  const allMetrics = new Set<string>();
  spec.visuals.forEach(v => {
    v.metrics.forEach(m => allMetrics.add(m));
  });
  
  const baseMeasures = Array.from(allMetrics).map(metric => 
    generateDAXMeasure(metric, schema)
  );
  
  const calculatedMeasures = generateCalculatedMeasures(schema);
  
  // Convert visuals
  const powerBIVisuals = spec.visuals.map(v => convertVisualToPowerBI(v, schema));
  
  // Generate M Code
  const mCode = generateMCode(schema);
  
  // Data model configuration
  const dataModel: DataModelConfig = {
    tableName: 'Data',
    columns: schema.map(col => ({
      name: col.name,
      dataType: col.dataType === 'number' ? 'Decimal Number' : col.dataType === 'date' ? 'Date' : 'Text',
      role: col.type,
      formatString: col.dataType === 'number' ? '#,##0.00' : undefined,
    })),
    relationships: [],
  };
  
  // Step-by-step instructions
  const instructions = [
    '📊 Open Power BI Desktop and create a new report',
    '📁 Go to Home → Get Data → Text/CSV and select your data file',
    '⚙️ In Power Query Editor, paste the M Code from the "M Code" tab',
    '📐 Create measures: Go to Modeling → New Measure and paste each DAX formula',
    '🎨 Add visuals: From Visualizations pane, drag the visual types listed below',
    '📊 Configure each visual with the specified fields and measures',
    '🎯 Apply any Top N filters using the visual filters pane',
    '💾 Save your .pbix file',
  ];
  
  return {
    measures: [...baseMeasures, ...calculatedMeasures],
    visuals: powerBIVisuals,
    mCode,
    dataModel,
    instructions,
  };
}

// Generate downloadable Power BI template (PBIT-like JSON)
export function generatePBITTemplate(
  spec: DashboardSpec,
  schema: ColumnSchema[],
  data: Record<string, unknown>[]
): string {
  const exportData = generatePowerBIExport(spec, schema, data);
  
  const template = {
    version: '1.0',
    generatedBy: 'PromptBI',
    generatedAt: new Date().toISOString(),
    dashboard: {
      title: spec.title,
      description: `Auto-generated Power BI template for "${spec.title}"`,
    },
    dataModel: exportData.dataModel,
    measures: exportData.measures,
    visuals: exportData.visuals,
    powerQuery: exportData.mCode,
    instructions: exportData.instructions,
  };
  
  return JSON.stringify(template, null, 2);
}

// Generate plain text instructions for copy/paste
export function generatePlainTextInstructions(export_: PowerBIExport): string {
  let text = '=== POWER BI DASHBOARD SETUP ===\n\n';
  
  text += '--- DAX MEASURES ---\n\n';
  export_.measures.forEach(m => {
    text += `// ${m.name}\n`;
    text += `// ${m.description}\n`;
    text += `${m.name} = ${m.formula}\n\n`;
  });
  
  text += '\n--- VISUALS TO CREATE ---\n\n';
  export_.visuals.forEach((v, i) => {
    text += `${i + 1}. ${v.name}\n`;
    text += `   Type: ${v.powerBIType}\n`;
    text += `   Config: ${v.configuration}\n\n`;
  });
  
  text += '\n--- POWER QUERY M CODE ---\n\n';
  text += export_.mCode;
  
  return text;
}
