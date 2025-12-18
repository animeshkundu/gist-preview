/**
 * React/JSX transpilation module
 * Transforms JSX/TSX code to executable JavaScript using Babel standalone
 */

import { transform } from '@babel/standalone';

export interface TranspileResult {
  success: true;
  code: string;
}

export interface TranspileError {
  success: false;
  error: string;
  message: string;
}

export type TranspileOutput = TranspileResult | TranspileError;

/**
 * Transpile JSX/TSX code to plain JavaScript
 */
export function transpileReactCode(code: string, filename: string = 'component.jsx'): TranspileOutput {
  try {
    const isTsx = filename.endsWith('.tsx') || filename.endsWith('.ts');
    
    const result = transform(code, {
      filename,
      presets: [
        ['react', { runtime: 'automatic' }],
        ...(isTsx ? [['typescript', { isTSX: true, allExtensions: true }]] : []),
      ],
      retainLines: false,
    });

    if (!result || !result.code) {
      return {
        success: false,
        error: 'Transpilation failed',
        message: 'Babel returned no code output',
      };
    }

    return {
      success: true,
      code: result.code,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error.name || 'TranspileError',
      message: error.message || 'Unknown transpilation error',
    };
  }
}

/**
 * Extract and resolve imports from React code
 * Converts npm imports to CDN URLs (esm.sh)
 */
export function resolveImports(code: string): string {
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\w+))?)\s+from\s+['"]([^'"]+)['"]/g;
  
  const cdnMap: Record<string, string> = {
    'react': 'https://esm.sh/react@18.2.0',
    'react-dom': 'https://esm.sh/react-dom@18.2.0',
    'react-dom/client': 'https://esm.sh/react-dom@18.2.0/client',
  };

  return code.replace(importRegex, (match, packageName) => {
    // If it's a relative import, leave it as-is
    if (packageName.startsWith('.') || packageName.startsWith('/')) {
      return match;
    }

    // Map known packages to CDN URLs
    if (cdnMap[packageName]) {
      return match.replace(packageName, cdnMap[packageName]);
    }

    // For other npm packages, use esm.sh
    return match.replace(packageName, `https://esm.sh/${packageName}`);
  });
}

/**
 * Check if code needs React runtime injection
 */
export function needsReactRuntime(code: string): boolean {
  return /(?:import.*from\s+['"]react['"]|React\.|createElement|Component|useState|useEffect)/.test(code);
}

/**
 * Generate import map for the iframe
 */
export function generateImportMap(): string {
  return JSON.stringify({
    imports: {
      'react': 'https://esm.sh/react@18.2.0',
      'react-dom': 'https://esm.sh/react-dom@18.2.0',
      'react-dom/client': 'https://esm.sh/react-dom@18.2.0/client',
      'react/jsx-runtime': 'https://esm.sh/react@18.2.0/jsx-runtime',
      'react/jsx-dev-runtime': 'https://esm.sh/react@18.2.0/jsx-dev-runtime',
    }
  });
}
