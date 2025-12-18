import { useState, useCallback, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, X, Warning } from '@phosphor-icons/react';
import { parseGistUrl } from '@/lib/parseGistUrl';
import { motion, AnimatePresence } from 'framer-motion';

interface GistInputProps {
  onSubmit: (gistId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function GistInput({ onSubmit, loading, error }: GistInputProps) {
  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const displayError = error || validationError;

  const handleSubmit = useCallback(() => {
    if (!value.trim()) {
      setValidationError('Please enter a Gist URL or ID');
      return;
    }

    const result = parseGistUrl(value);

    if (!result.success) {
      setValidationError(result.error);
      return;
    }

    setValidationError(null);
    onSubmit(result.gistId);
  }, [value, onSubmit]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    setValue('');
    setValidationError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Input
          id="gist-url-input"
          type="text"
          placeholder="Paste a GitHub Gist URL or ID..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (validationError) setValidationError(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className={`
            h-14 pl-5 pr-24 text-base font-mono
            bg-card border-2 transition-all duration-200
            placeholder:text-muted-foreground/50
            focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
            ${displayError ? 'border-destructive focus:ring-destructive' : 'border-border hover:border-muted-foreground/30'}
          `}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <AnimatePresence>
            {value && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  disabled={loading}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                  <X weight="bold" className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !value.trim()}
            className="h-10 px-4 gap-2 font-display font-medium"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Preview
                <ArrowRight weight="bold" className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 mt-3 text-sm text-destructive"
          >
            <Warning weight="fill" className="w-4 h-4 flex-shrink-0" />
            <span>{displayError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Example:{' '}
        <button
          type="button"
          onClick={() => setValue('https://gist.github.com/user/abc123def...')}
          className="font-mono text-accent hover:underline"
        >
          https://gist.github.com/user/abc123...
        </button>
      </p>
    </div>
  );
}
