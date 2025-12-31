import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { Hash, Type, Calendar, TrendingUp, Layers, FileSpreadsheet } from 'lucide-react';

interface DataPreviewProps {
  className?: string;
}

export const DataPreview = ({ className }: DataPreviewProps) => {
  const { rawData, schema, fileName } = useAppStore();

  if (rawData.length === 0 || schema.length === 0) return null;

  const previewData = rawData.slice(0, 8);
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
      {/* File name and schema summary */}
      <div className="flex-wrap-center gap-3">
        {fileName && (
          <div className="flex-start gap-2 px-3 py-1.5 bg-card rounded-lg border border-border">
            <FileSpreadsheet className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium">{fileName}</span>
          </div>
        )}
      </div>

      {/* Schema Summary */}
      <div className="flex-wrap-center gap-2">
        <div className="flex-start gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/20">
          <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium">{measures.length} Measures</span>
        </div>
        <div className="flex-start gap-2 px-3 py-1.5 bg-accent/5 rounded-lg border border-accent/20">
          <Layers className="w-4 h-4 text-accent flex-shrink-0" />
          <span className="text-sm font-medium">{dimensions.length} Dimensions</span>
        </div>
        {dates.length > 0 && (
          <div className="flex-start gap-2 px-3 py-1.5 bg-warning/5 rounded-lg border border-warning/20">
            <Calendar className="w-4 h-4 text-warning flex-shrink-0" />
            <span className="text-sm font-medium">{dates.length} Date Fields</span>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card/50">
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border bg-muted/30">
                {schema.map((col) => (
                  <TableHead key={col.name} className="whitespace-nowrap py-3">
                    <div className="flex-start gap-2">
                      <span className="font-semibold">{col.name}</span>
                      <Badge variant="outline" className={cn('text-xs font-normal flex items-center', getTypeBadgeClass(col.type))}>
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
                    <TableCell 
                      key={col.name} 
                      className={cn(
                        'whitespace-nowrap text-sm py-2',
                        col.type === 'measure' ? 'font-mono text-primary' : ''
                      )}
                    >
                      {col.type === 'measure' && typeof row[col.name] === 'number'
                        ? new Intl.NumberFormat('en-US').format(row[col.name] as number)
                        : String(row[col.name] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-2 bg-muted/30 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing {previewData.length} of {rawData.length} rows • {schema.length} columns detected
          </p>
        </div>
      </div>
    </motion.div>
  );
};
