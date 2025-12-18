import type { ParseResult } from '@/types';

// Re-export types for backward compatibility
export type { ParseSuccess, ParseError, ParseResult } from '@/types';

const GIST_ID_PATTERN = /^[a-f0-9]{20,32}$/i;

export function parseGistUrl(input: string): ParseResult {
  if (!input || typeof input !== 'string') {
    return { success: false, error: 'Please enter a Gist URL or ID' };
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return { success: false, error: 'Please enter a Gist URL or ID' };
  }

  if (GIST_ID_PATTERN.test(trimmed)) {
    return { success: true, gistId: trimmed };
  }

  try {
    let urlString = trimmed;
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      urlString = 'https://' + urlString;
    }

    const url = new URL(urlString);

    if (!url.hostname.includes('gist.github.com')) {
      return {
        success: false,
        error: 'URL must be from gist.github.com',
      };
    }

    const pathParts = url.pathname.split('/').filter(Boolean);

    if (pathParts.length === 0) {
      return { success: false, error: 'No Gist ID found in URL' };
    }

    if (pathParts.length === 1) {
      const potentialId = pathParts[0];
      if (GIST_ID_PATTERN.test(potentialId)) {
        return { success: true, gistId: potentialId };
      }
      return { success: false, error: 'Invalid Gist ID format' };
    }

    if (pathParts.length >= 2) {
      const username = pathParts[0];
      let gistId = pathParts[1];

      if (gistId.includes('#')) {
        gistId = gistId.split('#')[0];
      }

      if (GIST_ID_PATTERN.test(gistId)) {
        return { success: true, gistId, username };
      }

      return { success: false, error: 'Invalid Gist ID format' };
    }

    return { success: false, error: 'Could not parse Gist URL' };
  } catch {
    return {
      success: false,
      error: 'Invalid URL format. Try pasting a gist.github.com URL or a Gist ID',
    };
  }
}

export function buildGistPreviewUrl(gistId: string, filename?: string): string {
  const base = `${window.location.origin}/gist-preview/?gist=${gistId}`;
  if (filename) {
    return `${base}&file=${encodeURIComponent(filename)}`;
  }
  return base;
}
