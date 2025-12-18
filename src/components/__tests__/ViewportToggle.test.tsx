import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewportToggle, Viewport } from '../ViewportToggle';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}));

describe('ViewportToggle', () => {
  const mockOnChange = vi.fn();
  const mockOnFullscreen = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render all viewport options', () => {
    render(<ViewportToggle value="desktop" onChange={mockOnChange} />);

    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Tablet')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();
  });

  it('should highlight active viewport', () => {
    render(<ViewportToggle value="tablet" onChange={mockOnChange} />);

    const tabletButton = screen.getByText('Tablet').closest('button');
    expect(tabletButton).toHaveClass('text-foreground');
  });

  it('should call onChange when viewport is clicked', () => {
    render(<ViewportToggle value="desktop" onChange={mockOnChange} />);

    const mobileButton = screen.getByText('Mobile').closest('button');
    fireEvent.click(mobileButton!);

    expect(mockOnChange).toHaveBeenCalledWith('mobile');
  });

  it('should render fullscreen button when onFullscreen is provided', () => {
    render(<ViewportToggle value="desktop" onChange={mockOnChange} onFullscreen={mockOnFullscreen} />);

    expect(screen.getByText('Fullscreen')).toBeInTheDocument();
  });

  it('should not render fullscreen button when onFullscreen is not provided', () => {
    render(<ViewportToggle value="desktop" onChange={mockOnChange} />);

    expect(screen.queryByText('Fullscreen')).not.toBeInTheDocument();
  });

  it('should call onFullscreen when fullscreen button is clicked', () => {
    render(<ViewportToggle value="desktop" onChange={mockOnChange} onFullscreen={mockOnFullscreen} />);

    const fullscreenButton = screen.getByText('Fullscreen').closest('button');
    fireEvent.click(fullscreenButton!);

    expect(mockOnFullscreen).toHaveBeenCalled();
  });

  it('should handle all viewport values', () => {
    const viewports: Viewport[] = ['desktop', 'tablet', 'mobile'];

    viewports.forEach((viewport) => {
      const { unmount } = render(<ViewportToggle value={viewport} onChange={mockOnChange} />);
      expect(screen.getByText(viewport.charAt(0).toUpperCase() + viewport.slice(1))).toBeInTheDocument();
      unmount();
    });
  });
});
