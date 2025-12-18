import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGist } from '../useGist';
import * as gistApi from '@/lib/gistApi';

vi.mock('@/lib/gistApi', () => ({
  fetchGist: vi.fn(),
  getFilesByType: vi.fn(() => ({ html: [], css: [], js: [], other: [] })),
}));

describe('useGist', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGist());

    expect(result.current.gist).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.selectedFile).toBeNull();
    expect(result.current.files).toEqual([]);
  });

  it('should load gist successfully', async () => {
    const mockGist = {
      id: 'abc123',
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
          content: '<!DOCTYPE html><html></html>',
        },
      },
      owner: { login: 'user', avatar_url: 'https://example.com/avatar.png' },
      html_url: 'https://gist.github.com/user/abc123',
    };

    vi.mocked(gistApi.fetchGist).mockResolvedValueOnce({
      success: true,
      data: mockGist,
    });

    vi.mocked(gistApi.getFilesByType).mockReturnValue({
      html: [mockGist.files['index.html']],
      css: [],
      js: [],
      other: [],
    });

    const { result } = renderHook(() => useGist());

    let success: boolean;
    await act(async () => {
      success = await result.current.loadGist('abc123');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(success!).toBe(true);
    expect(result.current.gist).toEqual(mockGist);
    expect(result.current.selectedFile).toBe('index.html');
    expect(result.current.error).toBeNull();
  });

  it('should handle gist load error', async () => {
    vi.mocked(gistApi.fetchGist).mockResolvedValueOnce({
      success: false,
      error: 'Gist not found',
    });

    const { result } = renderHook(() => useGist());

    let success: boolean;
    await act(async () => {
      success = await result.current.loadGist('nonexistent');
    });

    expect(success!).toBe(false);
    expect(result.current.gist).toBeNull();
    expect(result.current.error).toBe('Gist not found');
  });

  it('should select best file - prioritize HTML', async () => {
    const mockGist = {
      id: 'abc123',
      description: 'Test',
      public: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      files: {
        'readme.md': {
          filename: 'readme.md',
          type: 'text/markdown',
          language: 'Markdown',
          raw_url: 'https://example.com/readme.md',
          size: 50,
          content: '# Readme',
        },
        'index.html': {
          filename: 'index.html',
          type: 'text/html',
          language: 'HTML',
          raw_url: 'https://example.com/index.html',
          size: 100,
          content: '<!DOCTYPE html><html></html>',
        },
      },
      owner: null,
      html_url: 'https://gist.github.com/abc123',
    };

    vi.mocked(gistApi.fetchGist).mockResolvedValueOnce({
      success: true,
      data: mockGist,
    });

    const { result } = renderHook(() => useGist());

    await act(async () => {
      await result.current.loadGist('abc123');
    });

    expect(result.current.selectedFile).toBe('index.html');
  });

  it('should select index.html over other HTML files', async () => {
    const mockGist = {
      id: 'abc123',
      description: 'Test',
      public: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      files: {
        'page.html': {
          filename: 'page.html',
          type: 'text/html',
          language: 'HTML',
          raw_url: 'https://example.com/page.html',
          size: 100,
          content: '<!DOCTYPE html><html></html>',
        },
        'index.html': {
          filename: 'index.html',
          type: 'text/html',
          language: 'HTML',
          raw_url: 'https://example.com/index.html',
          size: 100,
          content: '<!DOCTYPE html><html></html>',
        },
      },
      owner: null,
      html_url: 'https://gist.github.com/abc123',
    };

    vi.mocked(gistApi.fetchGist).mockResolvedValueOnce({
      success: true,
      data: mockGist,
    });

    const { result } = renderHook(() => useGist());

    await act(async () => {
      await result.current.loadGist('abc123');
    });

    expect(result.current.selectedFile).toBe('index.html');
  });

  it('should select markdown if no HTML files', async () => {
    const mockGist = {
      id: 'abc123',
      description: 'Test',
      public: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      files: {
        'readme.md': {
          filename: 'readme.md',
          type: 'text/markdown',
          language: 'Markdown',
          raw_url: 'https://example.com/readme.md',
          size: 50,
          content: '# Readme',
        },
        'styles.css': {
          filename: 'styles.css',
          type: 'text/css',
          language: 'CSS',
          raw_url: 'https://example.com/styles.css',
          size: 50,
          content: 'body {}',
        },
      },
      owner: null,
      html_url: 'https://gist.github.com/abc123',
    };

    vi.mocked(gistApi.fetchGist).mockResolvedValueOnce({
      success: true,
      data: mockGist,
    });

    const { result } = renderHook(() => useGist());

    await act(async () => {
      await result.current.loadGist('abc123');
    });

    expect(result.current.selectedFile).toBe('readme.md');
  });

  it('should reset state correctly', async () => {
    const mockGist = {
      id: 'abc123',
      description: 'Test',
      public: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      files: {
        'index.html': {
          filename: 'index.html',
          type: 'text/html',
          language: 'HTML',
          raw_url: 'https://example.com/index.html',
          size: 100,
          content: '<!DOCTYPE html>',
        },
      },
      owner: null,
      html_url: 'https://gist.github.com/abc123',
    };

    vi.mocked(gistApi.fetchGist).mockResolvedValueOnce({
      success: true,
      data: mockGist,
    });

    const { result } = renderHook(() => useGist());

    await act(async () => {
      await result.current.loadGist('abc123');
    });

    expect(result.current.gist).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.gist).toBeNull();
    expect(result.current.selectedFile).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should allow setting selected file', async () => {
    const mockGist = {
      id: 'abc123',
      description: 'Test',
      public: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
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
      },
      owner: null,
      html_url: 'https://gist.github.com/abc123',
    };

    vi.mocked(gistApi.fetchGist).mockResolvedValueOnce({
      success: true,
      data: mockGist,
    });

    const { result } = renderHook(() => useGist());

    await act(async () => {
      await result.current.loadGist('abc123');
    });

    act(() => {
      result.current.setSelectedFile('styles.css');
    });

    expect(result.current.selectedFile).toBe('styles.css');
  });

  it('should compute files array from gist', async () => {
    const mockGist = {
      id: 'abc123',
      description: 'Test',
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
          content: 'content1',
        },
        'file2.txt': {
          filename: 'file2.txt',
          type: 'text/plain',
          language: null,
          raw_url: 'https://example.com/file2.txt',
          size: 10,
          content: 'content2',
        },
      },
      owner: null,
      html_url: 'https://gist.github.com/abc123',
    };

    vi.mocked(gistApi.fetchGist).mockResolvedValueOnce({
      success: true,
      data: mockGist,
    });

    const { result } = renderHook(() => useGist());

    await act(async () => {
      await result.current.loadGist('abc123');
    });

    expect(result.current.files).toHaveLength(2);
  });
});
