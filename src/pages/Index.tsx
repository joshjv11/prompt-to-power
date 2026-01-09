import { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
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
import { ExamplesGallery } from '@/components/ExamplesGallery';
import { ShareDialog } from '@/components/ShareDialog';
import { EnhancedExportButton } from '@/components/EnhancedExportButton';
import { OnboardingTour } from '@/components/OnboardingTour';
import { generateDashboardWithAI } from '@/lib/aiService';
import { track } from '@/lib/analytics';
import { demoDatasets } from '@/data/sampleData';
import { toast } from '@/hooks/use-toast';
import { 
  AlertCircle, RotateCcw, Sparkles, MessageSquare, 
  ChevronLeft, ChevronRight, Upload, Wand2, X,
  Zap, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Index = () => {
  const {
    rawData,
    schema,
    prompt,
    dashboardSpec,
    isGenerating,
    error,
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

  const [aiSource, setAiSource] = useState<'ai' | 'fallback' | 'robust' | null>(null);
  const [progressStep, setProgressStep] = useState<string>('');
  const [showChat, setShowChat] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleTryDemo = useCallback(() => {
    const salesDemo = demoDatasets[0];
    setFileData(`${salesDemo.name.toLowerCase().replace(' ', '_')}.csv`, salesDemo.data, salesDemo.schema);
    setPrompt('Show total sales by region with a bar chart, top products by revenue, and monthly sales trends');
    toast({
      title: 'Demo data loaded!',
      description: 'Click Generate to create your dashboard.',
    });
  }, [setFileData, setPrompt]);

  const generateDashboard = useCallback(async () => {
    if (!rawData.length || !prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setAiSource(null);
    setProgressStep('Connecting to AI...');
    setInsights([]);
    
    track.promptSubmitted(prompt.length, schema.length);
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
      track.dashboardGenerated(result.spec.visuals.length, result.source);
      
      addChatMessage({ 
        role: 'assistant', 
        content: `Generated "${result.spec.title}" with ${result.spec.visuals.length} visualizations` 
      });

      toast({
        title: '✨ Dashboard created!',
        description: `${result.spec.visuals.length} charts ready to explore.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate dashboard';
      track.generationFailed(message);
      const { getErrorInfo } = await import('@/lib/errorMessages');
      const errorInfo = getErrorInfo(message);
      setError(errorInfo.message);
      toast({
        title: 'Generation failed',
        description: errorInfo.suggestion || message,
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
    setShowChat(false);
  }, [reset, clearChatHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault();
        if (rawData.length && prompt.trim() && !isGenerating) {
          generateDashboard();
        }
      }
      if (e.key === 'Escape') {
        setShowChat(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rawData.length, prompt, isGenerating, generateDashboard]);

  const hasData = rawData.length > 0;
  const hasDashboard = dashboardSpec !== null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingTour />
      
      {/* Subtle background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-[1800px] mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gradient">PromptBI</h1>
            {hasData && (
              <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                Data loaded
              </Badge>
            )}
          </div>

          {/* Center - Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            {!hasData && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTryDemo}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Zap className="w-4 h-4" />
                Try Demo
              </Button>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {hasData && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 text-muted-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
            
            <SavedDashboardsDrawer />
            
            {hasDashboard && (
              <>
                <ShareDialog />
                <EnhancedExportButton />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChat(true)}
                  className="gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Refine</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        <div className="max-w-[1800px] mx-auto px-4 py-6">
          
          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={generateDashboard} className="text-destructive border-destructive/30">
                    Retry
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setError(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Two-Column Layout */}
          <div className="flex gap-6">
            
            {/* Left Sidebar - Data & Prompt */}
            <motion.aside
              initial={false}
              animate={{ width: sidebarCollapsed ? 48 : 360 }}
              className="flex-shrink-0 hidden lg:block"
            >
              <div className="sticky top-20">
                {sidebarCollapsed ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSidebarCollapsed(false)}
                    className="w-12 h-12"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {/* Collapse button */}
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarCollapsed(true)}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Step 1: Data */}
                    <div className="glass-panel p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          1
                        </div>
                        <h2 className="font-semibold text-sm">Upload Data</h2>
                      </div>
                      <FileUploader />
                      <DemoDataLoader />
                      {hasData && <DataPreview />}
                    </div>

                    {/* Step 2: Prompt */}
                    <div className="glass-panel p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          hasData ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          2
                        </div>
                        <h2 className={cn("font-semibold text-sm", !hasData && "text-muted-foreground")}>
                          Describe Dashboard
                        </h2>
                      </div>
                      <PromptForm onGenerate={generateDashboard} />
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 space-y-6">
              
              {/* Mobile: Data Input (shown only when no data) */}
              {!hasData && (
                <div className="lg:hidden glass-panel p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Get Started</h2>
                    <Button variant="ghost" size="sm" onClick={handleTryDemo} className="gap-1.5">
                      <Zap className="w-4 h-4" />
                      Demo
                    </Button>
                  </div>
                  <FileUploader />
                  <DemoDataLoader />
                </div>
              )}

              {/* Mobile: Prompt (shown when data loaded) */}
              {hasData && !hasDashboard && (
                <div className="lg:hidden glass-panel p-4 space-y-3">
                  <DataPreview />
                  <PromptForm onGenerate={generateDashboard} />
                </div>
              )}

              {/* Dashboard Preview Area */}
              <div className="glass-panel p-6 min-h-[500px] dashboard-preview-area">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <GeneratingLoader key="loader" step={progressStep} />
                  ) : hasDashboard ? (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold">{dashboardSpec.title}</h2>
                          <p className="text-sm text-muted-foreground">
                            {dashboardSpec.visuals.length} visualizations
                          </p>
                        </div>
                        {aiSource && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-xs',
                              aiSource === 'ai' 
                                ? 'bg-success/10 text-success border-success/20' 
                                : 'bg-warning/10 text-warning border-warning/20'
                            )}
                          >
                            {aiSource === 'ai' ? '✨ AI Generated' : 'Smart Analysis'}
                          </Badge>
                        )}
                      </div>
                      <DashboardPreview />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                        {hasData ? (
                          <Wand2 className="w-10 h-10 text-primary" />
                        ) : (
                          <Upload className="w-10 h-10 text-primary/60" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {hasData ? 'Ready to Generate' : 'Upload Your Data'}
                      </h3>
                      <p className="text-muted-foreground max-w-md mb-6">
                        {hasData 
                          ? 'Describe your dashboard in the prompt and click Generate'
                          : 'Start by uploading a CSV file or try the demo data'
                        }
                      </p>
                      {!hasData && (
                        <Button onClick={handleTryDemo} className="gap-2">
                          <Zap className="w-4 h-4" />
                          Try Demo Data
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground mt-4">
                        Tip: Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘G</kbd> to generate
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Examples Gallery - Show when no data */}
              {!hasData && (
                <ExamplesGallery onLoadExample={() => {
                  track.exampleLoaded('gallery');
                }} />
              )}

              {/* Insights & Spec - Show after dashboard */}
              {hasDashboard && (
                <>
                  <InsightsPanel />
                  <SpecViewer />
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Chat Slide-over */}
      <AnimatePresence>
        {showChat && hasDashboard && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h2 className="font-semibold">Refine Dashboard</h2>
                  <p className="text-xs text-muted-foreground">Chat to make changes</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowChat(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <RefinementChat />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile FAB for Chat */}
      {hasDashboard && !showChat && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-30 lg:hidden"
        >
          <Button
            size="lg"
            onClick={() => setShowChat(true)}
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/50">
        <p>PromptBI • AI-Powered Dashboard Generator</p>
      </footer>
    </div>
  );
};

export default Index;
