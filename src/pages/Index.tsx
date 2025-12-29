import { useCallback } from 'react';
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
import { generateDashboardSpec } from '@/lib/mockAi';
import { demoDatasets } from '@/data/sampleData';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    reset,
  } = useAppStore();

  const handleTryDemo = useCallback(() => {
    const salesDemo = demoDatasets[0];
    setFileData(`${salesDemo.name.toLowerCase().replace(' ', '_')}.csv`, salesDemo.data, salesDemo.schema);
    setPrompt('Show total sales by region with a bar chart, top products by revenue, and monthly sales trends');
    toast({
      title: 'Sample data loaded!',
      description: 'Click Generate to create your dashboard.',
    });
  }, [setFileData, setPrompt]);

  const generateDashboard = useCallback(async () => {
    if (!rawData.length || !prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate dashboard spec using smart mock AI
      const spec = generateDashboardSpec(schema, prompt);
      
      setDashboardSpec(spec);
      toast({
        title: 'Dashboard generated!',
        description: `Created ${spec.visuals.length} visualizations based on your prompt.`,
      });
    } catch (err) {
      setError('Failed to generate dashboard. Please try again.');
      toast({
        title: 'Generation failed',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [rawData, prompt, schema, setIsGenerating, setError, setDashboardSpec]);

  const hasData = rawData.length > 0;
  const hasDashboard = dashboardSpec !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 gradient-glow pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <HeroSection onTryDemo={handleTryDemo} />

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-destructive">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Data Input</h2>
                {hasData && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>

              <FileUploader />
              <DemoDataLoader />
              <DataPreview />
            </div>

            <div className="glass-panel p-6">
              <h2 className="text-xl font-semibold mb-4">Describe Your Dashboard</h2>
              <PromptForm onGenerate={generateDashboard} />
            </div>
          </motion.div>

          {/* Right Panel - Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="glass-panel p-6 min-h-[400px]">
              <h2 className="text-xl font-semibold mb-4">Dashboard Preview</h2>

              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <GeneratingLoader key="loader" />
                ) : hasDashboard ? (
                  <DashboardPreview key="preview" />
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <svg
                        className="w-10 h-10 text-primary/60"
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
                    <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      {hasData 
                        ? 'Describe your dashboard and click Generate to see your visualizations'
                        : 'Upload data or click "Use Sample Data" to get started'
                      }
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {hasDashboard && <SpecViewer />}
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Built for Microsoft Hackathon • Powered by AI</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
