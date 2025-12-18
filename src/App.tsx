import { useEffect, useCallback, useState } from 'react';
import { GistInput } from '@/components/GistInput';
import { GistPreview } from '@/components/GistPreview';
import { RecentGists } from '@/components/RecentGists';
import { useGist } from '@/hooks/useGist';
import { useRecentGists } from '@/hooks/useRecentGists';
import { Toaster } from '@/components/ui/sonner';
import { GithubLogo, Code } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

function App() {
  const { gist, loading, error, loadGist, selectedFile, setSelectedFile, reset } = useGist();
  const { recentGists, addToRecent, removeFromRecent, clearRecent } = useRecentGists();
  const [loadedFromUrl, setLoadedFromUrl] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gistId = params.get('gist');
    const file = params.get('file');

    if (gistId) {
      setLoadedFromUrl(true);
      loadGist(gistId).then((success) => {
        if (success && file) {
          setSelectedFile(file);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gist) {
      addToRecent(gist);

      const url = new URL(window.location.href);
      url.searchParams.set('gist', gist.id);
      if (selectedFile) {
        url.searchParams.set('file', selectedFile);
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, [gist, selectedFile, addToRecent]);

  const handleSubmit = useCallback(async (gistId: string) => {
    await loadGist(gistId);
  }, [loadGist]);

  const handleBack = useCallback(() => {
    reset();
    setLoadedFromUrl(false);
    window.history.replaceState({}, '', window.location.pathname);
  }, [reset]);

  const handleSelectRecent = useCallback((gistId: string) => {
    loadGist(gistId);
  }, [loadGist]);

  if (gist) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-6xl mx-auto h-[calc(100vh-3rem)]">
          <GistPreview
            gist={gist}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            onBack={handleBack}
            initialFullscreen={loadedFromUrl}
            lockedFullscreen={loadedFromUrl}
          />
        </div>
        <Toaster position="bottom-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
              <Code weight="duotone" className="w-10 h-10 text-accent" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground tracking-tight mb-3">
            GistPreview
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Transform any GitHub Gist into a beautifully rendered web page
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full"
        >
          <GistInput
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </motion.div>

        <RecentGists
          gists={recentGists}
          onSelect={handleSelectRecent}
          onRemove={removeFromRecent}
          onClear={clearRecent}
        />
      </div>

      <footer className="p-6 text-center">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <GithubLogo weight="fill" className="w-4 h-4" />
          Powered by GitHub Gist API
        </a>
      </footer>

      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;
