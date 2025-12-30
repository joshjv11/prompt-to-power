import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Loader2, Sparkles, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore, ChatMessage } from '@/store/appStore';
import { refineDashboard } from '@/lib/conversational';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RefinementChatProps {
  onRefine?: () => void;
}

export function RefinementChat({ onRefine }: RefinementChatProps) {
  const {
    chatHistory,
    dashboardSpec,
    schema,
    rawData,
    addChatMessage,
    setDashboardSpec,
    setInsights,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleRefine = async () => {
    if (!input.trim() || !dashboardSpec || isRefining) return;

    const userMessage = input.trim();
    setInput('');
    
    addChatMessage({ role: 'user', content: userMessage });
    setIsRefining(true);

    try {
      const result = await refineDashboard(dashboardSpec, schema, rawData, userMessage, chatHistory);
      
      setDashboardSpec(result.spec);
      addChatMessage({ role: 'assistant', content: result.message });
      setInsights([]); // Clear insights to refresh
      
      toast({
        title: 'Dashboard updated!',
        description: result.message,
      });
      
      onRefine?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refine dashboard';
      addChatMessage({ role: 'assistant', content: `Sorry, I couldn't apply that change: ${message}` });
      toast({
        title: 'Refinement failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRefine();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!dashboardSpec) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-medium text-muted-foreground mb-2">Chat Refinement</h3>
        <p className="text-sm text-muted-foreground/70">
          Generate a dashboard first, then refine it with natural language
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-border/50">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Refine Dashboard</h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <AnimatePresence mode="popLayout">
          {chatHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Ask me to refine your dashboard:
              </p>
              <div className="space-y-2">
                {[
                  'Filter to last 6 months',
                  'Change bar chart to pie chart',
                  'Add a trend line',
                  'Show top 5 only',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {chatHistory.map((msg: ChatMessage) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-3 py-2 text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/70'
                    )}
                  >
                    <p className="break-words">{msg.content}</p>
                    <span className="text-[10px] opacity-60 mt-1 block">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isRefining && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted/70 rounded-xl px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>

      <div className="p-4 border-t border-border/50">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a refinement..."
            className="min-h-[60px] max-h-[120px] pr-12 resize-none text-sm"
            disabled={isRefining}
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8"
            onClick={handleRefine}
            disabled={!input.trim() || isRefining}
          >
            {isRefining ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
