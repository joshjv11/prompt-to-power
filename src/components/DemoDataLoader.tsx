import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { demoDatasets, DemoDataset } from '@/data/sampleData';
import { cn } from '@/lib/utils';

interface DemoDataLoaderProps {
  className?: string;
}

export const DemoDataLoader = ({ className }: DemoDataLoaderProps) => {
  const { setFileData, setPrompt } = useAppStore();

  const loadDemo = (dataset: DemoDataset) => {
    setFileData(`${dataset.name.toLowerCase().replace(' ', '_')}.csv`, dataset.data, dataset.schema);
    if (dataset.suggestedPrompts.length > 0) {
      setPrompt(dataset.suggestedPrompts[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-3', className)}
    >
      <p className="text-sm text-muted-foreground">Or try with sample data:</p>
      <div className="flex flex-wrap gap-2">
        {demoDatasets.map((dataset) => (
          <Button
            key={dataset.name}
            variant="outline"
            size="sm"
            onClick={() => loadDemo(dataset)}
            className="border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <span className="mr-2">{dataset.icon}</span>
            {dataset.name}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};
