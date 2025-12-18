import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchGist,
  getFilesByType,
  assemblePreviewHtml,
  getFileExtension,
  isRenderableFile,
  getLanguageFromExtension,
  GistFile,
} from '../gistApi';

describe('fetchGist', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch gist successfully', async () => {
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
          raw_url: 'https://gist.github.com/raw/...',
          size: 100,
          content: '<html></html>',
        },
      },
      owner: { login: 'testuser', avatar_url: 'https://example.com/avatar.png' },
      html_url: 'https://gist.github.com/testuser/abc123',
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGist),
    } as Response);

    const result = await fetchGist('abc123');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('abc123');
      expect(result.data.description).toBe('Test gist');
    }
  });

  it('should handle 404 error', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers(),
    } as Response);

    const result = await fetchGist('nonexistent');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Gist not found. It may be private or deleted.');
      expect(result.status).toBe(404);
    }
  });

  it('should handle rate limit error', async () => {
    const resetTime = Math.floor(Date.now() / 1000) + 3600;
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers({
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': resetTime.toString(),
      }),
    } as Response);

    const result = await fetchGist('abc123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Rate limited');
      expect(result.status).toBe(403);
      expect(result.retryAfter).toBeGreaterThan(0);
    }
  });

  it('should handle 403 without rate limit', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers(),
    } as Response);

    const result = await fetchGist('abc123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Access denied. This gist may be private.');
      expect(result.status).toBe(403);
    }
  });

  it('should handle other HTTP errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers(),
    } as Response);

    const result = await fetchGist('abc123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('GitHub API error (500)');
      expect(result.status).toBe(500);
    }
  });

  it('should handle network errors', async () => {
    const networkError = new TypeError('Failed to fetch');
    vi.mocked(global.fetch).mockRejectedValueOnce(networkError);

    const result = await fetchGist('abc123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Network error. Check your connection and try again.');
    }
  });

  it('should handle unexpected errors', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Unexpected error'));

    const result = await fetchGist('abc123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('An unexpected error occurred. Please try again.');
    }
  });
});

describe('getFilesByType', () => {
  const createFile = (filename: string): GistFile => ({
    filename,
    type: 'text/plain',
    language: null,
    raw_url: `https://gist.github.com/raw/${filename}`,
    size: 100,
    content: 'content',
  });

  it('should categorize HTML files', () => {
    const files = {
      'index.html': createFile('index.html'),
      'page.htm': createFile('page.htm'),
    };

    const result = getFilesByType(files);

    expect(result.html).toHaveLength(2);
    expect(result.css).toHaveLength(0);
    expect(result.js).toHaveLength(0);
    expect(result.other).toHaveLength(0);
  });

  it('should categorize CSS files', () => {
    const files = {
      'styles.css': createFile('styles.css'),
      'theme.css': createFile('theme.css'),
    };

    const result = getFilesByType(files);

    expect(result.css).toHaveLength(2);
  });

  it('should categorize JS files', () => {
    const files = {
      'app.js': createFile('app.js'),
      'utils.javascript': createFile('utils.javascript'),
    };

    const result = getFilesByType(files);

    expect(result.js).toHaveLength(2);
  });

  it('should categorize other files', () => {
    const files = {
      'readme.md': createFile('readme.md'),
      'config.json': createFile('config.json'),
    };

    const result = getFilesByType(files);

    expect(result.other).toHaveLength(2);
  });

  it('should handle mixed file types', () => {
    const files = {
      'index.html': createFile('index.html'),
      'styles.css': createFile('styles.css'),
      'app.js': createFile('app.js'),
      'readme.md': createFile('readme.md'),
    };

    const result = getFilesByType(files);

    expect(result.html).toHaveLength(1);
    expect(result.css).toHaveLength(1);
    expect(result.js).toHaveLength(1);
    expect(result.other).toHaveLength(1);
  });

  it('should handle empty files object', () => {
    const result = getFilesByType({});

    expect(result.html).toHaveLength(0);
    expect(result.css).toHaveLength(0);
    expect(result.js).toHaveLength(0);
    expect(result.other).toHaveLength(0);
  });
});

describe('assemblePreviewHtml', () => {
  const createCssFile = (content: string): GistFile => ({
    filename: 'styles.css',
    type: 'text/css',
    language: 'CSS',
    raw_url: 'https://example.com/styles.css',
    size: content.length,
    content,
  });

  const createJsFile = (content: string): GistFile => ({
    filename: 'app.js',
    type: 'application/javascript',
    language: 'JavaScript',
    raw_url: 'https://example.com/app.js',
    size: content.length,
    content,
  });

  it('should assemble HTML with CSS and JS for partial HTML', () => {
    const result = assemblePreviewHtml('<div>Hello</div>', [createCssFile('.test { color: red; }')], [createJsFile('console.log("hi");')]);

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<div>Hello</div>');
    expect(result).toContain('.test { color: red; }');
    expect(result).toContain('console.log("hi");');
  });

  it('should inject CSS into existing HTML structure', () => {
    const html = '<html><head></head><body><div>Content</div></body></html>';
    const result = assemblePreviewHtml(html, [createCssFile('body { margin: 0; }')], []);

    expect(result).toContain('<style>body { margin: 0; }</style></head>');
  });

  it('should inject JS into existing HTML structure', () => {
    const html = '<html><head></head><body><div>Content</div></body></html>';
    const result = assemblePreviewHtml(html, [], [createJsFile('alert("test");')]);

    expect(result).toContain('<script>alert("test");</script></body>');
  });

  it('should handle HTML without CSS or JS files', () => {
    const result = assemblePreviewHtml('<div>Hello</div>', [], []);

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<div>Hello</div>');
  });

  it('should not duplicate CSS if already present', () => {
    const css = 'body { margin: 0; }';
    const html = `<html><head><style>${css}</style></head><body></body></html>`;
    const result = assemblePreviewHtml(html, [createCssFile(css)], []);

    const styleCount = (result.match(/<style>/g) || []).length;
    expect(styleCount).toBe(1);
  });

  it('should not duplicate JS if already present', () => {
    const js = 'console.log("test");';
    const html = `<html><head></head><body><script>${js}</script></body></html>`;
    const result = assemblePreviewHtml(html, [], [createJsFile(js)]);

    const scriptCount = (result.match(/<script>/g) || []).length;
    expect(scriptCount).toBe(1);
  });
});

describe('getFileExtension', () => {
  it('should get extension from simple filename', () => {
    expect(getFileExtension('file.txt')).toBe('txt');
  });

  it('should get extension in lowercase', () => {
    expect(getFileExtension('file.TXT')).toBe('txt');
  });

  it('should handle multiple dots', () => {
    expect(getFileExtension('my.file.name.js')).toBe('js');
  });

  it('should return empty string for no extension', () => {
    expect(getFileExtension('README')).toBe('');
  });

  it('should handle hidden files with extension', () => {
    expect(getFileExtension('.gitignore')).toBe('gitignore');
  });
});

describe('isRenderableFile', () => {
  it('should return true for .html files', () => {
    expect(isRenderableFile('index.html')).toBe(true);
  });

  it('should return true for .htm files', () => {
    expect(isRenderableFile('page.htm')).toBe(true);
  });

  it('should return true for .md files', () => {
    expect(isRenderableFile('readme.md')).toBe(true);
  });

  it('should return true for .markdown files', () => {
    expect(isRenderableFile('doc.markdown')).toBe(true);
  });

  it('should return false for .js files', () => {
    expect(isRenderableFile('app.js')).toBe(false);
  });

  it('should return false for .css files', () => {
    expect(isRenderableFile('styles.css')).toBe(false);
  });

  it('should return false for .json files', () => {
    expect(isRenderableFile('config.json')).toBe(false);
  });
});

describe('getLanguageFromExtension', () => {
  const languageMappings: [string, string][] = [
    ['js', 'javascript'],
    ['jsx', 'javascript'],
    ['ts', 'typescript'],
    ['tsx', 'typescript'],
    ['py', 'python'],
    ['rb', 'ruby'],
    ['java', 'java'],
    ['c', 'c'],
    ['cpp', 'cpp'],
    ['cs', 'csharp'],
    ['go', 'go'],
    ['rs', 'rust'],
    ['php', 'php'],
    ['swift', 'swift'],
    ['kt', 'kotlin'],
    ['scala', 'scala'],
    ['sh', 'bash'],
    ['bash', 'bash'],
    ['zsh', 'bash'],
    ['sql', 'sql'],
    ['json', 'json'],
    ['xml', 'xml'],
    ['yaml', 'yaml'],
    ['yml', 'yaml'],
    ['toml', 'toml'],
    ['css', 'css'],
    ['scss', 'scss'],
    ['less', 'less'],
    ['html', 'html'],
    ['htm', 'html'],
    ['md', 'markdown'],
    ['markdown', 'markdown'],
  ];

  languageMappings.forEach(([ext, expected]) => {
    it(`should return "${expected}" for extension "${ext}"`, () => {
      expect(getLanguageFromExtension(ext)).toBe(expected);
    });
  });

  it('should return "plaintext" for unknown extensions', () => {
    expect(getLanguageFromExtension('xyz')).toBe('plaintext');
  });

  it('should return "plaintext" for empty string', () => {
    expect(getLanguageFromExtension('')).toBe('plaintext');
  });
});
