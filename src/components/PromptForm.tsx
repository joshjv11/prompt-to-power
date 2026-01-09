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
  const hasData = rawData.length > 0;

  // Quick prompt suggestions
  const suggestions = [
    'Sales by region',
    'Monthly trends',
    'Top products',
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-3 prompt-form', className)}
    >
      <Textarea
        placeholder={hasData 
          ? "e.g., Show sales by region with a bar chart and monthly trends..."
          : "Upload data first to describe your dashboard"
        }
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className={cn(
          'min-h-[100px] resize-none text-sm',
          'bg-muted/30 border-border focus:border-primary',
          'placeholder:text-muted-foreground/50',
          !hasData && 'opacity-50 cursor-not-allowed'
        )}
        disabled={!hasData}
      />

      {/* Quick suggestions */}
      {hasData && !prompt && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPrompt(s)}
              className="text-xs px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <Button
        type="submit"
        disabled={isDisabled}
        className={cn(
          'w-full h-11 font-medium generate-button',
          'bg-gradient-primary hover:opacity-90',
          'shadow-glow transition-all duration-300',
          'disabled:opacity-50 disabled:shadow-none'
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate
          </>
        )}
      </Button>
    </form>
  );
};
