import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { demoDatasets } from '@/data/sampleData';
import { toast } from '@/hooks/use-toast';

export function useUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setFileData, setPrompt, rawData } = useAppStore();

  // Load from URL params on mount
  useEffect(() => {
    const dataset = searchParams.get('dataset');
    const prompt = searchParams.get('prompt');

    if (dataset) {
      const datasetLower = dataset.toLowerCase();
      const matchedDataset = demoDatasets.find(
        (d) =>
          d.name.toLowerCase().includes(datasetLower) ||
          datasetLower.includes(d.name.toLowerCase().split(' ')[0])
      );

      if (matchedDataset) {
        setFileData(
          `${matchedDataset.name.toLowerCase().replace(' ', '_')}.csv`,
          matchedDataset.data,
          matchedDataset.schema
        );
        toast({
          title: `Loaded ${matchedDataset.name}`,
          description: 'Dataset loaded from URL',
        });
      }
    }

    if (prompt) {
      setPrompt(decodeURIComponent(prompt));
    }

    // Clear params after loading
    if (dataset || prompt) {
      setSearchParams({}, { replace: true });
    }
  }, []); // Only run on mount

  // Generate shareable URL
  const generateShareUrl = (datasetName?: string, promptText?: string) => {
    const params = new URLSearchParams();
    
    if (datasetName) {
      params.set('dataset', datasetName);
    }
    
    if (promptText) {
      params.set('prompt', encodeURIComponent(promptText));
    }

    const baseUrl = window.location.origin + window.location.pathname;
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  return { generateShareUrl };
}
