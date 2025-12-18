import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { GistData, assemblePreviewHtml, getFilesByType } from '@/lib/gistApi';
import { getRenderedContent, getInferredType } from '@/lib/contentRenderer';
import { PreviewFrame } from './PreviewFrame';
import { FileSelector } from './FileSelector';
import { ViewportToggle, Viewport } from './ViewportToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Link, Code, Eye, ArrowSquareOut, X } from '@phosphor-icons/react';
import { buildGistPreviewUrl } from '@/lib/parseGistUrl';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface GistPreviewProps {
  gist: GistData;
  selectedFile: string | null;
  onSelectFile: (filename: string) => void;
  onBack: () => void;
  initialFullscreen?: boolean;
  lockedFullscreen?: boolean;
}

export function GistPreview({ gist, selectedFile, onSelectFile, onBack, initialFullscreen = false, lockedFullscreen = false }: GistPreviewProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [showCode, setShowCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen || lockedFullscreen);
  const fullscreenIframeRef = useRef<HTMLIFrameElement>(null);

  const files = useMemo(() => Object.values(gist.files), [gist.files]);
  const filesByType = useMemo(() => getFilesByType(gist.files), [gist.files]);

  const currentFile = useMemo(() => {
    if (!selectedFile) return null;
    return gist.files[selectedFile] || null;
  }, [gist.files, selectedFile]);

  const previewContent = useMemo(() => {
    if (!currentFile) return '';

    const inferredType = getInferredType(currentFile.content, currentFile.filename);
    
    if (inferredType === 'html') {
      return assemblePreviewHtml(currentFile.content, filesByType.css, filesByType.js);
    }

    return getRenderedContent(currentFile.content, currentFile.filename);
  }, [currentFile, filesByType]);

  const handleCopyLink = () => {
    const url = buildGistPreviewUrl(gist.id, selectedFile || undefined);
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleOpenOriginal = () => {
    window.open(gist.html_url, '_blank');
  };

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  const handleExitFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  useEffect(() => {
    if (lockedFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, lockedFullscreen]);

  return (
    <>
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <iframe
              ref={fullscreenIframeRef}
              srcDoc={previewContent.toLowerCase().includes('<!doctype') || previewContent.toLowerCase().includes('<html')
                ? previewContent
                : `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html, body { margin: 0; padding: 0; }</style></head><body>${previewContent}</body></html>`
              }
              title="Gist Preview Fullscreen"
              sandbox="allow-scripts"
              className="w-full h-full border-0"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.1 }}
              className="fixed top-4 right-4 z-50 flex gap-2"
            >
              {!lockedFullscreen && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleExitFullscreen}
                  className="h-10 w-10 rounded-full bg-black/80 hover:bg-black text-white shadow-lg backdrop-blur-sm"
                >
                  <X weight="bold" className="w-5 h-5" />
                </Button>
              )}
            </motion.div>
            {!lockedFullscreen && (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.2 }}
                  className="px-4 py-2 bg-black/80 text-white text-sm rounded-full backdrop-blur-sm"
                >
                  Press <kbd className="px-1.5 py-0.5 mx-1 bg-white/20 rounded text-xs">ESC</kbd> to exit
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col h-full"
      >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft weight="bold" className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-display font-semibold text-foreground line-clamp-1">
              {gist.description || 'Untitled Gist'}
            </h1>
            {gist.owner && (
              <p className="text-sm text-muted-foreground">by {gist.owner.login}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <ViewportToggle value={viewport} onChange={setViewport} onFullscreen={handleFullscreen} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <FileSelector
          files={files}
          selectedFile={selectedFile}
          onSelect={onSelectFile}
        />

        <div className="flex items-center gap-2">
          <Button
            variant={showCode ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowCode(!showCode)}
            className="gap-1.5"
          >
            {showCode ? (
              <>
                <Eye weight="bold" className="w-4 h-4" />
                Preview
              </>
            ) : (
              <>
                <Code weight="bold" className="w-4 h-4" />
                Raw
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopyLink} className="gap-1.5">
            <Link weight="bold" className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOpenOriginal} className="gap-1.5">
            <ArrowSquareOut weight="bold" className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden border-2">
        {!showCode ? (
          <PreviewFrame content={previewContent} viewport={viewport} />
        ) : (
          <div className="h-full overflow-auto p-4 bg-card">
            <pre className="font-mono text-sm text-foreground whitespace-pre-wrap break-all">
              <code>{currentFile?.content || ''}</code>
            </pre>
          </div>
        )}
      </Card>
      </motion.div>
    </>
  );
}