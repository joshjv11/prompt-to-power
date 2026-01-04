import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/appStore';
import { useUrlParams } from '@/hooks/useUrlParams';
import { 
  Share2, 
  Copy, 
  Check, 
  Link2, 
  Download,
  FileJson,
  FileSpreadsheet,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function ShareDialog() {
  const { dashboardSpec, rawData, fileName, schema } = useAppStore();
  const { generateShareUrl } = useUrlParams();
  const [copied, setCopied] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = dashboardSpec ? generateShareUrl(
    fileName?.replace('.csv', '').replace('_', ' ') || 'data',
    ''
  ) : '';

  const handleCopy = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({ title: 'Copied!', description: `${type} copied to clipboard` });
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  }, []);

  const handleDownloadJSON = useCallback(() => {
    if (!dashboardSpec) return;
    
    const exportData = {
      dashboard: dashboardSpec,
      schema,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dashboardSpec.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'Downloaded!', description: 'Dashboard spec saved as JSON' });
  }, [dashboardSpec, schema]);

  const handleDownloadCSV = useCallback(() => {
    if (!rawData.length) return;
    
    const headers = Object.keys(rawData[0]);
    const csvContent = [
      headers.join(','),
      ...rawData.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'dashboard-data.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'Downloaded!', description: 'Data exported as CSV' });
  }, [rawData, fileName]);

  if (!dashboardSpec) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Dashboard</DialogTitle>
          <DialogDescription>
            Share your dashboard or export the configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Share Link
            </label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-grow text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(shareUrl, 'Link')}
              >
                {copied === 'Link' ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can load the same dataset template
            </p>
          </div>

          {/* Export Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Options
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto py-3"
                onClick={handleDownloadJSON}
              >
                <FileJson className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <div className="text-sm font-medium">JSON Spec</div>
                  <div className="text-xs text-muted-foreground">Dashboard config</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto py-3"
                onClick={handleDownloadCSV}
              >
                <FileSpreadsheet className="w-4 h-4 text-success" />
                <div className="text-left">
                  <div className="text-sm font-medium">CSV Data</div>
                  <div className="text-xs text-muted-foreground">Raw dataset</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => window.open(shareUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
