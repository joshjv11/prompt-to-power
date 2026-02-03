import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
import 'highlight.js/styles/github-dark.css';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <code className={cn('block p-3 rounded-lg bg-muted text-sm overflow-x-auto', className)} {...props}>
                {children}
              </code>
            ) : (
              <code className={cn('px-1.5 py-0.5 rounded bg-muted text-sm', className)} {...props}>
                {children}
              </code>
            );
          },
          a: ({ node, ...props }) => (
            <a target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

