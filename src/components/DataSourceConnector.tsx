import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileSpreadsheet, Database, Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataSourceConnectorProps {
  className?: string;
}

export function DataSourceConnector({ className }: DataSourceConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const dataSources = [
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      icon: FileSpreadsheet,
      description: 'Connect to Google Sheets and import data directly',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      id: 'airtable',
      name: 'Airtable',
      icon: Database,
      description: 'Import data from Airtable bases',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      id: 'api',
      name: 'API Endpoint',
      icon: Globe,
      description: 'Fetch data from a REST API endpoint',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
  ];

  const handleConnect = async (sourceId: string) => {
    setIsConnecting(true);
    setSelectedSource(sourceId);

    try {
      // TODO: Implement OAuth flow for Google Sheets
      // TODO: Implement Airtable API connection
      // TODO: Implement API endpoint connection
      
      // Placeholder for now
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // This would trigger the actual connection flow
      console.log(`Connecting to ${sourceId}...`);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <Globe className="w-4 h-4" />
          Connect Data Source
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect Data Source</DialogTitle>
          <DialogDescription>
            Import data from external sources to create your dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {dataSources.map((source) => {
            const Icon = source.icon;
            return (
              <motion.button
                key={source.id}
                onClick={() => handleConnect(source.id)}
                disabled={isConnecting}
                className={cn(
                  'w-full p-4 rounded-lg border-2 border-border',
                  'hover:border-primary transition-colors',
                  'text-left flex items-start gap-4',
                  source.bgColor,
                  isConnecting && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={cn('p-2 rounded-lg bg-background', source.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{source.name}</h3>
                  <p className="text-sm text-muted-foreground">{source.description}</p>
                </div>
                {isConnecting && selectedSource === source.id && (
                  <Loader2 className="w-5 h-5 animate-spin" />
                )}
              </motion.button>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Data source integrations are coming soon. For now, please upload CSV or Excel files.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

