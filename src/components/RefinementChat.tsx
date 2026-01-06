import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Loader2, Sparkles, User, Bot, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore, ChatMessage } from '@/store/appStore';
import { refineDashboard } from '@/lib/conversational';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  generateContextualSuggestions, 
  getSuggestionColor, 
  ChatSuggestion 
} from '@/lib/chatSuggestions';

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
  const [suggestionSeed, setSuggestionSeed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track used suggestions to avoid repeats
  const [usedSuggestions, setUsedSuggestions] = useState<string[]>([]);

  // Generate contextual suggestions based on dashboard state
  const suggestions = useMemo(() => {
    if (!dashboardSpec) return [];
    return generateContextualSuggestions(dashboardSpec, schema, usedSuggestions);
  }, [dashboardSpec, schema, usedSuggestions, suggestionSeed]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSelectSuggestion = (suggestion: ChatSuggestion) => {
    setInput(suggestion.text);
    setUsedSuggestions(prev => [...prev, suggestion.text]);
    textareaRef.current?.focus();
  };

  const refreshSuggestions = () => {
    setSuggestionSeed(s => s + 1);
  };

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
      
      // Refresh suggestions after refinement
      setSuggestionSeed(s => s + 1);
      
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
      <div className="flex-col-center h-full text-center p-6">
        <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-4 flex-shrink-0" />
        <h3 className="font-medium text-muted-foreground mb-2">Chat Refinement</h3>
        <p className="text-sm text-muted-foreground/70">
          Generate a dashboard first, then refine it with natural language
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-start gap-2 p-4 border-b border-border/50 flex-shrink-0">
        <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
        <h3 className="font-semibold text-sm">Refine Dashboard</h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <AnimatePresence mode="popLayout">
          {chatHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4"
            >
              <div className="flex-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Suggestions</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshSuggestions}
                  className="h-7 w-7 p-0"
                  title="Refresh suggestions"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1.5">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <motion.button
                    key={suggestion.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={cn(
                      'block w-full text-left text-xs px-3 py-2 rounded-lg transition-colors',
                      getSuggestionColor(suggestion.category)
                    )}
                  >
                    {suggestion.text}
                  </motion.button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-4 text-center">
                Or type your own refinement below
              </p>
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
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-3 py-2 text-sm flex flex-col',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/70'
                    )}
                  >
                    <p className="break-words">{msg.content}</p>
                    <span className="text-[10px] opacity-60 mt-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-secondary flex-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isRefining && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-start gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted/70 rounded-xl px-3 py-2 flex-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Quick suggestions - show when chat has history */}
      {chatHistory.length > 0 && suggestions.length > 0 && !isRefining && (
        <div className="px-4 py-2 border-t border-border/30 flex-shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
            <Lightbulb className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            {suggestions.slice(0, 3).map((suggestion) => (
              <button
                key={suggestion.text}
                onClick={() => handleSelectSuggestion(suggestion)}
                className={cn(
                  'text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-colors flex-shrink-0',
                  getSuggestionColor(suggestion.category)
                )}
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-border/50 flex-shrink-0">
        <div className="relative flex items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a refinement..."
            className="min-h-[60px] max-h-[120px] pr-12 resize-none text-sm flex-grow"
            disabled={isRefining}
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8 flex-shrink-0"
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
