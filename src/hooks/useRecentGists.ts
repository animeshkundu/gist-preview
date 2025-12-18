import { useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { GistData } from '@/lib/gistApi';

export interface RecentGist {
  id: string;
  description: string | null;
  owner: string | null;
  ownerAvatar: string | null;
  viewedAt: number;
  fileCount: number;
}

const MAX_RECENT_GISTS = 10;

interface UseRecentGistsReturn {
  recentGists: RecentGist[];
  addToRecent: (gist: GistData) => void;
  removeFromRecent: (gistId: string) => void;
  clearRecent: () => void;
}

export function useRecentGists(): UseRecentGistsReturn {
  const [recentGists, setRecentGists] = useKV<RecentGist[]>('recent-gists', []);

  const addToRecent = useCallback(
    (gist: GistData) => {
      const newEntry: RecentGist = {
        id: gist.id,
        description: gist.description,
        owner: gist.owner?.login ?? null,
        ownerAvatar: gist.owner?.avatar_url ?? null,
        viewedAt: Date.now(),
        fileCount: Object.keys(gist.files).length,
      };

      setRecentGists((current) => {
        const list = current ?? [];
        const filtered = list.filter((g) => g.id !== gist.id);
        const updated = [newEntry, ...filtered].slice(0, MAX_RECENT_GISTS);
        return updated;
      });
    },
    [setRecentGists]
  );

  const removeFromRecent = useCallback(
    (gistId: string) => {
      setRecentGists((current) => (current ?? []).filter((g) => g.id !== gistId));
    },
    [setRecentGists]
  );

  const clearRecent = useCallback(() => {
    setRecentGists([]);
  }, [setRecentGists]);

  return {
    recentGists: recentGists ?? [],
    addToRecent,
    removeFromRecent,
    clearRecent,
  };
}
