import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { MousePointerClick } from 'lucide-react';
import { useDrillThrough, DrillFilter } from '@/hooks/useDrillThrough';
import { DrillFilterBar } from '@/components/DrillFilterBar';
import { VisualCard } from '@/components/VisualCard';

interface DashboardPreviewProps {
  className?: string;
}

export const DashboardPreview = ({ className }: DashboardPreviewProps) => {
  const { dashboardSpec, rawData } = useAppStore();
  const { filters, toggleFilter } = useDrillThrough();

  const handleChartClick = useCallback((filter: DrillFilter) => {
    toggleFilter(filter);
  }, [toggleFilter]);

  if (!dashboardSpec) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('space-y-6', className)}
    >
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gradient">{dashboardSpec.title}</h2>
        <div className="flex items-center gap-3">
          {filters.length === 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MousePointerClick className="w-3 h-3" />
              Click charts to filter
            </span>
          )}
          <span className="text-sm text-muted-foreground flex-shrink-0">
            {dashboardSpec.visuals.length} visual{dashboardSpec.visuals.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <DrillFilterBar />

      <div className="grid gap-4 md:grid-cols-2">
        {dashboardSpec.visuals.map((visual, idx) => (
          <VisualCard
            key={visual.id}
            visual={visual}
            data={rawData}
            index={idx}
            filters={filters}
            onChartClick={handleChartClick}
          />
        ))}
      </div>
    </motion.div>
  );
};
