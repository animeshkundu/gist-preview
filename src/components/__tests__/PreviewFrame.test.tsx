import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PreviewFrame } from '../PreviewFrame';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style, ...props }: React.PropsWithChildren<{ style?: React.CSSProperties } & Record<string, unknown>>) => (
      <div style={style} {...props}>{children}</div>
    ),
  },
}));

describe('PreviewFrame', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render iframe with content', () => {
    render(<PreviewFrame content="<p>Hello World</p>" viewport="desktop" />);

    const iframe = screen.getByTitle('Gist Preview');
    expect(iframe).toBeInTheDocument();
  });

  it('should show loading spinner initially', () => {
    const { container } = render(<PreviewFrame content="<p>Test</p>" viewport="desktop" />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should hide loading spinner when iframe loads', async () => {
    const { container } = render(<PreviewFrame content="<p>Test</p>" viewport="desktop" />);

    const iframe = screen.getByTitle('Gist Preview');
    iframe.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
  });

  it('should wrap partial HTML in document structure', () => {
    render(<PreviewFrame content="<div>Content</div>" viewport="desktop" />);

    const iframe = screen.getByTitle('Gist Preview') as HTMLIFrameElement;
    expect(iframe.srcdoc).toContain('<!DOCTYPE html>');
    expect(iframe.srcdoc).toContain('<div>Content</div>');
  });

  it('should not wrap complete HTML documents', () => {
    const fullHtml = '<!DOCTYPE html><html><body><p>Full doc</p></body></html>';
    render(<PreviewFrame content={fullHtml} viewport="desktop" />);

    const iframe = screen.getByTitle('Gist Preview') as HTMLIFrameElement;
    expect(iframe.srcdoc).toBe(fullHtml);
  });

  it('should detect <html> tag and not wrap', () => {
    const htmlWithTag = '<html><body><p>Test</p></body></html>';
    render(<PreviewFrame content={htmlWithTag} viewport="desktop" />);

    const iframe = screen.getByTitle('Gist Preview') as HTMLIFrameElement;
    expect(iframe.srcdoc).toBe(htmlWithTag);
  });

  it('should have sandbox attribute for security', () => {
    render(<PreviewFrame content="<p>Test</p>" viewport="desktop" />);

    const iframe = screen.getByTitle('Gist Preview');
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
  });

  it('should handle different viewport sizes', () => {
    const viewports = ['desktop', 'tablet', 'mobile'] as const;

    viewports.forEach((viewport) => {
      const { unmount } = render(<PreviewFrame content="<p>Test</p>" viewport={viewport} />);
      expect(screen.getByTitle('Gist Preview')).toBeInTheDocument();
      unmount();
    });
  });

  it('should reset loading state when content changes', () => {
    const { rerender, container } = render(<PreviewFrame content="<p>First</p>" viewport="desktop" />);

    const iframe = screen.getByTitle('Gist Preview');
    iframe.dispatchEvent(new Event('load'));

    rerender(<PreviewFrame content="<p>Second</p>" viewport="desktop" />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should add base styles to wrapped content', () => {
    render(<PreviewFrame content="<div>Styled</div>" viewport="desktop" />);

    const iframe = screen.getByTitle('Gist Preview') as HTMLIFrameElement;
    expect(iframe.srcdoc).toContain('margin: 0');
    expect(iframe.srcdoc).toContain('padding: 0');
  });

  it('should forward ref to container div', () => {
    const ref = vi.fn();
    render(<PreviewFrame ref={ref} content="<p>Test</p>" viewport="desktop" />);
    
    expect(ref).toHaveBeenCalled();
  });
});
