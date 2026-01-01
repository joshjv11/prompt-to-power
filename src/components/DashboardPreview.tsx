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
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppStore, Visual, DataRow, VisualType } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { aggregateForVisual, calculateHistogram, calculateScatterData, extractColumnName } from '@/lib/dataAggregation';

const COLORS = [
  'hsl(199, 89%, 48%)',
  'hsl(280, 87%, 65%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(217, 91%, 60%)',
  'hsl(162, 73%, 46%)',
  'hsl(330, 81%, 60%)',
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
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gradient">{dashboardSpec.title}</h2>
        <span className="text-sm text-muted-foreground flex-shrink-0">
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

const VisualCard = ({ visual, data, index }: VisualCardProps) => {
  // Use smart aggregation
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Handle special chart types
    if (visual.type === 'histogram') {
      const metric = visual.metrics?.[0] || '';
      return calculateHistogram(data, metric, visual.bins || 10);
    }

    return aggregateForVisual(data, visual);
  }, [visual, data]);

  const totalValue = useMemo(() => {
    const metrics = visual.metrics || [];
    const metric = extractColumnName(metrics[0] || '');
    
    if (!metric) return 0;
    
    return data.reduce((sum, row) => {
      const val = typeof row[metric] === 'number' ? row[metric] : parseFloat(String(row[metric])) || 0;
      return sum + val;
    }, 0);
  }, [visual, data]);

  const renderChart = () => {
    const metrics = visual.metrics || [];
    const dimensions = visual.dimensions || [];
    const metric = extractColumnName(metrics[0] || '') || 'value';

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

      case 'combo':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
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
              />
              <Bar dataKey="value" fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="value" stroke={COLORS[(index + 1) % COLORS.length]} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        const scatterData = useMemo(() => {
          if (metrics.length >= 2) {
            return calculateScatterData(data, metrics[0], metrics[1], dimensions[0]);
          }
          // Single metric scatter - use index as x
          return chartData.map((item, i) => ({
            x: i,
            y: item.value,
            label: item.name
          }));
        }, [data, metrics, dimensions, chartData]);

        return (
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="x"
                type="number"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={(v) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(v)}
              />
              <YAxis
                dataKey="y"
                type="number"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={(v) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
              />
              <Scatter data={scatterData} fill={COLORS[index % COLORS.length]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [value, 'Count']}
              />
              <Bar dataKey="value" fill={COLORS[index % COLORS.length]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'funnel':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <FunnelChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Funnel
                dataKey="value"
                data={chartData}
                isAnimationActive
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
                <LabelList position="right" fill="hsl(var(--foreground))" fontSize={11} dataKey="name" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        );

      case 'gauge':
        const gaugeValue = chartData[0]?.value || 0;
        const maxValue = Math.max(...chartData.map(d => d.value), gaugeValue * 1.5);
        const percentage = (gaugeValue / maxValue) * 100;
        
        return (
          <div className="flex-col-center h-[180px] relative">
            <div className="relative w-40 h-20 overflow-hidden">
              <div 
                className="absolute inset-0 rounded-t-full border-8 border-muted"
                style={{ borderBottom: 'none' }}
              />
              <div 
                className="absolute inset-0 rounded-t-full border-8 transition-all duration-1000"
                style={{ 
                  borderBottom: 'none',
                  borderColor: COLORS[index % COLORS.length],
                  clipPath: `polygon(0 100%, ${percentage}% 100%, ${percentage}% 0, 0 0)`
                }}
              />
            </div>
            <p className="text-3xl font-bold text-gradient mt-2">
              {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(gaugeValue)}
            </p>
            <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}% of target</p>
          </div>
        );

      case 'waterfall':
        // Waterfall rendered as stacked bars
        let cumulative = 0;
        const waterfallData = chartData.map((item, i) => {
          const prev = cumulative;
          cumulative += item.value;
          return {
            name: item.name,
            value: item.value,
            start: prev,
            end: cumulative,
            fill: item.value >= 0 ? COLORS[2] : COLORS[4] // green for positive, red for negative
          };
        });

        return (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={waterfallData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
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
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {waterfallData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'heatmap':
      case 'treemap':
      case 'bullet':
        // Fallback to bar for complex types not yet fully implemented
        return (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
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

      case 'card':
        const formatted = new Intl.NumberFormat('en-US', {
          notation: totalValue > 1000000 ? 'compact' : 'standard',
          maximumFractionDigits: totalValue > 1000000 ? 1 : 0,
        }).format(totalValue);
        
        // Simulate a trend (in production this would be calculated from historical data)
        const trendValue = ((Math.random() * 20) + 5).toFixed(1);
        const isPositive = Math.random() > 0.3;

        return (
          <div className="flex-col-center h-[180px] text-center">
            <p className="text-4xl font-bold text-gradient mb-1">{formatted}</p>
            <p className="text-sm text-muted-foreground">{metric}</p>
            <div className={cn(
              'flex-start gap-1 mt-3 text-sm font-medium',
              isPositive ? 'text-success' : 'text-destructive'
            )}>
              {isPositive ? <TrendingUp className="w-4 h-4 flex-shrink-0" /> : <TrendingDown className="w-4 h-4 flex-shrink-0" />}
              <span>{isPositive ? '+' : '-'}{trendValue}% vs last period</span>
            </div>
          </div>
        );

      case 'table':
        const tableDimensions = visual.dimensions || [];
        return (
          <div className="max-h-[220px] overflow-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-xs">{tableDimensions[0] || 'Name'}</TableHead>
                  <TableHead className="text-right text-xs">{metric}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartData.slice(0, visual.topN || 10).map((row, i) => (
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
          <div className="h-[220px] flex-center text-muted-foreground gap-2">
            <BarChart3 className="w-5 h-5" />
            <span>Chart type: {visual.type}</span>
          </div>
        );
    }
  };

  // Safety check: ensure we have valid metrics for non-table charts
  const metrics = visual.metrics || [];
  if (metrics.length === 0 && visual.type !== 'table') {
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
          <CardContent className="px-4 pb-4 flex-center h-[220px] text-muted-foreground text-sm gap-2">
            <Activity className="w-4 h-4" />
            No metrics configured
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const getColSpan = (type: VisualType): string => {
    if (type === 'card') return '';
    if (type === 'table') return 'md:col-span-2';
    if (type === 'heatmap' || type === 'treemap') return 'md:col-span-2';
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={getColSpan(visual.type)}
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
