import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { demoDatasets, DemoDataset } from '@/data/sampleData';
import { cn } from '@/lib/utils';
import { Database, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DemoDataLoaderProps {
  className?: string;
}

export const DemoDataLoader = ({ className }: DemoDataLoaderProps) => {
  const { setFileData, setPrompt, fileName, rawData } = useAppStore();

  const loadDemo = (dataset: DemoDataset) => {
    const file = `${dataset.name.toLowerCase().replace(' ', '_')}.csv`;
    setFileData(file, dataset.data, dataset.schema);
    if (dataset.suggestedPrompts.length > 0) {
      setPrompt(dataset.suggestedPrompts[0]);
    }
    toast({
      title: `${dataset.name} loaded!`,
      description: `${dataset.data.length} rows with ${dataset.schema.length} columns ready.`,
    });
  };

  const isLoaded = (name: string) => {
    return fileName?.includes(name.toLowerCase().replace(' ', '_'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-3 demo-data-loader', className)}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Database className="w-4 h-4" />
        <span>Or try with sample data:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {demoDatasets.map((dataset) => {
          const loaded = isLoaded(dataset.name);
          return (
            <Button
              key={dataset.name}
              variant={loaded ? "default" : "outline"}
              size="sm"
              onClick={() => loadDemo(dataset)}
              className={cn(
                'transition-all',
                loaded 
                  ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30' 
                  : 'border-border hover:border-primary hover:bg-primary/5'
              )}
            >
              {loaded && <Check className="w-3 h-3 mr-1" />}
              <span className="mr-2">{dataset.icon}</span>
              {dataset.name}
            </Button>
          );
        })}
      </div>
    </motion.div>
  );
};
