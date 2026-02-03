import { useState } from 'react';
import { Copy, RotateCcw, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MessageActionsProps {
  message: string;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function MessageActions({ 
  message, 
  onCopy, 
  onRegenerate, 
  onDelete,
  className 
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Message copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  return (
    <div className={cn('flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity', className)}>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleCopy}
        title="Copy message"
      >
        {copied ? (
          <Check className="w-3 h-3 text-success" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </Button>
      
      {(onRegenerate || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="More options">
              <span className="text-xs">⋯</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onRegenerate && (
              <DropdownMenuItem onClick={onRegenerate} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Regenerate
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive">
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

