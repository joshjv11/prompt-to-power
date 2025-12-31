import { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { HeroSection } from '@/components/HeroSection';
import { FileUploader } from '@/components/FileUploader';
import { DataPreview } from '@/components/DataPreview';
import { DemoDataLoader } from '@/components/DemoDataLoader';
import { PromptForm } from '@/components/PromptForm';
import { DashboardPreview } from '@/components/DashboardPreview';
import { SpecViewer } from '@/components/SpecViewer';
import { GeneratingLoader } from '@/components/GeneratingLoader';
import { RefinementChat } from '@/components/RefinementChat';
import { InsightsPanel } from '@/components/InsightsPanel';
import { SavedDashboardsDrawer } from '@/components/SavedDashboardsDrawer';
import { generateDashboardWithAI } from '@/lib/aiService';
import { useUrlParams } from '@/hooks/useUrlParams';
import { demoDatasets } from '@/data/sampleData';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, RotateCcw, Sparkles, Cpu, Share2, Copy, Check, MessageSquare, PanelRightClose, PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Index = () => {
  const {
    rawData,
    schema,
    prompt,
    fileName,
    dashboardSpec,
    isGenerating,
    error,
    chatHistory,
    setFileData,
    setPrompt,
    setDashboardSpec,
    setIsGenerating,
    setError,
    addChatMessage,
    clearChatHistory,
    setInsights,
    reset,
  } = useAppStore();

  const { generateShareUrl } = useUrlParams();
  const [aiSource, setAiSource] = useState<'ai' | 'fallback' | null>(null);
  const [progressStep, setProgressStep] = useState<string>('');
  const [showChat, setShowChat] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleTryDemo = useCallback(() => {
    const salesDemo = demoDatasets[0];
    setFileData(`${salesDemo.name.toLowerCase().replace(' ', '_')}.csv`, salesDemo.data, salesDemo.schema);
    setPrompt('Show total sales by region with a bar chart, top products by revenue, and monthly sales trends');
    toast({
      title: 'Sample data loaded!',
      description: 'Click Generate to create your AI-powered dashboard.',
    });
  }, [setFileData, setPrompt]);

  const generateDashboard = useCallback(async () => {
    if (!rawData.length || !prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setAiSource(null);
    setProgressStep('Connecting to AI...');
    setInsights([]);
    
    // Add user prompt to chat history
    addChatMessage({ role: 'user', content: prompt });

    try {
      const result = await generateDashboardWithAI(
        schema,
        rawData,
        prompt,
        (step) => setProgressStep(step)
      );

      setDashboardSpec(result.spec);
      setAiSource(result.source);
      
      // Add AI response to chat
      addChatMessage({ 
        role: 'assistant', 
        content: `Generated "${result.spec.title}" with ${result.spec.visuals.length} visualizations` 
      });

      toast({
        title: result.source === 'ai' ? 'AI Dashboard generated!' : 'Dashboard generated!',
        description: `Created ${result.spec.visuals.length} visualizations${result.source === 'ai' ? ' using Gemini AI' : ''}.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate dashboard';
      setError(message);
      toast({
        title: 'Generation failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setProgressStep('');
    }
  }, [rawData, prompt, schema, setIsGenerating, setError, setDashboardSpec, addChatMessage, setInsights]);

  const handleReset = useCallback(() => {
    reset();
    clearChatHistory();
    setAiSource(null);
  }, [reset, clearChatHistory]);

  const handleShare = useCallback(async () => {
    const datasetName = fileName?.replace('.csv', '').replace('_', ' ') || 'sales';
    const url = generateShareUrl(datasetName, prompt);
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: 'Link copied!', description: 'Share this URL to load the same dataset and prompt.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  }, [fileName, prompt, generateShareUrl]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault();
        if (rawData.length && prompt.trim() && !isGenerating) {
          generateDashboard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rawData.length, prompt, isGenerating, generateDashboard]);

  const hasData = rawData.length > 0;
  const hasDashboard = dashboardSpec !== null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 gradient-glow pointer-events-none" />

      <div className="relative z-10 max-w-[1800px] mx-auto px-4 py-6 flex flex-col flex-grow w-full">
        {/* Header with save/share */}
        <div className="flex-between mb-6 flex-shrink-0">
          <HeroSection onTryDemo={handleTryDemo} compact />
          
          <div className="flex items-center gap-2">
            <SavedDashboardsDrawer />
            
            {hasDashboard && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline">Share</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="gap-2 lg:hidden"
            >
              {showChat ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Error Alert - Enhanced */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-destructive mb-1">Generation Failed</h4>
                  <p className="text-sm text-destructive/80 mb-3">{error}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={generateDashboard}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Try Again
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setError(null)}
                      className="text-muted-foreground"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3-Column Layout - Flexbox */}
        <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
          {/* Left Panel - Data Input (30%) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col space-y-4 flex-shrink-0 lg:w-[350px]"
          >
            <div className="glass-panel p-4 space-y-4 flex flex-col">
              <div className="flex-between">
                <h2 className="text-lg font-semibold">Data Input</h2>
                {hasData && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-muted-foreground hover:text-foreground h-8"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                )}
              </div>

              <FileUploader />
              <DemoDataLoader />
              <DataPreview />
            </div>

            <div className="glass-panel p-4 flex flex-col">
              <div className="flex-between mb-3">
                <h2 className="text-lg font-semibold">Prompt</h2>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </div>
              <div className="flex-grow">
                <PromptForm onGenerate={generateDashboard} />
              </div>
            </div>
          </motion.div>

          {/* Middle Panel - Charts + Insights (50%) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-4 flex-grow min-w-0"
          >
            <div className="glass-panel p-4 min-h-[500px] flex flex-col">
              <div className="flex-between mb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold">Dashboard Preview</h2>
                {aiSource && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs flex items-center',
                      aiSource === 'ai' 
                        ? 'bg-success/10 text-success border-success/20' 
                        : 'bg-warning/10 text-warning border-warning/20'
                    )}
                  >
                    <Cpu className="w-3 h-3 mr-1" />
                    {aiSource === 'ai' ? 'Gemini AI' : 'Fallback'}
                  </Badge>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <GeneratingLoader key="loader" step={progressStep} />
                ) : hasDashboard ? (
                  <DashboardPreview key="preview" />
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-col-center py-20 text-center flex-grow"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-primary/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-medium mb-2">Ready to Generate</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      {hasData 
                        ? 'Describe your dashboard and click Generate'
                        : 'Upload data or use sample data to get started'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      Press ⌘G to generate
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Insights Panel */}
            <InsightsPanel />

            {/* Spec Viewer */}
            {hasDashboard && <SpecViewer />}
          </motion.div>

          {/* Right Panel - Chat (20%) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              'glass-panel h-[calc(100vh-140px)] sticky top-6 flex flex-col',
              'hidden lg:flex',
              'flex-shrink-0 lg:w-[300px]',
              showChat ? 'flex' : 'hidden'
            )}
          >
            <RefinementChat />
          </motion.div>
        </div>

        {/* Mobile Chat FAB */}
        {hasDashboard && (
          <div className="fixed bottom-6 right-6 lg:hidden">
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </div>
        )}

        {/* Mobile Chat Sheet */}
        <AnimatePresence>
          {showChat && hasDashboard && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
            >
              <div className="glass-panel h-[60vh] rounded-t-2xl border-t border-border/50 flex flex-col">
                <div className="flex-between p-3 border-b border-border/50 flex-shrink-0">
                  <span className="font-medium text-sm">Refine Dashboard</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChat(false)}
                  >
                    Close
                  </Button>
                </div>
                <div className="h-[calc(60vh-50px)] flex-grow min-h-0">
                  <RefinementChat />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-muted-foreground flex-shrink-0">
          <p>Built for Microsoft Hackathon • Powered by Gemini AI</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
