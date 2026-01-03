import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDrillThrough } from '@/hooks/useDrillThrough';

export const DrillFilterBar = () => {
  const { filters, removeFilter, clearFilters } = useDrillThrough();

  if (filters.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20"
    >
      <Filter className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
      
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {filters.map((filter) => (
            <motion.div
              key={`${filter.dimension}-${filter.value}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
            >
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 cursor-pointer group"
                onClick={() => removeFilter(filter.dimension)}
              >
                <span className="font-medium">{filter.dimension}:</span>
                <span>{filter.value}</span>
                <X className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={clearFilters}
        className="ml-auto text-xs"
      >
        Clear all
      </Button>
    </motion.div>
  );
};
