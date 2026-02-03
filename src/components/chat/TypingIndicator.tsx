import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-2"
    >
      <div className="flex gap-1">
        <motion.span
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: 0,
          }}
        />
        <motion.span
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: 0.15,
          }}
        />
        <motion.span
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: 0.3,
          }}
        />
      </div>
      <span className="text-sm text-muted-foreground">AI is thinking...</span>
    </motion.div>
  );
}

