import { GistFile } from '@/lib/gistApi';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { inferContentType, getDisplayType, InferredContentType } from '@/lib/contentTypeInference';

interface FileSelectorProps {
  files: GistFile[];
  selectedFile: string | null;
  onSelect: (filename: string) => void;
}

function getFileTypeColor(type: InferredContentType): string {
  switch (type) {
    case 'html':
      return 'bg-orange-500/20 text-orange-400';
    case 'css':
      return 'bg-blue-500/20 text-blue-400';
    case 'javascript':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'json':
      return 'bg-green-500/20 text-green-400';
    case 'markdown':
      return 'bg-purple-500/20 text-purple-400';
    case 'code':
      return 'bg-indigo-500/20 text-indigo-400';
    case 'text':
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function FileSelector({ files, selectedFile, onSelect }: FileSelectorProps) {
  if (files.length <= 1) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
      {files.map((file) => {
        const isSelected = file.filename === selectedFile;
        const inferredType = inferContentType(file.content, file.filename);
        const displayType = getDisplayType(inferredType);
        
        return (
          <button
            key={file.filename}
            type="button"
            onClick={() => onSelect(file.filename)}
            className={`
              relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              whitespace-nowrap transition-colors
              ${isSelected 
                ? 'text-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            {isSelected && (
              <motion.div
                layoutId="file-indicator"
                className="absolute inset-0 bg-card border border-border rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`text-[10px] px-1.5 py-0 ${getFileTypeColor(inferredType)}`}
              >
                {displayType}
              </Badge>
              <span className="font-mono">{file.filename}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
