import { describe, it, expect } from 'vitest';
import { parseGistUrl, buildGistPreviewUrl } from '../parseGistUrl';

describe('parseGistUrl', () => {
  describe('valid inputs', () => {
    it('should parse a valid 32-character gist ID', () => {
      const result = parseGistUrl('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.gistId).toBe('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4');
      }
    });

    it('should parse a valid 20-character gist ID', () => {
      const result = parseGistUrl('a1b2c3d4e5f6a1b2c3d4');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.gistId).toBe('a1b2c3d4e5f6a1b2c3d4');
      }
    });

    it('should parse a full gist URL with username', () => {
      const result = parseGistUrl('https://gist.github.com/octocat/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.gistId).toBe('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4');
        expect(result.username).toBe('octocat');
      }
    });

    it('should parse gist URL without https prefix', () => {
      const result = parseGistUrl('gist.github.com/user/a1b2c3d4e5f6a1b2c3d4');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.gistId).toBe('a1b2c3d4e5f6a1b2c3d4');
      }
    });

    it('should parse gist URL with http prefix', () => {
      const result = parseGistUrl('http://gist.github.com/user/a1b2c3d4e5f6a1b2c3d4');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.gistId).toBe('a1b2c3d4e5f6a1b2c3d4');
      }
    });

    it('should parse gist URL with hash fragment', () => {
      const result = parseGistUrl('https://gist.github.com/user/a1b2c3d4e5f6a1b2c3d4#file-readme-md');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.gistId).toBe('a1b2c3d4e5f6a1b2c3d4');
      }
    });

    it('should parse gist URL with only gist ID in path', () => {
      const result = parseGistUrl('https://gist.github.com/a1b2c3d4e5f6a1b2c3d4');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.gistId).toBe('a1b2c3d4e5f6a1b2c3d4');
      }
    });

    it('should handle whitespace around input', () => {
      const result = parseGistUrl('  a1b2c3d4e5f6a1b2c3d4  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.gistId).toBe('a1b2c3d4e5f6a1b2c3d4');
      }
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty string', () => {
      const result = parseGistUrl('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Please enter a Gist URL or ID');
      }
    });

    it('should reject null input', () => {
      const result = parseGistUrl(null as unknown as string);
      expect(result.success).toBe(false);
    });

    it('should reject undefined input', () => {
      const result = parseGistUrl(undefined as unknown as string);
      expect(result.success).toBe(false);
    });

    it('should reject whitespace-only input', () => {
      const result = parseGistUrl('   ');
      expect(result.success).toBe(false);
    });

    it('should reject non-gist github URL', () => {
      const result = parseGistUrl('https://github.com/user/repo');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('URL must be from gist.github.com');
      }
    });

    it('should reject gist URL with no ID', () => {
      const result = parseGistUrl('https://gist.github.com/');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('No Gist ID found in URL');
      }
    });

    it('should reject invalid gist ID format (too short)', () => {
      const result = parseGistUrl('abc123');
      expect(result.success).toBe(false);
    });

    it('should reject invalid gist ID format (too long)', () => {
      const result = parseGistUrl('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6');
      expect(result.success).toBe(false);
    });

    it('should reject invalid gist ID with special characters', () => {
      const result = parseGistUrl('a1b2c3d4e5f6a1b2c3d4-special');
      expect(result.success).toBe(false);
    });

    it('should reject invalid URL path with username but invalid ID', () => {
      const result = parseGistUrl('https://gist.github.com/user/notvalid');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid Gist ID format');
      }
    });

    it('should reject single path segment that is not a valid ID', () => {
      const result = parseGistUrl('https://gist.github.com/invalidid');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid Gist ID format');
      }
    });
  });
});

describe('buildGistPreviewUrl', () => {
  it('should build URL with gist ID only', () => {
    const url = buildGistPreviewUrl('abc123def456abc123de');
    expect(url).toBe('http://localhost:3000?gist=abc123def456abc123de');
  });

  it('should build URL with gist ID and filename', () => {
    const url = buildGistPreviewUrl('abc123def456abc123de', 'index.html');
    expect(url).toBe('http://localhost:3000?gist=abc123def456abc123de&file=index.html');
  });

  it('should encode special characters in filename', () => {
    const url = buildGistPreviewUrl('abc123def456abc123de', 'my file.html');
    expect(url).toBe('http://localhost:3000?gist=abc123def456abc123de&file=my%20file.html');
  });

  it('should handle empty filename', () => {
    const url = buildGistPreviewUrl('abc123def456abc123de', '');
    expect(url).toBe('http://localhost:3000?gist=abc123def456abc123de');
  });

  it('should handle undefined filename', () => {
    const url = buildGistPreviewUrl('abc123def456abc123de', undefined);
    expect(url).toBe('http://localhost:3000?gist=abc123def456abc123de');
  });
});
