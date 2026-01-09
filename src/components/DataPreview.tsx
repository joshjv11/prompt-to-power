import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

interface DataPreviewProps {
  className?: string;
}

export const DataPreview = ({ className }: DataPreviewProps) => {
  const { rawData, schema } = useAppStore();

  const measures = useMemo(() => schema.filter((s) => s.type === 'measure'), [schema]);
  const dimensions = useMemo(() => schema.filter((s) => s.type === 'dimension'), [schema]);
  const dates = useMemo(() => schema.filter((s) => s.type === 'date'), [schema]);

  if (rawData.length === 0 || schema.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Compact Schema Summary */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-muted-foreground">{rawData.length.toLocaleString()} rows</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-primary">{measures.length} measures</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-accent">{dimensions.length} dimensions</span>
        {dates.length > 0 && (
          <>
            <span className="text-muted-foreground">•</span>
            <span className="text-warning">{dates.length} dates</span>
          </>
        )}
      </div>

      {/* Column chips */}
      <div className="flex flex-wrap gap-1">
        {schema.slice(0, 8).map((col) => (
          <span
            key={col.name}
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full border',
              col.type === 'measure' && 'bg-primary/10 text-primary border-primary/20',
              col.type === 'dimension' && 'bg-accent/10 text-accent border-accent/20',
              col.type === 'date' && 'bg-warning/10 text-warning border-warning/20'
            )}
          >
            {col.name}
          </span>
        ))}
        {schema.length > 8 && (
          <span className="text-[10px] px-2 py-0.5 text-muted-foreground">
            +{schema.length - 8} more
          </span>
        )}
      </div>
    </div>
  );
};
