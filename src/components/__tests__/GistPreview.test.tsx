import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GistPreview } from '../GistPreview';
import { GistData } from '@/lib/gistApi';
import React from 'react';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toBlob: vi.fn((callback) => callback(new Blob(['fake-image'], { type: 'image/png' }))),
    toDataURL: vi.fn(() => 'data:image/png;base64,fake'),
  }),
}));

vi.mock('@/components/PreviewFrame', () => {
  return {
    PreviewFrame: ({ content }: { content: string }) => (
      <div data-testid="preview-frame">{content.substring(0, 50)}</div>
    ),
  };
});

vi.mock('@/components/FileSelector', () => ({
  FileSelector: vi.fn(({ files, onSelect }: { files: { filename: string }[]; onSelect: (f: string) => void }) => (
    <div data-testid="file-selector">
      {files.map((f: { filename: string }) => (
        <button key={f.filename} onClick={() => onSelect(f.filename)}>
          {f.filename}
        </button>
      ))}
    </div>
  )),
}));

vi.mock('@/components/ViewportToggle', () => ({
  ViewportToggle: vi.fn(({ onFullscreen }: { onFullscreen?: () => void }) => (
    <div data-testid="viewport-toggle">
      {onFullscreen && <button onClick={onFullscreen}>Fullscreen</button>}
    </div>
  )),
}));

describe('GistPreview', () => {
  const mockOnSelectFile = vi.fn();
  const mockOnBack = vi.fn();

  const createGist = (overrides: Partial<GistData> = {}): GistData => ({
    id: 'gist123',
    description: 'Test gist',
    public: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    files: {
      'index.html': {
        filename: 'index.html',
        type: 'text/html',
        language: 'HTML',
        raw_url: 'https://example.com/index.html',
        size: 100,
        content: '<!DOCTYPE html><html><body>Hello</body></html>',
      },
    },
    owner: { login: 'testuser', avatar_url: 'https://example.com/avatar.png' },
    html_url: 'https://gist.github.com/testuser/gist123',
    ...overrides,
  });

  beforeEach(() => {
    vi.resetAllMocks();
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000', pathname: '/', search: '', href: 'http://localhost:3000/' },
      writable: true,
    });
  });

  it('should render gist description as title', () => {
    render(
      <GistPreview
        gist={createGist({ description: 'My Awesome Gist' })}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('My Awesome Gist')).toBeInTheDocument();
  });

  it('should render "Untitled Gist" for null description', () => {
    render(
      <GistPreview
        gist={createGist({ description: null })}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Untitled Gist')).toBeInTheDocument();
  });

  it('should render owner login', () => {
    render(
      <GistPreview
        gist={createGist({ owner: { login: 'octocat', avatar_url: '' } })}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('by octocat')).toBeInTheDocument();
  });

  it('should not render owner for anonymous gist', () => {
    render(
      <GistPreview
        gist={createGist({ owner: null })}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    expect(screen.queryByText(/by /)).not.toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getAllByRole('button')[0];
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should render viewport toggle', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByTestId('viewport-toggle')).toBeInTheDocument();
  });

  it('should render file selector', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByTestId('file-selector')).toBeInTheDocument();
  });

  it('should toggle between preview and code view', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByTestId('preview-frame')).toBeInTheDocument();

    const rawButton = screen.getByText('Raw');
    fireEvent.click(rawButton);

    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('should show code when Raw button is clicked', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    const rawButton = screen.getByText('Raw');
    fireEvent.click(rawButton);

    expect(screen.getByText(/<!DOCTYPE html>/)).toBeInTheDocument();
  });

  it('should open GitHub link in new tab', () => {
    const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <GistPreview
        gist={createGist({ html_url: 'https://gist.github.com/user/abc' })}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    const githubButton = screen.getByText('GitHub');
    fireEvent.click(githubButton);

    expect(windowOpen).toHaveBeenCalledWith('https://gist.github.com/user/abc', '_blank');
  });

  it('should copy link to clipboard', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    const shareButton = screen.getByText('Share');
    fireEvent.click(shareButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('should enter fullscreen mode', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    const fullscreenButton = screen.getByText('Fullscreen');
    fireEvent.click(fullscreenButton);

    expect(screen.getByTitle('Gist Preview Fullscreen')).toBeInTheDocument();
  });

  it('should start in fullscreen when initialFullscreen is true', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
        initialFullscreen={true}
      />
    );

    expect(screen.getByTitle('Gist Preview Fullscreen')).toBeInTheDocument();
  });

  it('should show ESC hint when in fullscreen and not locked', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
        initialFullscreen={true}
        lockedFullscreen={false}
      />
    );

    expect(screen.getByText('ESC')).toBeInTheDocument();
    expect(screen.getByText(/to exit/i)).toBeInTheDocument();
  });

  it('should not show ESC hint when locked fullscreen', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
        initialFullscreen={true}
        lockedFullscreen={true}
      />
    );

    expect(screen.queryByText('to exit')).not.toBeInTheDocument();
  });

  it('should exit fullscreen when ESC is pressed (if not locked)', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
        initialFullscreen={true}
        lockedFullscreen={false}
      />
    );

    expect(screen.getByTitle('Gist Preview Fullscreen')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByTitle('Gist Preview Fullscreen')).not.toBeInTheDocument();
  });

  it('should not exit fullscreen when ESC is pressed if locked', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
        initialFullscreen={true}
        lockedFullscreen={true}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.getByTitle('Gist Preview Fullscreen')).toBeInTheDocument();
  });

  it('should render screenshot button', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Screenshot')).toBeInTheDocument();
  });

  it('should handle null selectedFile', () => {
    render(
      <GistPreview
        gist={createGist()}
        selectedFile={null}
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByTestId('preview-frame')).toBeInTheDocument();
  });

  it('should handle gist with multiple files', () => {
    const gist = createGist({
      files: {
        'index.html': {
          filename: 'index.html',
          type: 'text/html',
          language: 'HTML',
          raw_url: 'https://example.com/index.html',
          size: 100,
          content: '<!DOCTYPE html>',
        },
        'styles.css': {
          filename: 'styles.css',
          type: 'text/css',
          language: 'CSS',
          raw_url: 'https://example.com/styles.css',
          size: 50,
          content: 'body {}',
        },
        'app.js': {
          filename: 'app.js',
          type: 'application/javascript',
          language: 'JavaScript',
          raw_url: 'https://example.com/app.js',
          size: 30,
          content: 'console.log("hi");',
        },
      },
    });

    render(
      <GistPreview
        gist={gist}
        selectedFile="index.html"
        onSelectFile={mockOnSelectFile}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('index.html')).toBeInTheDocument();
    expect(screen.getByText('styles.css')).toBeInTheDocument();
    expect(screen.getByText('app.js')).toBeInTheDocument();
  });
});
