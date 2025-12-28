import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const GeneratingLoader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-2 w-16 h-16 rounded-full border-4 border-transparent border-t-primary/50 animate-spin-slow" />
      </div>
      <p className="mt-6 text-lg font-medium text-foreground">Generating your dashboard...</p>
      <p className="mt-2 text-sm text-muted-foreground">AI is analyzing your data and creating visualizations</p>
    </motion.div>
  );
};
