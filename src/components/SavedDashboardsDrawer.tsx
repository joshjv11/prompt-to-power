import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  FolderOpen,
  Trash2,
  Pencil,
  Clock,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAppStore, SavedDashboard } from '@/store/appStore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function SavedDashboardsDrawer() {
  const {
    savedDashboards,
    dashboardSpec,
    rawData,
    saveDashboard,
    loadDashboard,
    deleteDashboard,
    renameDashboard,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleSave = () => {
    try {
      const id = saveDashboard();
      toast({
        title: 'Dashboard saved!',
        description: 'You can load it anytime from My Dashboards.',
      });
      return id;
    } catch (err) {
      toast({
        title: 'Cannot save',
        description: 'Generate a dashboard first.',
        variant: 'destructive',
      });
    }
  };

  const handleLoad = (dashboard: SavedDashboard) => {
    loadDashboard(dashboard.id);
    setIsOpen(false);
    toast({
      title: 'Dashboard loaded!',
      description: `Restored "${dashboard.title}"`,
    });
  };

  const handleDelete = (id: string, title: string) => {
    deleteDashboard(id);
    toast({
      title: 'Dashboard deleted',
      description: `Removed "${title}"`,
    });
  };

  const handleStartEdit = (dashboard: SavedDashboard) => {
    setEditingId(dashboard.id);
    setEditTitle(dashboard.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      renameDashboard(id, editTitle.trim());
      toast({ title: 'Dashboard renamed' });
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canSave = dashboardSpec !== null && rawData.length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FolderOpen className="w-4 h-4" />
          <span className="hidden sm:inline">My Dashboards</span>
          {savedDashboards.length > 0 && (
            <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
              {savedDashboards.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[320px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            My Dashboards
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full gap-2"
          >
            <Save className="w-4 h-4" />
            Save Current Dashboard
          </Button>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <AnimatePresence mode="popLayout">
              {savedDashboards.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No saved dashboards yet</p>
                  <p className="text-xs mt-1">Generate and save your first dashboard!</p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {savedDashboards.map((dashboard) => (
                    <motion.div
                      key={dashboard.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={cn(
                        'group p-3 rounded-lg border border-border/50',
                        'hover:bg-muted/50 transition-colors'
                      )}
                    >
                      {editingId === dashboard.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(dashboard.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleSaveEdit(dashboard.id)}
                          >
                            <Check className="w-4 h-4 text-success" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {dashboard.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatDate(dashboard.updatedAt)}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {dashboard.spec.visuals.length} charts • {dashboard.data.length} rows
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleLoad(dashboard)}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => handleLoad(dashboard)}
                            >
                              <FolderOpen className="w-3 h-3" />
                              Load
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => handleStartEdit(dashboard)}
                            >
                              <Pencil className="w-3 h-3" />
                              Rename
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(dashboard.id, dashboard.title)}
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
