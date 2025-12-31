import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, RefreshCw, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { generateInsights } from '@/lib/insights';
import { cn } from '@/lib/utils';

export function InsightsPanel() {
  const {
    dashboardSpec,
    rawData,
    schema,
    insights,
    isLoadingInsights,
    setInsights,
    setIsLoadingInsights,
  } = useAppStore();

  const loadInsights = useCallback(async () => {
    if (!dashboardSpec || !rawData.length) return;

    setIsLoadingInsights(true);
    try {
      const newInsights = await generateInsights(dashboardSpec, rawData, schema);
      setInsights(newInsights);
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setInsights(['Unable to generate insights at this time.']);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [dashboardSpec, rawData, schema, setInsights, setIsLoadingInsights]);

  useEffect(() => {
    if (dashboardSpec && insights.length === 0 && !isLoadingInsights) {
      loadInsights();
    }
  }, [dashboardSpec, insights.length, isLoadingInsights, loadInsights]);

  if (!dashboardSpec) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4"
    >
      <div className="flex-between mb-4">
        <div className="flex-start gap-2">
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-warning" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-sm">Key Insights</h3>
            <p className="text-xs text-muted-foreground">AI-powered analysis</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadInsights}
          disabled={isLoadingInsights}
          className="gap-2 flex items-center"
        >
          {isLoadingInsights ? (
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          ) : (
            <RefreshCw className="w-4 h-4 flex-shrink-0" />
          )}
          Refresh
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isLoadingInsights ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-center py-8"
          >
            <div className="flex-start gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
              <span className="text-sm">Analyzing your dashboard...</span>
            </div>
          </motion.div>
        ) : insights.length > 0 ? (
          <motion.ul
            key="insights"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {insights.map((insight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex-start gap-3 p-3 rounded-lg',
                  'bg-muted/30 hover:bg-muted/50 transition-colors',
                  'items-start'
                )}
              >
                <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm leading-relaxed flex-grow">{insight}</span>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-center py-8 text-muted-foreground"
          >
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">No insights available</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
