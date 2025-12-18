import { Button } from '@/components/ui/button';
import { Desktop, DeviceTablet, DeviceMobile } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export type Viewport = 'desktop' | 'tablet' | 'mobile';

interface ViewportToggleProps {
  value: Viewport;
  onChange: (viewport: Viewport) => void;
}

const viewports: { id: Viewport; icon: typeof Desktop; label: string }[] = [
  { id: 'desktop', icon: Desktop, label: 'Desktop' },
  { id: 'tablet', icon: DeviceTablet, label: 'Tablet' },
  { id: 'mobile', icon: DeviceMobile, label: 'Mobile' },
];

export function ViewportToggle({ value, onChange }: ViewportToggleProps) {
  return (
    <div className="relative flex bg-muted rounded-lg p-1">
      {viewports.map((viewport) => {
        const Icon = viewport.icon;
        const isActive = value === viewport.id;

        return (
          <Button
            key={viewport.id}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(viewport.id)}
            className={`
              relative z-10 h-8 px-3 gap-1.5 font-medium text-sm
              ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="viewport-indicator"
                className="absolute inset-0 bg-card rounded-md shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon weight={isActive ? 'fill' : 'regular'} className="w-4 h-4" />
              <span className="hidden sm:inline">{viewport.label}</span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}
