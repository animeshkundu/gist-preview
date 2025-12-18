import { RecentGist } from '@/hooks/useRecentGists';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Trash, Files } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface RecentGistsProps {
  gists: RecentGist[];
  onSelect: (gistId: string) => void;
  onRemove: (gistId: string) => void;
  onClear: () => void;
}

export function RecentGists({ gists, onSelect, onRemove, onClear }: RecentGistsProps) {
  if (gists.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-2xl mx-auto mt-12"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-display font-semibold text-foreground">
          <Clock weight="fill" className="w-5 h-5 text-muted-foreground" />
          Recent Gists
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash weight="bold" className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="grid gap-3">
        {gists.map((gist, index) => (
          <motion.div
            key={gist.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card
              className="group relative p-4 cursor-pointer transition-all hover:bg-card/80 hover:border-muted-foreground/30"
              onClick={() => onSelect(gist.id)}
            >
              <div className="flex items-start gap-3">
                {gist.ownerAvatar ? (
                  <img
                    src={gist.ownerAvatar}
                    alt={gist.owner || 'Anonymous'}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Files weight="fill" className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {gist.owner && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {gist.owner}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground/60">
                      {formatDistanceToNow(gist.viewedAt, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-foreground font-medium truncate">
                    {gist.description || (
                      <span className="text-muted-foreground italic">Untitled gist</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {gist.fileCount} file{gist.fileCount !== 1 ? 's' : ''}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(gist.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <Trash weight="bold" className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
