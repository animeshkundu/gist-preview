import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentGists } from '../useRecentGists';
import { GistData } from '@/lib/gistApi';

describe('useRecentGists', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('should initialize with empty array', () => {
    const { result } = renderHook(() => useRecentGists());
    expect(result.current.recentGists).toEqual([]);
  });

  it('should return existing recent gists', () => {
    const existingGists = [
      {
        id: 'abc123',
        description: 'Test gist',
        owner: 'user',
        ownerAvatar: 'https://example.com/avatar.png',
        viewedAt: Date.now(),
        fileCount: 2,
      },
    ];

    localStorage.setItem('recent-gists', JSON.stringify(existingGists));

    const { result } = renderHook(() => useRecentGists());
    expect(result.current.recentGists).toEqual(existingGists);
  });

  it('should add gist to recent', () => {
    const mockGist: GistData = {
      id: 'new123',
      description: 'New gist',
      public: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      files: {
        'file1.txt': {
          filename: 'file1.txt',
          type: 'text/plain',
          language: null,
          raw_url: 'https://example.com/file1.txt',
          size: 10,
          content: 'content',
        },
      },
      owner: { login: 'testuser', avatar_url: 'https://example.com/avatar.png' },
      html_url: 'https://gist.github.com/new123',
    };

    const { result } = renderHook(() => useRecentGists());

    act(() => {
      result.current.addToRecent(mockGist);
    });

    const stored = JSON.parse(localStorage.getItem('recent-gists') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('new123');
    expect(stored[0].description).toBe('New gist');
    expect(stored[0].owner).toBe('testuser');
    expect(stored[0].fileCount).toBe(1);
  });

  it('should move existing gist to top when added again', () => {
    const existingGists = [
      { id: 'gist1', description: 'First', owner: 'user', ownerAvatar: null, viewedAt: 1000, fileCount: 1 },
      { id: 'gist2', description: 'Second', owner: 'user', ownerAvatar: null, viewedAt: 2000, fileCount: 1 },
    ];

    localStorage.setItem('recent-gists', JSON.stringify(existingGists));

    const mockGist: GistData = {
      id: 'gist1',
      description: 'First Updated',
      public: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      files: { 'file.txt': { filename: 'file.txt', type: 'text/plain', language: null, raw_url: '', size: 10, content: '' } },
      owner: { login: 'user', avatar_url: '' },
      html_url: '',
    };

    const { result } = renderHook(() => useRecentGists());

    act(() => {
      result.current.addToRecent(mockGist);
    });

    const stored = JSON.parse(localStorage.getItem('recent-gists') || '[]');
    expect(stored).toHaveLength(2);
    expect(stored[0].id).toBe('gist1');
    expect(stored[1].id).toBe('gist2');
  });

  it('should limit to 10 recent gists', () => {
    const existingGists = Array.from({ length: 10 }, (_, i) => ({
      id: `gist${i}`,
      description: `Gist ${i}`,
      owner: 'user',
      ownerAvatar: null,
      viewedAt: i * 1000,
      fileCount: 1,
    }));

    localStorage.setItem('recent-gists', JSON.stringify(existingGists));

    const mockGist: GistData = {
      id: 'newgist',
      description: 'New gist',
      public: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      files: { 'file.txt': { filename: 'file.txt', type: 'text/plain', language: null, raw_url: '', size: 10, content: '' } },
      owner: null,
      html_url: '',
    };

    const { result } = renderHook(() => useRecentGists());

    act(() => {
      result.current.addToRecent(mockGist);
    });

    const stored = JSON.parse(localStorage.getItem('recent-gists') || '[]');
    expect(stored).toHaveLength(10);
    expect(stored[0].id).toBe('newgist');
  });

  it('should remove gist from recent', () => {
    const existingGists = [
      { id: 'gist1', description: 'First', owner: 'user', ownerAvatar: null, viewedAt: 1000, fileCount: 1 },
      { id: 'gist2', description: 'Second', owner: 'user', ownerAvatar: null, viewedAt: 2000, fileCount: 1 },
    ];

    localStorage.setItem('recent-gists', JSON.stringify(existingGists));

    const { result } = renderHook(() => useRecentGists());

    act(() => {
      result.current.removeFromRecent('gist1');
    });

    const stored = JSON.parse(localStorage.getItem('recent-gists') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('gist2');
  });

  it('should clear all recent gists', () => {
    const existingGists = [
      { id: 'gist1', description: 'First', owner: 'user', ownerAvatar: null, viewedAt: 1000, fileCount: 1 },
    ];

    localStorage.setItem('recent-gists', JSON.stringify(existingGists));

    const { result } = renderHook(() => useRecentGists());

    act(() => {
      result.current.clearRecent();
    });

    const stored = JSON.parse(localStorage.getItem('recent-gists') || '[]');
    expect(stored).toEqual([]);
  });

  it('should handle gist without owner', () => {
    const mockGist: GistData = {
      id: 'anonymous',
      description: 'Anonymous gist',
      public: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      files: { 'file.txt': { filename: 'file.txt', type: 'text/plain', language: null, raw_url: '', size: 10, content: '' } },
      owner: null,
      html_url: '',
    };

    const { result } = renderHook(() => useRecentGists());

    act(() => {
      result.current.addToRecent(mockGist);
    });

    const stored = JSON.parse(localStorage.getItem('recent-gists') || '[]');
    expect(stored[0].owner).toBeNull();
    expect(stored[0].ownerAvatar).toBeNull();
  });

  it('should handle corrupted localStorage data', () => {
    localStorage.setItem('recent-gists', 'invalid json');

    const { result } = renderHook(() => useRecentGists());

    expect(result.current.recentGists).toEqual([]);
  });

  it('should handle missing localStorage data', () => {
    localStorage.removeItem('recent-gists');

    const { result } = renderHook(() => useRecentGists());

    expect(result.current.recentGists).toEqual([]);
  });
});
