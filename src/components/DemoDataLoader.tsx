import { useAppStore } from '@/store/appStore';
import { demoDatasets, DemoDataset } from '@/data/sampleData';
import { cn } from '@/lib/utils';
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
    <div className={cn('demo-data-loader', className)}>
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs text-muted-foreground mr-1 self-center">Samples:</span>
        {demoDatasets.map((dataset) => {
          const loaded = isLoaded(dataset.name);
          return (
            <button
              key={dataset.name}
              onClick={() => loadDemo(dataset)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full transition-all',
                loaded 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="mr-1">{dataset.icon}</span>
              {dataset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
