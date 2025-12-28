import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { Hash, Type, Calendar, TrendingUp, Layers } from 'lucide-react';

interface DataPreviewProps {
  className?: string;
}

export const DataPreview = ({ className }: DataPreviewProps) => {
  const { rawData, schema } = useAppStore();

  if (rawData.length === 0 || schema.length === 0) return null;

  const previewData = rawData.slice(0, 10);
  const measures = schema.filter((s) => s.type === 'measure');
  const dimensions = schema.filter((s) => s.type === 'dimension');
  const dates = schema.filter((s) => s.type === 'date');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'measure':
        return <Hash className="w-3 h-3" />;
      case 'dimension':
        return <Type className="w-3 h-3" />;
      case 'date':
        return <Calendar className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'measure':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'dimension':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'date':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-4', className)}
    >
      {/* Schema Summary */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-border">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{measures.length} Measures</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-border">
          <Layers className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">{dimensions.length} Dimensions</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-border">
          <Calendar className="w-4 h-4 text-warning" />
          <span className="text-sm font-medium">{dates.length} Date Fields</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                {schema.map((col) => (
                  <TableHead key={col.name} className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{col.name}</span>
                      <Badge variant="outline" className={cn('text-xs font-normal', getTypeBadgeClass(col.type))}>
                        {getTypeIcon(col.type)}
                        <span className="ml-1">{col.type}</span>
                      </Badge>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((row, idx) => (
                <TableRow key={idx} className="border-border">
                  {schema.map((col) => (
                    <TableCell key={col.name} className="whitespace-nowrap font-mono text-sm">
                      {String(row[col.name] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-2 bg-muted/30 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing {previewData.length} of {rawData.length} rows
          </p>
        </div>
      </div>
    </motion.div>
  );
};
