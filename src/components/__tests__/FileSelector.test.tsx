import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileSelector } from '../FileSelector';
import { GistFile } from '@/lib/gistApi';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}));

describe('FileSelector', () => {
  const mockOnSelect = vi.fn();

  const createFile = (filename: string, content = ''): GistFile => ({
    filename,
    type: 'text/plain',
    language: null,
    raw_url: `https://example.com/${filename}`,
    size: content.length,
    content,
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return null for single file', () => {
    const files = [createFile('only.txt')];
    const { container } = render(
      <FileSelector files={files} selectedFile="only.txt" onSelect={mockOnSelect} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render file buttons for multiple files', () => {
    const files = [createFile('file1.txt'), createFile('file2.txt')];
    render(
      <FileSelector files={files} selectedFile="file1.txt" onSelect={mockOnSelect} />
    );

    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('file2.txt')).toBeInTheDocument();
  });

  it('should call onSelect when file is clicked', () => {
    const files = [createFile('file1.txt'), createFile('file2.txt')];
    render(
      <FileSelector files={files} selectedFile="file1.txt" onSelect={mockOnSelect} />
    );

    const file2Button = screen.getByText('file2.txt').closest('button');
    fireEvent.click(file2Button!);

    expect(mockOnSelect).toHaveBeenCalledWith('file2.txt');
  });

  it('should display correct file type badge for HTML', () => {
    const files = [
      createFile('index.html', '<!DOCTYPE html><html></html>'),
      createFile('styles.css'),
    ];
    render(
      <FileSelector files={files} selectedFile="index.html" onSelect={mockOnSelect} />
    );

    expect(screen.getByText('HTML')).toBeInTheDocument();
  });

  it('should display correct file type badge for Markdown', () => {
    const files = [
      createFile('readme.md', '# Title'),
      createFile('other.txt'),
    ];
    render(
      <FileSelector files={files} selectedFile="readme.md" onSelect={mockOnSelect} />
    );

    expect(screen.getByText('Markdown')).toBeInTheDocument();
  });

  it('should display correct file type badge for JSON', () => {
    const files = [
      createFile('data.json', '{"key": "value"}'),
      createFile('other.txt'),
    ];
    render(
      <FileSelector files={files} selectedFile="data.json" onSelect={mockOnSelect} />
    );

    expect(screen.getByText('JSON')).toBeInTheDocument();
  });

  it('should display correct file type badge for CSS', () => {
    const files = [
      createFile('styles.css', 'body { color: red; }'),
      createFile('other.txt'),
    ];
    render(
      <FileSelector files={files} selectedFile="styles.css" onSelect={mockOnSelect} />
    );

    expect(screen.getByText('CSS')).toBeInTheDocument();
  });

  it('should display correct file type badge for JavaScript', () => {
    const files = [
      createFile('app.js', 'const x = 1;'),
      createFile('other.txt'),
    ];
    render(
      <FileSelector files={files} selectedFile="app.js" onSelect={mockOnSelect} />
    );

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('should highlight selected file', () => {
    const files = [createFile('file1.txt'), createFile('file2.txt')];
    render(
      <FileSelector files={files} selectedFile="file2.txt" onSelect={mockOnSelect} />
    );

    const file2Button = screen.getByText('file2.txt').closest('button');
    expect(file2Button).toHaveClass('text-foreground');
  });

  it('should handle null selected file', () => {
    const files = [createFile('file1.txt'), createFile('file2.txt')];
    render(
      <FileSelector files={files} selectedFile={null} onSelect={mockOnSelect} />
    );

    expect(screen.getByText('file1.txt')).toBeInTheDocument();
  });

  it('should handle empty files array', () => {
    const { container } = render(
      <FileSelector files={[]} selectedFile={null} onSelect={mockOnSelect} />
    );

    expect(container.firstChild).toBeNull();
  });
});
