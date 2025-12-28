import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppStore, Visual, DataRow } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const COLORS = [
  'hsl(199, 89%, 48%)',
  'hsl(280, 87%, 65%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(217, 91%, 60%)',
];

interface DashboardPreviewProps {
  className?: string;
}

export const DashboardPreview = ({ className }: DashboardPreviewProps) => {
  const { dashboardSpec, rawData, schema } = useAppStore();

  if (!dashboardSpec) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('space-y-6', className)}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gradient">{dashboardSpec.title}</h2>
        <span className="text-sm text-muted-foreground">
          {dashboardSpec.visuals.length} visual{dashboardSpec.visuals.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {dashboardSpec.visuals.map((visual, idx) => (
          <VisualCard
            key={visual.id}
            visual={visual}
            data={rawData}
            index={idx}
          />
        ))}
      </div>
    </motion.div>
  );
};

interface VisualCardProps {
  visual: Visual;
  data: DataRow[];
  index: number;
}

const VisualCard = ({ visual, data, index }: VisualCardProps) => {
  const chartData = useMemo(() => {
    if (visual.dimensions.length === 0) return data;

    const dim = visual.dimensions[0];
    const metric = visual.metrics[0]?.replace(/SUM\(|AVG\(|COUNT\(|\)/g, '') || '';

    const grouped: Record<string, { [key: string]: number }> = {};

    data.forEach((row) => {
      const key = String(row[dim] || 'Unknown');
      if (!grouped[key]) {
        grouped[key] = { [dim]: 0 };
      }
      const value = typeof row[metric] === 'number' ? row[metric] : parseFloat(String(row[metric])) || 0;
      grouped[key][metric] = (grouped[key][metric] || 0) + value;
    });

    return Object.entries(grouped)
      .map(([key, values]) => ({
        name: key,
        value: values[metric] || 0,
        [metric]: values[metric] || 0,
      }))
      .sort((a, b) => (visual.sort === 'asc' ? a.value - b.value : b.value - a.value))
      .slice(0, 10);
  }, [visual, data]);

  const renderChart = () => {
    const metric = visual.metrics[0]?.replace(/SUM\(|AVG\(|COUNT\(|\)/g, '') || 'value';

    switch (visual.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ fill: COLORS[index % COLORS.length] }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={COLORS[index % COLORS.length]}
                fill={`${COLORS[index % COLORS.length]}33`}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'card':
        const total = chartData.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0);
        const formatted = new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(total);
        const trend = Math.random() > 0.5 ? 'up' : 'down';

        return (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <p className="text-5xl font-bold text-gradient">{formatted}</p>
            <p className="text-sm text-muted-foreground mt-2">{metric}</p>
            <div className={cn(
              'flex items-center gap-1 mt-3 text-sm font-medium',
              trend === 'up' ? 'text-success' : 'text-destructive'
            )}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{(Math.random() * 20 + 5).toFixed(1)}%</span>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="max-h-[250px] overflow-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartData.map((row, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {typeof row.value === 'number' ? new Intl.NumberFormat('en-US').format(row.value) : row.value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      default:
        return (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Unsupported chart type: {visual.type}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        visual.type === 'card' ? 'md:col-span-1' : '',
        visual.type === 'table' ? 'md:col-span-2' : ''
      )}
    >
      <Card className="glass-panel border-border/50 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">{visual.title}</CardTitle>
        </CardHeader>
        <CardContent>{renderChart()}</CardContent>
      </Card>
    </motion.div>
  );
};
