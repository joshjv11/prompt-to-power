import { motion } from 'framer-motion';
import { Brain, BarChart3, CheckCircle2, Loader2, Sparkles, Zap, Clock, PieChart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

interface GeneratingLoaderProps {
  step?: string;
  error?: string | null;
}

export const GeneratingLoader = ({ step, error }: GeneratingLoaderProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);

  const estimatedTime = 25; // seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Smooth progress that slows down as it approaches 100%
    const targetProgress = Math.min(95, (elapsedTime / estimatedTime) * 100);
    setProgress(targetProgress);
  }, [elapsedTime]);

  const getStepIndex = () => {
    if (!step) return 0;
    if (step.includes('ready') || step.includes('Dashboard')) return 3;
    if (step.includes('fallback')) return 2;
    if (step.includes('Analyzing') || step.includes('Generating')) return 1;
    if (step.includes('Retry')) return 1;
    return 0;
  };

  const currentStep = getStepIndex();
  const remainingTime = Math.max(0, estimatedTime - elapsedTime);

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
      className="flex flex-col items-center justify-center py-8 px-4"
    >
      {/* Main spinner with pulsing effect */}
      <div className="relative mb-6">
        {/* Outer glow ring */}
        <motion.div 
          className="absolute inset-0 w-20 h-20 rounded-full bg-primary/20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Spinning outer ring */}
        <div className="w-20 h-20 rounded-full border-4 border-muted" />
        <motion.div 
          className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner spinning ring */}
        <motion.div 
          className="absolute inset-2 w-16 h-16 rounded-full border-4 border-transparent border-t-primary/50"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Zap className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      </div>

      {/* Current status message */}
      <motion.p 
        key={step}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold text-foreground mb-1 text-center"
      >
        {step || 'Generating your dashboard...'}
      </motion.p>
      
      <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
        {steps[Math.min(currentStep, steps.length - 1)]?.description}
      </p>

      {/* Progress bar with time estimate */}
      <div className="w-full max-w-md mb-6 space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {elapsedTime}s elapsed
          </span>
          <span>
            {remainingTime > 0 ? `~${remainingTime}s remaining` : 'Almost done...'}
          </span>
        </div>
      </div>

      {/* Skeleton chart previews */}
      <div className="grid grid-cols-3 gap-3 mb-6 w-full max-w-md">
        {[BarChart3, PieChart, TrendingUp].map((Icon, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15 }}
            className="relative bg-muted/30 rounded-lg p-4 border border-border/50 overflow-hidden"
          >
            <div className="flex flex-col items-center gap-2">
              <Icon className="w-6 h-6 text-muted-foreground/50" />
              <div className="space-y-1.5 w-full">
                <motion.div 
                  className="h-2 bg-muted-foreground/20 rounded-full"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
                <motion.div 
                  className="h-2 bg-muted-foreground/15 rounded-full w-3/4"
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                />
              </div>
            </div>
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </div>

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
