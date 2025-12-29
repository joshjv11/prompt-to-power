import { motion } from 'framer-motion';
import { Loader2, Brain, BarChart3, CheckCircle2 } from 'lucide-react';

interface GeneratingLoaderProps {
  step?: string;
}

export const GeneratingLoader = ({ step }: GeneratingLoaderProps) => {
  const steps = [
    { label: 'Connecting to AI...', icon: Brain, done: step?.includes('Analyzing') || step?.includes('ready') || step?.includes('Retrying') || step?.includes('fallback') },
    { label: 'Analyzing data schema...', icon: BarChart3, done: step?.includes('ready') || step?.includes('fallback') },
    { label: 'Generating visuals...', icon: CheckCircle2, done: step?.includes('ready') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-2 w-16 h-16 rounded-full border-4 border-transparent border-t-primary/50 animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>

      <p className="text-lg font-medium text-foreground mb-2">
        {step || 'Generating your dashboard...'}
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        AI is analyzing your data and creating visualizations
      </p>

      {/* Progress steps */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-1">
            {s.done ? (
              <CheckCircle2 className="w-3 h-3 text-success" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-muted-foreground/50" />
            )}
            <span className={s.done ? 'text-success' : ''}>{s.label.replace('...', '')}</span>
            {i < steps.length - 1 && <span className="mx-1">→</span>}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
