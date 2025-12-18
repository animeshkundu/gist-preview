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
 * Wrap transpiled module code to capture exports as global variables
 */
function wrapModuleCode(code: string): string {
  // Remove import statements since React is provided globally
  let wrapped = code.replace(/import\s+.*?\s+from\s+['"]react['"]\s*;?\s*/g, '');
  wrapped = wrapped.replace(/import\s+.*?\s+from\s+['"]react-dom['"]\s*;?\s*/g, '');
  wrapped = wrapped.replace(/import\s+.*?\s+from\s+['"]react-dom\/client['"]\s*;?\s*/g, '');
  
  // Convert export default to global assignment
  wrapped = wrapped.replace(/export\s+default\s+/g, 'window.__DEFAULT_EXPORT__ = ');
  
  // Convert named exports to global assignments
  wrapped = wrapped.replace(/export\s+(?:const|let|var|function|class)\s+(\w+)/g, (match, name) => {
    return `${match.replace('export ', '')}; window.__NAMED_EXPORTS__ = window.__NAMED_EXPORTS__ || {}; window.__NAMED_EXPORTS__.${name} = ${name}`;
  });
  
  // Handle export { ... } syntax
  wrapped = wrapped.replace(/export\s*\{([^}]+)\}/g, (match, exports) => {
    const exportNames = exports.split(',').map((e: string) => e.trim());
    const assignments = exportNames.map((name: string) => {
      const parts = name.split(/\s+as\s+/);
      const localName = parts[0].trim();
      const exportName = parts[1] ? parts[1].trim() : localName;
      return `window.__NAMED_EXPORTS__.${exportName} = ${localName}`;
    }).join('; ');
    return `window.__NAMED_EXPORTS__ = window.__NAMED_EXPORTS__ || {}; ${assignments}`;
  });
  
  return wrapped;
}

/**
 * Transpile JSX/TSX code to plain JavaScript
 */
export function transpileReactCode(code: string, filename: string = 'component.jsx'): TranspileOutput {
  try {
    const isTsx = filename.endsWith('.tsx') || filename.endsWith('.ts');
    
    const result = transform(code, {
      filename,
      presets: [
        ['react', { runtime: 'classic' }],
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

    // Wrap the transpiled code to capture exports
    const wrappedCode = wrapModuleCode(result.code);

    return {
      success: true,
      code: wrappedCode,
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
