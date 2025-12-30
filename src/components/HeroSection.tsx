import { motion } from 'framer-motion';
import { Zap, Database, BarChart3, FileJson } from 'lucide-react';

interface HeroSectionProps {
  onTryDemo: () => void;
  compact?: boolean;
}

export const HeroSection = ({ onTryDemo, compact }: HeroSectionProps) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">
          <span className="text-gradient">PromptBI</span>
        </h1>
        <button
          onClick={onTryDemo}
          className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
        >
          Try Demo
        </button>
      </div>
    );
  }
  const features = [
    { icon: Database, label: 'Upload Data' },
    { icon: Zap, label: 'AI Analysis' },
    { icon: BarChart3, label: 'Visualizations' },
    { icon: FileJson, label: 'Power BI Spec' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 relative"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 gradient-glow pointer-events-none" />

      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
          <span className="text-gradient">PromptBI</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Transform natural language into Power BI dashboards with AI
        </p>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap justify-center gap-3 mb-8"
      >
        {features.map((feature, idx) => (
          <div
            key={feature.label}
            className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-border/50 rounded-full"
          >
            <feature.icon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{feature.label}</span>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={onTryDemo}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary rounded-xl font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition-opacity"
      >
        <Zap className="w-5 h-5" />
        Try Demo
      </motion.button>
    </motion.div>
  );
};
