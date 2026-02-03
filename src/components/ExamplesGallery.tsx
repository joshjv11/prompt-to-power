import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  TrendingUp, 
  Users, 
  Globe, 
  ShoppingCart,
  BarChart3,
  LineChart,
  Play,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppStore, DashboardSpec, ColumnSchema } from '@/store/appStore';
import { demoDatasets } from '@/data/sampleData';
import { toast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';

interface ExampleDashboard {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  metrics: string[];
  chartTypes: string[];
  datasetIndex: number;
  prompt: string;
  spec: DashboardSpec;
}

const exampleDashboards: ExampleDashboard[] = [
  {
    id: 'sales-overview',
    title: 'Sales Performance Dashboard',
    description: 'Track revenue, regional performance, and product analytics with interactive visualizations.',
    category: 'Sales',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'from-emerald-500/20 to-emerald-600/5',
    metrics: ['$2.4M Revenue', '12 Regions', '156 Products'],
    chartTypes: ['Bar Chart', 'Line Chart', 'KPI Cards'],
    datasetIndex: 0,
    prompt: 'Show total sales by region with a bar chart, top products by revenue, and monthly sales trends',
    spec: {
      title: 'Sales Performance Dashboard',
      visuals: [
        { id: 'kpi-1', type: 'card', title: 'Total Revenue', metrics: ['Sales'], dimensions: [] },
        { id: 'kpi-2', type: 'card', title: 'Total Orders', metrics: ['Quantity'], dimensions: [] },
        { id: 'kpi-3', type: 'card', title: 'Avg Order Value', metrics: ['Sales'], dimensions: [] },
        { id: 'bar-1', type: 'bar', title: 'Sales by Region', metrics: ['Sales'], dimensions: ['Region'] },
        { id: 'line-1', type: 'line', title: 'Monthly Trends', metrics: ['Sales'], dimensions: ['Month'] },
        { id: 'table-1', type: 'table', title: 'Top Products', metrics: ['Sales', 'Quantity'], dimensions: ['Product', 'Region'] },
      ],
    },
  },
  {
    id: 'hr-analytics',
    title: 'HR Analytics Dashboard',
    description: 'Analyze workforce data, salary distribution, and performance metrics across departments.',
    category: 'HR',
    icon: <Users className="w-5 h-5" />,
    color: 'from-violet-500/20 to-violet-600/5',
    metrics: ['1,247 Employees', '8 Departments', '4.2 Avg Score'],
    chartTypes: ['Pie Chart', 'Bar Chart', 'Table'],
    datasetIndex: 1,
    prompt: 'Show employee count by department, salary distribution, and performance score analysis',
    spec: {
      title: 'HR Analytics Dashboard',
      visuals: [
        { id: 'kpi-1', type: 'card', title: 'Total Employees', metrics: ['Employee_ID'], dimensions: [] },
        { id: 'kpi-2', type: 'card', title: 'Avg Salary', metrics: ['Salary'], dimensions: [] },
        { id: 'kpi-3', type: 'card', title: 'Avg Performance', metrics: ['Performance'], dimensions: [] },
        { id: 'pie-1', type: 'pie', title: 'Employees by Department', metrics: ['Employee_ID'], dimensions: ['Department'] },
        { id: 'bar-1', type: 'bar', title: 'Salary by Department', metrics: ['Salary'], dimensions: ['Department'] },
        { id: 'table-1', type: 'table', title: 'Employee Directory', metrics: ['Salary', 'Performance'], dimensions: ['Name', 'Department'] },
      ],
    },
  },
  {
    id: 'marketing-funnel',
    title: 'Marketing Funnel Dashboard',
    description: 'Monitor website traffic, conversion rates, and campaign performance in real-time.',
    category: 'Marketing',
    icon: <Globe className="w-5 h-5" />,
    color: 'from-blue-500/20 to-blue-600/5',
    metrics: ['1.2M Visitors', '3.4% Conversion', '45% Bounce Rate'],
    chartTypes: ['Area Chart', 'Bar Chart', 'KPI Cards'],
    datasetIndex: 2,
    prompt: 'Show visitor trends, conversion funnel, and page performance metrics',
    spec: {
      title: 'Marketing Funnel Dashboard',
      visuals: [
        { id: 'kpi-1', type: 'card', title: 'Total Visitors', metrics: ['Visitors'], dimensions: [] },
        { id: 'kpi-2', type: 'card', title: 'Conversions', metrics: ['Conversions'], dimensions: [] },
        { id: 'kpi-3', type: 'card', title: 'Avg Bounce Rate', metrics: ['Bounce_Rate'], dimensions: [] },
        { id: 'area-1', type: 'area', title: 'Traffic Over Time', metrics: ['Visitors'], dimensions: ['Date'] },
        { id: 'bar-1', type: 'bar', title: 'Conversions by Page', metrics: ['Conversions'], dimensions: ['Page'] },
        { id: 'table-1', type: 'table', title: 'Page Performance', metrics: ['Visitors', 'Conversions', 'Bounce_Rate'], dimensions: ['Page'] },
      ],
    },
  },
  {
    id: 'product-analysis',
    title: 'Product Analysis Dashboard',
    description: 'Deep dive into product performance, profit margins, and inventory insights.',
    category: 'Product',
    icon: <ShoppingCart className="w-5 h-5" />,
    color: 'from-amber-500/20 to-amber-600/5',
    metrics: ['$890K Profit', '23% Margin', '4.2K Units'],
    chartTypes: ['Combo Chart', 'Bar Chart', 'Table'],
    datasetIndex: 0,
    prompt: 'Show product profitability, revenue vs cost comparison, and inventory analysis',
    spec: {
      title: 'Product Analysis Dashboard',
      visuals: [
        { id: 'kpi-1', type: 'card', title: 'Total Sales', metrics: ['Sales'], dimensions: [] },
        { id: 'kpi-2', type: 'card', title: 'Total Quantity', metrics: ['Quantity'], dimensions: [] },
        { id: 'kpi-3', type: 'card', title: 'Avg Sale Price', metrics: ['Sales'], dimensions: [] },
        { id: 'combo-1', type: 'combo', title: 'Revenue vs Quantity', metrics: ['Sales', 'Quantity'], dimensions: ['Product'] },
        { id: 'bar-1', type: 'bar', title: 'Top Selling Products', metrics: ['Quantity'], dimensions: ['Product'], sort: 'desc' },
        { id: 'table-1', type: 'table', title: 'Product Details', metrics: ['Sales', 'Quantity'], dimensions: ['Product', 'Region'] },
      ],
    },
  },
  {
    id: 'regional-breakdown',
    title: 'Regional Performance',
    description: 'Compare performance across geographic regions with detailed breakdowns.',
    category: 'Sales',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'from-pink-500/20 to-pink-600/5',
    metrics: ['12 Regions', '$2.4M Total', 'Top: West'],
    chartTypes: ['Bar Chart', 'Pie Chart', 'Table'],
    datasetIndex: 0,
    prompt: 'Compare sales performance across all regions with rankings and detailed breakdown',
    spec: {
      title: 'Regional Performance Dashboard',
      visuals: [
        { id: 'kpi-1', type: 'card', title: 'Total Regions', metrics: ['Region'], dimensions: [] },
        { id: 'kpi-2', type: 'card', title: 'Total Sales', metrics: ['Sales'], dimensions: [] },
        { id: 'bar-1', type: 'bar', title: 'Sales by Region', metrics: ['Sales'], dimensions: ['Region'], sort: 'desc' },
        { id: 'pie-1', type: 'pie', title: 'Revenue Share', metrics: ['Sales'], dimensions: ['Region'] },
        { id: 'table-1', type: 'table', title: 'Regional Details', metrics: ['Sales', 'Quantity'], dimensions: ['Region', 'Product'] },
      ],
    },
  },
  {
    id: 'trend-explorer',
    title: 'Trend Explorer Dashboard',
    description: 'Discover patterns and trends in your data with time-series analysis.',
    category: 'Analytics',
    icon: <LineChart className="w-5 h-5" />,
    color: 'from-cyan-500/20 to-cyan-600/5',
    metrics: ['12 Months', '+18% Growth', '3 Key Trends'],
    chartTypes: ['Line Chart', 'Area Chart', 'KPI Cards'],
    datasetIndex: 0,
    prompt: 'Analyze time-based trends with growth indicators and seasonal patterns',
    spec: {
      title: 'Trend Explorer Dashboard',
      visuals: [
        { id: 'kpi-1', type: 'card', title: 'Total Sales', metrics: ['Sales'], dimensions: [] },
        { id: 'kpi-2', type: 'card', title: 'Growth Rate', metrics: ['Sales'], dimensions: [] },
        { id: 'line-1', type: 'line', title: 'Sales Trend', metrics: ['Sales'], dimensions: ['Month'] },
        { id: 'area-1', type: 'area', title: 'Cumulative Sales', metrics: ['Sales'], dimensions: ['Month'] },
        { id: 'bar-1', type: 'bar', title: 'Monthly Comparison', metrics: ['Sales'], dimensions: ['Month'] },
      ],
    },
  },
];

interface ExamplesGalleryProps {
  onLoadExample?: () => void;
}

export function ExamplesGallery({ onLoadExample }: ExamplesGalleryProps) {
  const { setFileData, setPrompt, setDashboardSpec, rawData } = useAppStore();
  const [previewExample, setPreviewExample] = useState<ExampleDashboard | null>(null);

  const handleLoadExample = (example: ExampleDashboard) => {
    const dataset = demoDatasets[example.datasetIndex];
    setFileData(
      `${dataset.name.toLowerCase().replace(' ', '_')}.csv`,
      dataset.data,
      dataset.schema as ColumnSchema[]
    );
    setPrompt(example.prompt);
    setDashboardSpec(example.spec);
    setPreviewExample(null);
    trackEvent.exampleLoaded(example.id);
    onLoadExample?.();
    toast({
      title: 'Example loaded!',
      description: `"${example.title}" is ready to explore and customize.`,
    });
  };

  // Don't show if data is already loaded
  if (rawData.length > 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6"
      >
        <div className="flex-between mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Example Dashboards
            </h2>
            <p className="text-sm text-muted-foreground">
              See what's possible — click to load and explore
            </p>
          </div>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            {exampleDashboards.length} examples
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exampleDashboards.map((example, index) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'group relative rounded-xl overflow-hidden border border-border/50',
                'bg-gradient-to-br transition-all duration-300',
                'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
                example.color
              )}
            >
              {/* Card content */}
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex-center flex-shrink-0',
                    'bg-background/80 backdrop-blur-sm border border-border/50',
                    'group-hover:border-primary/30 transition-colors'
                  )}>
                    {example.icon}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-sm mb-0.5 truncate">{example.title}</h3>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {example.category}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {example.description}
                </p>

                {/* Metrics preview */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {example.metrics.map((metric, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 bg-background/60 rounded-full text-muted-foreground"
                    >
                      {metric}
                    </span>
                  ))}
                </div>

                {/* Chart types */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {example.chartTypes.map((type, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 border-border/30">
                      {type}
                    </Badge>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setPreviewExample(example)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => handleLoadExample(example)}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Load
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border/50 flex-center">
          <p className="text-xs text-muted-foreground">
            Or upload your own data to create a custom dashboard from scratch
          </p>
        </div>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewExample && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex-center p-4"
            onClick={() => setPreviewExample(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex-center',
                      'bg-gradient-to-br',
                      previewExample.color
                    )}>
                      {previewExample.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{previewExample.title}</h3>
                      <Badge variant="secondary">{previewExample.category}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPreviewExample(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-muted-foreground mb-6">{previewExample.description}</p>

                {/* Metrics */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">Key Metrics</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewExample.metrics.map((metric, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-primary/10 rounded-lg text-sm font-medium text-primary"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Visuals preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">Included Visualizations</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {previewExample.spec.visuals.map((visual) => (
                      <div
                        key={visual.id}
                        className="p-3 bg-muted/50 rounded-lg border border-border/30"
                      >
                        <div className="text-xs font-medium mb-1">{visual.title}</div>
                        <Badge variant="outline" className="text-[10px]">
                          {visual.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prompt used */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">Generated from prompt</h4>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                    <p className="text-sm text-muted-foreground italic">"{previewExample.prompt}"</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPreviewExample(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleLoadExample(previewExample)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Load This Dashboard
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
