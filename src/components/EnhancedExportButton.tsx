import { useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { generatePowerBIExport, generatePBITTemplate, generatePlainTextInstructions } from '@/lib/powerBIExport';
import {
  Download,
  FileJson,
  FileText,
  FileSpreadsheet,
  FileImage,
  Loader2,
  Check,
  ChevronDown,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function EnhancedExportButton() {
  const { dashboardSpec, rawData, schema } = useAppStore();
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = useCallback(async (type: 'pbit' | 'json' | 'csv' | 'txt' | 'pdf') => {
    if (!dashboardSpec || !rawData.length) return;

    setIsExporting(type);

    try {
      switch (type) {
        case 'pdf': {
          const dashboardElement = document.getElementById('dashboard-preview');
          if (!dashboardElement) {
            toast({ title: 'Dashboard not found', variant: 'destructive' });
            break;
          }

          const canvas = await html2canvas(dashboardElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
          });

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height],
          });

          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`${dashboardSpec.title.replace(/\s+/g, '_')}.pdf`);
          toast({ title: 'PDF exported!' });
          break;
        }
        case 'pbit': {
          const template = generatePBITTemplate(dashboardSpec, schema, rawData);
          const blob = new Blob([template], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${dashboardSpec.title.replace(/\s+/g, '_')}.pbit.json`;
          a.click();
          URL.revokeObjectURL(url);
          toast({ 
            title: 'Power BI Template exported!', 
            description: 'Import this JSON into Power BI Desktop to get started' 
          });
          break;
        }
        case 'json': {
          const exportData = {
            dashboard: dashboardSpec,
            schema,
            exportedAt: new Date().toISOString(),
          };
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${dashboardSpec.title.replace(/\s+/g, '_')}.json`;
          a.click();
          URL.revokeObjectURL(url);
          toast({ title: 'JSON exported!' });
          break;
        }
        case 'csv': {
          const headers = Object.keys(rawData[0]);
          const csvContent = [
            headers.join(','),
            ...rawData.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
          ].join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'dashboard_data.csv';
          a.click();
          URL.revokeObjectURL(url);
          toast({ title: 'CSV exported!' });
          break;
        }
        case 'txt': {
          const exportData = generatePowerBIExport(dashboardSpec, schema, rawData);
          const instructions = generatePlainTextInstructions(exportData);
          const blob = new Blob([instructions], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${dashboardSpec.title.replace(/\s+/g, '_')}_instructions.txt`;
          a.click();
          URL.revokeObjectURL(url);
          toast({ title: 'Instructions exported!' });
          break;
        }
      }
      setLastExport(type);
      setTimeout(() => setLastExport(null), 2000);
    } catch (err) {
      console.error('Export failed:', err);
      toast({ title: 'Export failed', variant: 'destructive' });
    } finally {
      setIsExporting(null);
    }
  }, [dashboardSpec, rawData, schema]);

  if (!dashboardSpec) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className={cn(
            'gap-2 bg-gradient-to-r from-success to-emerald-600',
            'hover:from-success/90 hover:to-emerald-600/90',
            'text-success-foreground shadow-md shadow-success/20'
          )}
        >
          <Zap className="w-4 h-4" />
          Export
          <ChevronDown className="w-3 h-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          className="gap-3 cursor-pointer"
          disabled={isExporting === 'pdf'}
        >
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex-center flex-shrink-0">
            {isExporting === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin text-destructive" />
            ) : lastExport === 'pdf' ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <FileImage className="w-4 h-4 text-destructive" />
            )}
          </div>
          <div>
            <div className="font-medium">PDF Document</div>
            <div className="text-xs text-muted-foreground">Download as PDF</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport('pbit')}
          className="gap-3 cursor-pointer"
          disabled={isExporting === 'pbit'}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex-center flex-shrink-0">
            {isExporting === 'pbit' ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : lastExport === 'pbit' ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Download className="w-4 h-4 text-primary" />
            )}
          </div>
          <div>
            <div className="font-medium">Power BI Template</div>
            <div className="text-xs text-muted-foreground">.pbit.json for Power BI</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport('txt')}
          className="gap-3 cursor-pointer"
          disabled={isExporting === 'txt'}
        >
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex-center flex-shrink-0">
            {isExporting === 'txt' ? (
              <Loader2 className="w-4 h-4 animate-spin text-warning" />
            ) : lastExport === 'txt' ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <FileText className="w-4 h-4 text-warning" />
            )}
          </div>
          <div>
            <div className="font-medium">Setup Instructions</div>
            <div className="text-xs text-muted-foreground">Step-by-step guide</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleExport('json')}
          className="gap-3 cursor-pointer"
          disabled={isExporting === 'json'}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex-center flex-shrink-0">
            {isExporting === 'json' ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            ) : lastExport === 'json' ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <FileJson className="w-4 h-4 text-blue-500" />
            )}
          </div>
          <div>
            <div className="font-medium">JSON Spec</div>
            <div className="text-xs text-muted-foreground">Dashboard configuration</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          className="gap-3 cursor-pointer"
          disabled={isExporting === 'csv'}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex-center flex-shrink-0">
            {isExporting === 'csv' ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            ) : lastExport === 'csv' ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <div>
            <div className="font-medium">CSV Data</div>
            <div className="text-xs text-muted-foreground">Raw dataset export</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
