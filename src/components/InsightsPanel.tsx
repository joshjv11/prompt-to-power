import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, RefreshCw, Loader2, TrendingUp, AlertCircle, Zap, Trophy, BarChart3, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { generateInsights } from '@/lib/insights';
import { cn } from '@/lib/utils';

const insightIcons: Record<string, React.ReactNode> = {
  '📊': <BarChart3 className="w-4 h-4 text-blue-400" />,
  '🏆': <Trophy className="w-4 h-4 text-yellow-400" />,
  '📈': <TrendingUp className="w-4 h-4 text-emerald-400" />,
  '⚡': <Zap className="w-4 h-4 text-purple-400" />,
  '📋': <Target className="w-4 h-4 text-cyan-400" />,
};

function getInsightIcon(insight: string) {
  for (const [emoji, icon] of Object.entries(insightIcons)) {
    if (insight.startsWith(emoji)) {
      return { icon, text: insight.slice(emoji.length).trim() };
    }
  }
  return { icon: <TrendingUp className="w-4 h-4 text-primary" />, text: insight };
}

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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning/20 to-orange-500/10 flex-center flex-shrink-0 border border-warning/20">
            <Lightbulb className="w-4 h-4 text-warning" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-sm">Key Insights</h3>
            <p className="text-xs text-muted-foreground">AI-powered business intelligence</p>
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
              <span className="text-sm">Analyzing your data for actionable insights...</span>
            </div>
          </motion.div>
        ) : insights.length > 0 ? (
          <motion.ul
            key="insights"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {insights.map((insight, index) => {
              const { icon, text } = getInsightIcon(insight);
              return (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={cn(
                    'flex-start gap-3 p-3 rounded-lg',
                    'bg-gradient-to-r from-muted/50 to-transparent',
                    'border border-border/30 hover:border-border/50 transition-colors',
                    'items-start'
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">{icon}</div>
                  <span className="text-sm leading-relaxed flex-grow">{text}</span>
                </motion.li>
              );
            })}
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
