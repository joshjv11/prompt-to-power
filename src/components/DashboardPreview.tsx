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
import { TrendingUp, TrendingDown } from 'lucide-react';

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
  const { dashboardSpec, rawData } = useAppStore();

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

      <div className="grid gap-4 md:grid-cols-2">
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

// Aggregation helper
function aggregateData(
  data: DataRow[],
  dimension: string | null,
  metricName: string
): { name: string; value: number }[] {
  if (!dimension) {
    // Total aggregation
    const total = data.reduce((sum, row) => {
      const val = typeof row[metricName] === 'number' ? row[metricName] : parseFloat(String(row[metricName])) || 0;
      return sum + val;
    }, 0);
    return [{ name: 'Total', value: total }];
  }

  const grouped: Record<string, number> = {};

  data.forEach((row) => {
    const key = String(row[dimension] || 'Unknown');
    const val = typeof row[metricName] === 'number' ? row[metricName] : parseFloat(String(row[metricName])) || 0;
    grouped[key] = (grouped[key] || 0) + val;
  });

  return Object.entries(grouped).map(([name, value]) => ({ name, value }));
}

const VisualCard = ({ visual, data, index }: VisualCardProps) => {
  const chartData = useMemo(() => {
    const metric = visual.metrics[0]?.replace(/SUM\(|AVG\(|COUNT\(|\)/g, '') || '';
    const dim = visual.dimensions[0] || null;

    const aggregated = aggregateData(data, dim, metric);

    // Sort if needed
    if (visual.sort === 'desc') {
      aggregated.sort((a, b) => b.value - a.value);
    } else if (visual.sort === 'asc') {
      aggregated.sort((a, b) => a.value - b.value);
    }

    // Limit for readability
    return aggregated.slice(0, 10);
  }, [visual, data]);

  const totalValue = useMemo(() => {
    const metric = visual.metrics[0]?.replace(/SUM\(|AVG\(|COUNT\(|\)/g, '') || '';
    return data.reduce((sum, row) => {
      const val = typeof row[metric] === 'number' ? row[metric] : parseFloat(String(row[metric])) || 0;
      return sum + val;
    }, 0);
  }, [visual, data]);

  const renderChart = () => {
    const metric = visual.metrics[0]?.replace(/SUM\(|AVG\(|COUNT\(|\)/g, '') || 'value';

    switch (visual.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={(v) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [new Intl.NumberFormat('en-US').format(value), metric]}
              />
              <Bar dataKey="value" fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={(v) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [new Intl.NumberFormat('en-US').format(value), metric]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={(v) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [new Intl.NumberFormat('en-US').format(value), metric]}
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
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
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
                formatter={(value: number) => [new Intl.NumberFormat('en-US').format(value), metric]}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'card':
        const formatted = new Intl.NumberFormat('en-US', {
          notation: totalValue > 1000000 ? 'compact' : 'standard',
          maximumFractionDigits: totalValue > 1000000 ? 1 : 0,
        }).format(totalValue);
        
        // Simulate a trend (in production this would be calculated from historical data)
        const trendValue = ((Math.random() * 20) + 5).toFixed(1);
        const isPositive = Math.random() > 0.3;

        return (
          <div className="flex flex-col items-center justify-center h-[180px] text-center">
            <p className="text-4xl font-bold text-gradient mb-1">{formatted}</p>
            <p className="text-sm text-muted-foreground">{metric}</p>
            <div className={cn(
              'flex items-center gap-1 mt-3 text-sm font-medium',
              isPositive ? 'text-success' : 'text-destructive'
            )}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isPositive ? '+' : '-'}{trendValue}% vs last period</span>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="max-h-[220px] overflow-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-xs">{visual.dimensions[0] || 'Name'}</TableHead>
                  <TableHead className="text-right text-xs">{metric}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartData.slice(0, 8).map((row, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell className="py-2 text-sm">{row.name}</TableCell>
                    <TableCell className="text-right font-mono text-sm py-2">
                      {new Intl.NumberFormat('en-US').format(row.value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      default:
        return (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground">
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
      <Card className="glass-panel border-border/50 overflow-hidden h-full">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-foreground/90">{visual.title}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">{renderChart()}</CardContent>
      </Card>
    </motion.div>
  );
};
