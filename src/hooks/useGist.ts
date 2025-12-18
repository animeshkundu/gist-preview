import { useState, useCallback, useMemo } from 'react';
import { fetchGist, GistData, GistFile, getFilesByType } from '@/lib/gistApi';
import { inferContentType } from '@/lib/contentTypeInference';

interface UseGistReturn {
  gist: GistData | null;
  loading: boolean;
  error: string | null;
  loadGist: (gistId: string) => Promise<boolean>;
  selectedFile: string | null;
  setSelectedFile: (filename: string) => void;
  files: GistFile[];
  filesByType: ReturnType<typeof getFilesByType>;
  reset: () => void;
}

function selectBestFile(files: Record<string, GistFile>): string | null {
  const allFiles = Object.values(files);
  if (allFiles.length === 0) return null;

  const htmlFiles: GistFile[] = [];
  const markdownFiles: GistFile[] = [];
  const otherFiles: GistFile[] = [];

  for (const file of allFiles) {
    const inferredType = inferContentType(file.content, file.filename);
    if (inferredType === 'html') {
      htmlFiles.push(file);
    } else if (inferredType === 'markdown') {
      markdownFiles.push(file);
    } else {
      otherFiles.push(file);
    }
  }

  if (htmlFiles.length > 0) {
    const indexFile = htmlFiles.find(f => 
      f.filename.toLowerCase() === 'index.html' || 
      f.filename.toLowerCase() === 'index.htm'
    );
    return indexFile?.filename || htmlFiles[0].filename;
  }

  if (markdownFiles.length > 0) {
    const readmeFile = markdownFiles.find(f => 
      f.filename.toLowerCase() === 'readme.md' ||
      f.filename.toLowerCase() === 'readme.markdown'
    );
    return readmeFile?.filename || markdownFiles[0].filename;
  }

  return allFiles[0].filename;
}

export function useGist(): UseGistReturn {
  const [gist, setGist] = useState<GistData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const files = useMemo(() => {
    if (!gist) return [];
    return Object.values(gist.files);
  }, [gist]);

  const filesByType = useMemo(() => {
    if (!gist) return { html: [], css: [], js: [], other: [] };
    return getFilesByType(gist.files);
  }, [gist]);

  const loadGist = useCallback(async (gistId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const result = await fetchGist(gistId);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return false;
    }

    setGist(result.data);

    const bestFile = selectBestFile(result.data.files);
    if (bestFile) {
      setSelectedFile(bestFile);
    }

    setLoading(false);
    return true;
  }, []);

  const reset = useCallback(() => {
    setGist(null);
    setError(null);
    setSelectedFile(null);
    setLoading(false);
  }, []);

  return {
    gist,
    loading,
    error,
    loadGist,
    selectedFile,
    setSelectedFile,
    files,
    filesByType,
    reset,
  };
}
