import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { MarkdownMessage } from './MarkdownMessage';
import { MessageActions } from './MessageActions';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onDelete?: () => void;
}

export function MessageBubble({ 
  role, 
  content, 
  timestamp, 
  onCopy,
  onRegenerate,
  onDelete 
}: MessageBubbleProps) {
  const isUser = role === 'user';
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-3 group',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/20 flex-center flex-shrink-0">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      
      <div
        className={cn(
          'max-w-[85%] rounded-xl px-4 py-3 flex flex-col relative',
          isUser
            ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
            : 'bg-muted/70 border border-border/50'
        )}
      >
        {isUser ? (
          <p className="break-words text-sm">{content}</p>
        ) : (
          <MarkdownMessage content={content} />
        )}
        
        <div className="flex items-center justify-between mt-2">
          <span className={cn(
            'text-[10px] opacity-60',
            isUser ? 'text-primary-foreground/60' : 'text-muted-foreground'
          )}>
            {formatTime(timestamp)}
          </span>
          
          {!isUser && (
            <MessageActions
              message={content}
              onCopy={onCopy}
              onRegenerate={onRegenerate}
              onDelete={onDelete}
            />
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-secondary flex-center flex-shrink-0">
          <User className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  );
}

