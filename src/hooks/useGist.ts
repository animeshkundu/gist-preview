import { useState, useCallback, useMemo } from 'react';
import { fetchGist, GistData, GistFile, getFilesByType } from '@/lib/gistApi';

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

    const { html, css, js, other } = getFilesByType(result.data.files);
    const allFiles = [...html, ...css, ...js, ...other];

    if (html.length > 0) {
      setSelectedFile(html[0].filename);
    } else if (allFiles.length > 0) {
      setSelectedFile(allFiles[0].filename);
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
