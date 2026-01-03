import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/appStore';
import { generatePowerBIExport, generatePBITTemplate, generatePlainTextInstructions, type PowerBIExport } from '@/lib/powerBIExport';
import { Copy, Check, FileJson, BookOpen, Download, Code, BarChart3, Calculator, FileCode, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface SpecViewerProps {
  className?: string;
}

export const SpecViewer = ({ className }: SpecViewerProps) => {
  const { dashboardSpec, schema, rawData } = useAppStore();
  const [copied, setCopied] = useState<string | null>(null);
  const [exportData, setExportData] = useState<PowerBIExport | null>(null);

  if (!dashboardSpec) return null;

  // Generate export on first render or spec change
  if (!exportData && schema.length > 0) {
    const data = generatePowerBIExport(dashboardSpec, schema, rawData);
    setExportData(data);
  }

  const specJson = JSON.stringify(dashboardSpec, null, 2);

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast({
      title: 'Copied to clipboard',
      description: `${label} copied successfully`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadTemplate = () => {
    const template = generatePBITTemplate(dashboardSpec, schema, rawData);
    const blob = new Blob([template], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dashboardSpec.title.replace(/[^a-zA-Z0-9]/g, '_')}_powerbi_template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Template downloaded!',
      description: 'Import this template into Power BI Desktop',
    });
  };

  const downloadAllInstructions = () => {
    if (!exportData) return;
    const text = generatePlainTextInstructions(exportData);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dashboardSpec.title.replace(/[^a-zA-Z0-9]/g, '_')}_powerbi_instructions.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Instructions downloaded!',
      description: 'Open in any text editor',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('', className)}
    >
      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="export" className="data-[state=active]:bg-card text-xs sm:text-sm">
            <Download className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Power BI</span> Export
          </TabsTrigger>
          <TabsTrigger value="measures" className="data-[state=active]:bg-card text-xs sm:text-sm">
            <Calculator className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">DAX</span> Measures
          </TabsTrigger>
          <TabsTrigger value="mcode" className="data-[state=active]:bg-card text-xs sm:text-sm">
            <FileCode className="w-4 h-4 mr-1 sm:mr-2" />
            M Code
          </TabsTrigger>
          <TabsTrigger value="spec" className="data-[state=active]:bg-card text-xs sm:text-sm">
            <FileJson className="w-4 h-4 mr-1 sm:mr-2" />
            JSON
          </TabsTrigger>
        </TabsList>

        {/* Power BI Export Tab */}
        <TabsContent value="export" className="mt-4">
          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Ready for Power BI Desktop
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadAllInstructions}
                    className="border-border hover:border-primary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Download</span> Instructions
                  </Button>
                  <Button
                    size="sm"
                    onClick={downloadTemplate}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Download</span> Template
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{exportData?.measures.length || 0}</div>
                  <div className="text-xs text-muted-foreground">DAX Measures</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{exportData?.visuals.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Visuals</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{schema.length}</div>
                  <div className="text-xs text-muted-foreground">Columns</div>
                </div>
              </div>

              {/* Setup Steps */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Setup Steps
                </h4>
                <ol className="space-y-2">
                  {exportData?.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-foreground/90">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Visuals Summary */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Visuals to Create
                </h4>
                <div className="space-y-2">
                  {exportData?.visuals.map((visual, idx) => (
                    <div key={idx} className="p-3 bg-muted/20 rounded-lg flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm">{visual.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{visual.configuration}</div>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0 ml-2">
                        {visual.powerBIType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DAX Measures Tab */}
        <TabsContent value="measures" className="mt-4">
          <Card className="glass-panel border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">DAX Measures</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const allMeasures = exportData?.measures.map(m => 
                    `${m.name} = ${m.formula}`
                  ).join('\n\n') || '';
                  copyToClipboard(allMeasures, 'All measures');
                }}
                className="border-border hover:border-primary"
              >
                {copied === 'All measures' ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {exportData?.measures.map((measure, idx) => (
                    <div key={idx} className="p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-mono font-medium text-primary">{measure.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{measure.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`${measure.name} = ${measure.formula}`, measure.name)}
                          className="h-8 w-8 p-0"
                        >
                          {copied === measure.name ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="p-3 bg-background/50 rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                        {measure.formula}
                      </pre>
                      {measure.formatString && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Format: <code className="bg-muted px-1 rounded">{measure.formatString}</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* M Code Tab */}
        <TabsContent value="mcode" className="mt-4">
          <Card className="glass-panel border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Power Query M Code</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(exportData?.mCode || '', 'M Code')}
                className="border-border hover:border-primary"
              >
                {copied === 'M Code' ? (
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
              <div className="mb-4 p-3 bg-primary/10 rounded-lg text-sm">
                <strong>How to use:</strong> In Power BI Desktop, go to <code className="bg-muted px-1 rounded">Transform Data</code> → <code className="bg-muted px-1 rounded">Advanced Editor</code> and paste this code.
              </div>
              <pre className="p-4 bg-muted/30 rounded-lg overflow-x-auto scrollbar-thin text-sm font-mono text-foreground/90 max-h-[400px]">
                {exportData?.mCode}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* JSON Spec Tab */}
        <TabsContent value="spec" className="mt-4">
          <Card className="glass-panel border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Dashboard Specification</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(specJson, 'JSON spec')}
                className="border-border hover:border-primary"
              >
                {copied === 'JSON spec' ? (
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
      </Tabs>
    </motion.div>
  );
};
