import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentGists } from '../RecentGists';
import { RecentGist } from '@/hooks/useRecentGists';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}));

vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '5 minutes ago'),
}));

describe('RecentGists', () => {
  const mockOnSelect = vi.fn();
  const mockOnRemove = vi.fn();
  const mockOnClear = vi.fn();

  const createRecentGist = (overrides: Partial<RecentGist> = {}): RecentGist => ({
    id: 'gist123',
    description: 'Test gist description',
    owner: 'testuser',
    ownerAvatar: 'https://example.com/avatar.png',
    viewedAt: Date.now(),
    fileCount: 3,
    ...overrides,
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return null for empty gists array', () => {
    const { container } = render(
      <RecentGists gists={[]} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render recent gists section header', () => {
    const gists = [createRecentGist()];
    render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    expect(screen.getByText('Recent Gists')).toBeInTheDocument();
  });

  it('should render clear button', () => {
    const gists = [createRecentGist()];
    render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should display gist description', () => {
    const gists = [createRecentGist({ description: 'My awesome gist' })];
    render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    expect(screen.getByText('My awesome gist')).toBeInTheDocument();
  });

  it('should display "Untitled gist" for null description', () => {
    const gists = [createRecentGist({ description: null })];
    render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    expect(screen.getByText('Untitled gist')).toBeInTheDocument();
  });

  it('should display owner name', () => {
    const gists = [createRecentGist({ owner: 'octocat' })];
    render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    expect(screen.getByText('octocat')).toBeInTheDocument();
  });

  it('should display file count', () => {
    const gists = [createRecentGist({ fileCount: 5 })];
    render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    expect(screen.getByText('5 files')).toBeInTheDocument();
  });

  it('should display singular "file" for single file', () => {
    const gists = [createRecentGist({ fileCount: 1 })];
    render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    expect(screen.getByText('1 file')).toBeInTheDocument();
  });

  it('should display owner avatar', () => {
    const gists = [createRecentGist({ ownerAvatar: 'https://example.com/my-avatar.png' })];
    render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    const avatar = screen.getByAltText('testuser');
    expect(avatar).toHaveAttribute('src', 'https://example.com/my-avatar.png');
  });

  it('should display placeholder when no avatar', () => {
    const gists = [createRecentGist({ ownerAvatar: null })];
    const { container } = render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    expect(container.querySelector('.w-10.h-10.rounded-full.bg-muted')).toBeInTheDocument();
  });

  it('should call onSelect when gist card is clicked', () => {
    const gists = [createRecentGist({ id: 'gist456' })];
    render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    const card = screen.getByText('Test gist description').closest('[class*="cursor-pointer"]');
    fireEvent.click(card!);

    expect(mockOnSelect).toHaveBeenCalledWith('gist456');
  });

  it('should call onClear when clear button is clicked', () => {
    const gists = [createRecentGist()];
    render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    const clearButton = screen.getByText('Clear').closest('button');
    fireEvent.click(clearButton!);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it('should render multiple gists', () => {
    const gists = [
      createRecentGist({ id: 'gist1', description: 'First gist' }),
      createRecentGist({ id: 'gist2', description: 'Second gist' }),
      createRecentGist({ id: 'gist3', description: 'Third gist' }),
    ];
    render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    expect(screen.getByText('First gist')).toBeInTheDocument();
    expect(screen.getByText('Second gist')).toBeInTheDocument();
    expect(screen.getByText('Third gist')).toBeInTheDocument();
  });

  it('should display relative time', () => {
    const gists = [createRecentGist()];
    render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
  });

  it('should not display owner for anonymous gist', () => {
    const gists = [createRecentGist({ owner: null })];
    render(
      <RecentGists gists={gists} onSelect={mockOnSelect} onRemove={mockOnRemove} onClear={mockOnClear} />
    );

    expect(screen.queryByText('testuser')).not.toBeInTheDocument();
  });
});
