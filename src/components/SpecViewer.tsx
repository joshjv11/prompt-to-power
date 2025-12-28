import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/appStore';
import { Copy, Check, FileJson, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface SpecViewerProps {
  className?: string;
}

export const SpecViewer = ({ className }: SpecViewerProps) => {
  const { dashboardSpec } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!dashboardSpec) return null;

  const specJson = JSON.stringify(dashboardSpec, null, 2);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(specJson);
    setCopied(true);
    toast({
      title: 'Copied to clipboard',
      description: 'Dashboard spec copied successfully',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const powerBISteps = [
    'Open Power BI Desktop and connect to your data source',
    'Create measures matching the spec metrics (e.g., SUM(Sales))',
    'Add visuals from the Visualizations pane based on the spec types',
    'Configure dimensions as Axis/Legend fields and metrics as Values',
    'Apply any filters specified in the spec',
    'Customize colors and formatting to match your theme',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('', className)}
    >
      <Tabs defaultValue="spec" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger value="spec" className="data-[state=active]:bg-card">
            <FileJson className="w-4 h-4 mr-2" />
            JSON Spec
          </TabsTrigger>
          <TabsTrigger value="instructions" className="data-[state=active]:bg-card">
            <BookOpen className="w-4 h-4 mr-2" />
            Power BI Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spec" className="mt-4">
          <Card className="glass-panel border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Dashboard Specification</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="border-border hover:border-primary"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted/30 rounded-lg overflow-x-auto scrollbar-thin text-sm font-mono text-foreground/90 max-h-[400px]">
                {specJson}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="mt-4">
          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">How to Use in Power BI</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {powerBISteps.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-foreground/90">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2 text-foreground">Visual Type Mapping:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">bar →</span>
                    <span>Clustered Bar Chart</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">line →</span>
                    <span>Line Chart</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">pie →</span>
                    <span>Pie/Donut Chart</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">card →</span>
                    <span>Card Visual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">table →</span>
                    <span>Table Visual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">area →</span>
                    <span>Area Chart</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
