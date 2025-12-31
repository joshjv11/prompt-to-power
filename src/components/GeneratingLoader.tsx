import { motion } from 'framer-motion';
import { Brain, BarChart3, CheckCircle2, Loader2, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeneratingLoaderProps {
  step?: string;
  error?: string | null;
}

export const GeneratingLoader = ({ step, error }: GeneratingLoaderProps) => {
  const getStepIndex = () => {
    if (!step) return 0;
    if (step.includes('ready') || step.includes('Dashboard')) return 3;
    if (step.includes('fallback')) return 2;
    if (step.includes('Analyzing') || step.includes('Generating')) return 1;
    if (step.includes('Retry')) return 1;
    return 0;
  };

  const currentStep = getStepIndex();

  const steps = [
    { 
      label: 'Connecting to AI', 
      icon: Brain, 
      description: 'Establishing connection to Gemini AI...',
    },
    { 
      label: 'Analyzing Schema', 
      icon: BarChart3, 
      description: 'Understanding your data structure...',
    },
    { 
      label: 'Generating Visuals', 
      icon: Sparkles, 
      description: 'Creating optimized visualizations...',
    },
    { 
      label: 'Finalizing', 
      icon: CheckCircle2, 
      description: 'Preparing your dashboard...',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      {/* Main spinner with pulsing effect */}
      <div className="relative mb-8">
        {/* Outer glow ring */}
        <motion.div 
          className="absolute inset-0 w-24 h-24 rounded-full bg-primary/20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Spinning outer ring */}
        <div className="w-24 h-24 rounded-full border-4 border-muted" />
        <motion.div 
          className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner spinning ring */}
        <motion.div 
          className="absolute inset-2 w-20 h-20 rounded-full border-4 border-transparent border-t-primary/50"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Zap className="w-10 h-10 text-primary" />
          </motion.div>
        </div>
      </div>

      {/* Current status message */}
      <motion.p 
        key={step}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold text-foreground mb-2 text-center"
      >
        {step || 'Generating your dashboard...'}
      </motion.p>
      
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-sm">
        {steps[Math.min(currentStep, steps.length - 1)]?.description}
      </p>

      {/* Progress steps timeline */}
      <div className="flex items-center gap-1 sm:gap-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isComplete = i < currentStep;
          const isCurrent = i === currentStep;
          
          return (
            <div key={i} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                  isComplete && "bg-success/20 text-success",
                  isCurrent && "bg-primary/20 text-primary ring-2 ring-primary/30",
                  !isComplete && !isCurrent && "bg-muted/50 text-muted-foreground"
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5 opacity-50" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </motion.div>
              
              {i < steps.length - 1 && (
                <div className={cn(
                  "w-4 sm:w-8 h-0.5 mx-1 transition-colors duration-300",
                  i < currentStep ? "bg-success" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Retry indicator */}
      {step?.includes('Retry') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 px-4 py-2 bg-warning/10 border border-warning/20 rounded-lg text-warning text-sm"
        >
          Taking longer than expected. Retrying...
        </motion.div>
      )}
    </motion.div>
  );
};