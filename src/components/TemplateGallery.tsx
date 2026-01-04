import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { demoDatasets } from '@/data/sampleData';
import { 
  TrendingUp, 
  Users, 
  Globe, 
  ShoppingCart, 
  BarChart3,
  PieChart,
  LineChart,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  datasetIndex: number;
  prompt: string;
  color: string;
}

const templates: Template[] = [
  {
    id: 'sales-executive',
    name: 'Sales Executive',
    description: 'Revenue by region, top products, YoY growth trends',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'Sales',
    datasetIndex: 0,
    prompt: 'Show total sales as KPI cards, monthly revenue trends as a line chart, sales breakdown by region as a bar chart, and top 5 products by revenue in a table',
    color: 'from-emerald-500/20 to-emerald-600/10',
  },
  {
    id: 'hr-analytics',
    name: 'HR Manager',
    description: 'Headcount, salary distribution, performance metrics',
    icon: <Users className="w-5 h-5" />,
    category: 'HR',
    datasetIndex: 1,
    prompt: 'Show total employees and average salary as KPI cards, salary distribution by department as a bar chart, performance score distribution as a pie chart, and employee details in a sortable table',
    color: 'from-violet-500/20 to-violet-600/10',
  },
  {
    id: 'marketing-analyst',
    name: 'Marketing Analyst',
    description: 'Traffic trends, conversion funnel, page performance',
    icon: <Globe className="w-5 h-5" />,
    category: 'Marketing',
    datasetIndex: 2,
    prompt: 'Show total visitors and conversions as KPI cards, visitor trends over time as a line chart, conversions by page as a bar chart, and bounce rate comparison as a combo chart',
    color: 'from-blue-500/20 to-blue-600/10',
  },
  {
    id: 'product-performance',
    name: 'Product Performance',
    description: 'Best sellers, profit margins, inventory analysis',
    icon: <ShoppingCart className="w-5 h-5" />,
    category: 'Sales',
    datasetIndex: 0,
    prompt: 'Show revenue vs cost comparison as a combo chart, profit margin by product as a bar chart, quantity sold distribution as a pie chart, and detailed product metrics in a table',
    color: 'from-amber-500/20 to-amber-600/10',
  },
  {
    id: 'quick-comparison',
    name: 'Quick Comparison',
    description: 'Side-by-side metric comparison across dimensions',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'General',
    datasetIndex: 0,
    prompt: 'Compare sales across all regions with a horizontal bar chart, show quantity vs sales correlation, and display a summary table with all metrics',
    color: 'from-pink-500/20 to-pink-600/10',
  },
  {
    id: 'trend-analysis',
    name: 'Trend Analysis',
    description: 'Time-series patterns and seasonal insights',
    icon: <LineChart className="w-5 h-5" />,
    category: 'General',
    datasetIndex: 0,
    prompt: 'Show sales trend over time as an area chart, monthly comparison with previous period, highlight peak and low points, and display running total KPI',
    color: 'from-cyan-500/20 to-cyan-600/10',
  },
];

interface TemplateGalleryProps {
  onSelectTemplate: () => void;
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const { setFileData, setPrompt, rawData } = useAppStore();

  const handleSelectTemplate = (template: Template) => {
    const dataset = demoDatasets[template.datasetIndex];
    setFileData(`${dataset.name.toLowerCase().replace(' ', '_')}.csv`, dataset.data, dataset.schema);
    setPrompt(template.prompt);
    onSelectTemplate();
  };

  // Don't show if data is already loaded
  if (rawData.length > 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6"
    >
      <div className="flex-between mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Quick Start Templates</h2>
          <p className="text-sm text-muted-foreground">
            Pre-configured dashboards with sample data
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
            {templates.length} templates
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template, index) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleSelectTemplate(template)}
            className={cn(
              'group relative p-4 rounded-xl text-left transition-all duration-300',
              'bg-gradient-to-br border border-border/50',
              'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
              template.color
            )}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex-center flex-shrink-0',
                'bg-background/80 backdrop-blur-sm border border-border/50',
                'group-hover:border-primary/30 transition-colors'
              )}>
                {template.icon}
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="font-semibold text-sm mb-0.5 truncate">{template.name}</h3>
                <span className="text-xs text-muted-foreground">{template.category}</span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {template.description}
            </p>

            <div className="flex-between">
              <span className="text-xs text-muted-foreground/60">
                {demoDatasets[template.datasetIndex].name}
              </span>
              <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border/50 flex-center">
        <p className="text-xs text-muted-foreground">
          Or upload your own data above to create a custom dashboard
        </p>
      </div>
    </motion.div>
  );
}
