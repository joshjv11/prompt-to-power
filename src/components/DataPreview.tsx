import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { Hash, Type, Calendar, TrendingUp, Layers, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { validateDataQuality, DataQualityReport } from '@/lib/dataValidation';

interface DataPreviewProps {
  className?: string;
}

export const DataPreview = ({ className }: DataPreviewProps) => {
  const { rawData, schema, fileName, getPreviewData } = useAppStore();
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);

  // Use preview data with sampling if enabled - limit display to 100 rows for performance
  // IMPORTANT: All hooks must be called before any conditional returns
  const previewData = useMemo(() => {
    if (rawData.length === 0) return [];
    const data = getPreviewData();
    // For display, limit to 100 rows for performance (virtual scrolling can be added later if needed)
    return data.slice(0, 100);
  }, [rawData, getPreviewData]);
  
  const measures = useMemo(() => schema.filter((s) => s.type === 'measure'), [schema]);
  const dimensions = useMemo(() => schema.filter((s) => s.type === 'dimension'), [schema]);
  const dates = useMemo(() => schema.filter((s) => s.type === 'date'), [schema]);

  // Validate data quality
  useEffect(() => {
    if (rawData.length > 0 && schema.length > 0) {
      const report = validateDataQuality(rawData, schema);
      setQualityReport(report);
    } else {
      setQualityReport(null);
    }
  }, [rawData, schema]);

  // Early return after all hooks are called
  if (rawData.length === 0 || schema.length === 0) return null;

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
        <div className="overflow-x-auto scrollbar-thin max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/30 z-10">
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
        {/* Data Quality Report */}
        {qualityReport && qualityReport.issues.length > 0 && (
          <div className="px-4 py-3 bg-muted/30 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {qualityReport.score >= 80 ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : qualityReport.score >= 60 ? (
                  <AlertTriangle className="w-4 h-4 text-warning" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                )}
                <span className="text-xs font-medium">
                  Data Quality Score: {qualityReport.score}/100
                </span>
              </div>
            </div>
            {qualityReport.errors.length > 0 && (
              <Alert variant="destructive" className="mb-2 py-2">
                <AlertTitle className="text-xs">Errors ({qualityReport.errors.length})</AlertTitle>
                <AlertDescription className="text-xs">
                  {qualityReport.errors.slice(0, 2).map((e) => e.message).join(', ')}
                  {qualityReport.errors.length > 2 && ` +${qualityReport.errors.length - 2} more`}
                </AlertDescription>
              </Alert>
            )}
            {qualityReport.warnings.length > 0 && (
              <Alert variant="default" className="py-2">
                <AlertTitle className="text-xs">Warnings ({qualityReport.warnings.length})</AlertTitle>
                <AlertDescription className="text-xs">
                  {qualityReport.warnings.slice(0, 2).map((w) => w.message).join(', ')}
                  {qualityReport.warnings.length > 2 && ` +${qualityReport.warnings.length - 2} more`}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        <div className="px-4 py-2 bg-muted/30 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing {previewData.length} of {rawData.length} rows • {schema.length} columns detected
            {qualityReport && qualityReport.score < 100 && (
              <span className={cn(
                'ml-2',
                qualityReport.score >= 80 ? 'text-success' : qualityReport.score >= 60 ? 'text-warning' : 'text-destructive'
              )}>
                • Quality: {qualityReport.score}%
              </span>
            )}
            {previewData.length < rawData.length && ' (using data sampling for performance)'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
