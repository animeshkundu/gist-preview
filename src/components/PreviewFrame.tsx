import { useMemo, useState, useEffect, forwardRef } from 'react';
import { motion } from 'framer-motion';

type Viewport = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

interface PreviewFrameProps {
  content: string;
  viewport: Viewport;
}

export const PreviewFrame = forwardRef<HTMLDivElement, PreviewFrameProps>(function PreviewFrame({ content, viewport }, ref) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [content]);

  const srcDoc = useMemo(() => {
    const baseStyles = `
      <style>
        html, body { margin: 0; padding: 0; }
      </style>
    `;
    if (content.toLowerCase().includes('<!doctype') || content.toLowerCase().includes('<html')) {
      return content;
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${baseStyles}</head><body>${content}</body></html>`;
  }, [content]);

  const width = VIEWPORT_WIDTHS[viewport];

  return (
    <div ref={ref} className="relative w-full h-full flex justify-center overflow-auto bg-muted/30 rounded-lg">
      <motion.div
        animate={{ width }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="h-full bg-white shadow-2xl"
        style={{ maxWidth: '100%' }}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <iframe
          srcDoc={srcDoc}
          title="Gist Preview"
          sandbox="allow-scripts"
          className={`w-full h-full border-0 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
        />
      </motion.div>
    </div>
  );
});
