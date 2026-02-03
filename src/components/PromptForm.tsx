import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/appStore';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptFormProps {
  onGenerate: () => void;
  className?: string;
}

export const PromptForm = ({ onGenerate, className }: PromptFormProps) => {
  const { prompt, setPrompt, isGenerating, rawData } = useAppStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && rawData.length > 0) {
      onGenerate();
    }
  };

  const isDisabled = !prompt.trim() || rawData.length === 0 || isGenerating;

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      onSubmit={handleSubmit}
      className={cn('space-y-4', className)}
    >
      <div className="space-y-2">
        <label htmlFor="prompt" className="text-sm font-medium text-foreground">
          Describe your dashboard
        </label>
        <Textarea
          id="prompt"
          data-tour="prompt"
          aria-label="Dashboard description input"
          aria-describedby="prompt-description"
          placeholder="e.g., Show me sales trends by region with a bar chart, include top products and monthly comparisons..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={cn(
            'min-h-[120px] resize-none',
            'bg-muted/30 border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
            'placeholder:text-muted-foreground/60',
            'transition-all duration-200 ease-out'
          )}
          disabled={rawData.length === 0}
        />
        <p id="prompt-description" className="sr-only">
          Enter a natural language description of the dashboard you want to create
        </p>
      </div>

      <Button
        type="submit"
        disabled={isDisabled}
        className={cn(
          'w-full h-12 font-semibold text-base',
          'bg-gradient-primary hover:opacity-90 hover:scale-[1.02]',
          'shadow-glow transition-all duration-200 ease-out',
          'disabled:opacity-50 disabled:shadow-none disabled:scale-100',
          'active:scale-[0.98]',
          'flex items-center justify-center'
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin flex-shrink-0" />
            Generating Dashboard...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2 flex-shrink-0" />
            Generate Dashboard
          </>
        )}
      </Button>

      {rawData.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Upload a file or load demo data to get started
        </p>
      )}
    </motion.form>
  );
};
