import { useMemo, useState } from 'react';
import { GistData, GistFile, assemblePreviewHtml, getFilesByType } from '@/lib/gistApi';
import { PreviewFrame } from './PreviewFrame';
import { FileSelector } from './FileSelector';
import { ViewportToggle, Viewport } from './ViewportToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Copy, Link, Code, Eye, ArrowSquareOut } from '@phosphor-icons/react';
import { buildGistPreviewUrl } from '@/lib/parseGistUrl';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface GistPreviewProps {
  gist: GistData;
  selectedFile: string | null;
  onSelectFile: (filename: string) => void;
  onBack: () => void;
}

export function GistPreview({ gist, selectedFile, onSelectFile, onBack }: GistPreviewProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [showCode, setShowCode] = useState(false);

  const files = useMemo(() => Object.values(gist.files), [gist.files]);
  const filesByType = useMemo(() => getFilesByType(gist.files), [gist.files]);

  const currentFile = useMemo(() => {
    if (!selectedFile) return null;
    return gist.files[selectedFile] || null;
  }, [gist.files, selectedFile]);

  const previewContent = useMemo(() => {
    if (!currentFile) return '';

    const ext = currentFile.filename.split('.').pop()?.toLowerCase();
    if (ext === 'html' || ext === 'htm') {
      return assemblePreviewHtml(currentFile.content, filesByType.css, filesByType.js);
    }

    return currentFile.content;
  }, [currentFile, filesByType]);

  const isPreviewable = useMemo(() => {
    if (!currentFile) return false;
    const ext = currentFile.filename.split('.').pop()?.toLowerCase();
    return ext === 'html' || ext === 'htm';
  }, [currentFile]);

  const handleCopyContent = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content);
    toast.success('Copied to clipboard');
  };

  const handleCopyLink = () => {
    const url = buildGistPreviewUrl(gist.id, selectedFile || undefined);
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleOpenOriginal = () => {
    window.open(gist.html_url, '_blank');
  };

  return (
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
          {isPreviewable && (
            <ViewportToggle value={viewport} onChange={setViewport} />
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <FileSelector
          files={files}
          selectedFile={selectedFile}
          onSelect={onSelectFile}
        />

        <div className="flex items-center gap-2">
          {isPreviewable && (
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
                  Code
                </>
              )}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleCopyContent} className="gap-1.5">
            <Copy weight="bold" className="w-4 h-4" />
            <span className="hidden sm:inline">Copy</span>
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
        {isPreviewable && !showCode ? (
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
  );
}
