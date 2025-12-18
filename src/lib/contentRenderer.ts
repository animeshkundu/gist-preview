import { marked } from 'marked';
import { getFileExtension, getLanguageFromExtension } from './gistApi';
import { inferContentType, InferredContentType } from './contentTypeInference';
import { transpileReactCode, extractImports, generateImportMap, stripReactImports } from './reactTranspiler';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdownToHtml(content: string): string {
  const htmlContent = marked.parse(content, { async: false }) as string;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      line-height: 1.7;
      color: #e2e8f0;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 2.5rem;
      min-height: 100vh;
    }
    
    .markdown-body {
      max-width: 48rem;
      margin: 0 auto;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-weight: 600;
      line-height: 1.3;
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: #f1f5f9;
    }
    
    h1 { 
      font-size: 2.25rem; 
      border-bottom: 2px solid rgba(99, 102, 241, 0.4);
      padding-bottom: 0.75rem;
      margin-top: 0;
    }
    h2 { 
      font-size: 1.75rem;
      border-bottom: 1px solid rgba(99, 102, 241, 0.25);
      padding-bottom: 0.5rem;
    }
    h3 { font-size: 1.375rem; }
    h4 { font-size: 1.125rem; }
    h5 { font-size: 1rem; }
    h6 { font-size: 0.875rem; color: #94a3b8; }
    
    p { margin-bottom: 1rem; }
    
    a {
      color: #818cf8;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: all 0.2s ease;
    }
    
    a:hover {
      color: #a5b4fc;
      border-bottom-color: #a5b4fc;
    }
    
    code {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.875em;
      background: rgba(99, 102, 241, 0.15);
      padding: 0.2em 0.4em;
      border-radius: 0.375rem;
      color: #c4b5fd;
    }
    
    pre {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 0.75rem;
      padding: 1.25rem;
      overflow-x: auto;
      margin: 1.5rem 0;
      backdrop-filter: blur(8px);
    }
    
    pre code {
      background: transparent;
      padding: 0;
      font-size: 0.875rem;
      color: #e2e8f0;
      line-height: 1.6;
    }
    
    blockquote {
      border-left: 4px solid #6366f1;
      background: rgba(99, 102, 241, 0.1);
      margin: 1.5rem 0;
      padding: 1rem 1.5rem;
      border-radius: 0 0.5rem 0.5rem 0;
      color: #cbd5e1;
      font-style: italic;
    }
    
    blockquote p:last-child { margin-bottom: 0; }
    
    ul, ol {
      margin: 1rem 0;
      padding-left: 2rem;
    }
    
    li { margin: 0.5rem 0; }
    
    li::marker { color: #6366f1; }
    
    hr {
      border: none;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent);
      margin: 2.5rem 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.925rem;
    }
    
    th, td {
      border: 1px solid rgba(99, 102, 241, 0.2);
      padding: 0.75rem 1rem;
      text-align: left;
    }
    
    th {
      background: rgba(99, 102, 241, 0.15);
      font-weight: 600;
      color: #f1f5f9;
    }
    
    tr:nth-child(even) {
      background: rgba(99, 102, 241, 0.05);
    }
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: 0.75rem;
      margin: 1rem 0;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }
    
    .task-list-item {
      list-style: none;
      margin-left: -1.5rem;
    }
    
    .task-list-item input[type="checkbox"] {
      margin-right: 0.5rem;
      accent-color: #6366f1;
    }
  </style>
</head>
<body>
  <div class="markdown-body">${htmlContent}</div>
</body>
</html>`;
}

export function renderHtmlContent(content: string): string {
  const trimmed = content.trim();
  
  if (/^\s*<!DOCTYPE\s+html/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) {
    return content;
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}

export function renderCodeToHtml(content: string, filename: string): string {
  const ext = getFileExtension(filename);
  const language = getLanguageFromExtension(ext) || 'plaintext';
  const escapedContent = escapeHtml(content);
  const lines = escapedContent.split('\n');
  
  const lineNumbersHtml = lines.map((_, i) => 
    `<span class="line-number">${i + 1}</span>`
  ).join('\n');
  
  const codeHtml = lines.map((line, i) => 
    `<span class="code-line" data-line="${i + 1}">${line || ' '}</span>`
  ).join('\n');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
    }
    
    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
      border-bottom: 1px solid rgba(99, 102, 241, 0.2);
    }
    
    .file-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .file-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: #818cf8;
    }
    
    .file-name {
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 600;
      font-size: 0.875rem;
      color: #f1f5f9;
    }
    
    .language-badge {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.625rem;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 9999px;
      color: #a5b4fc;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .code-container {
      display: flex;
      overflow-x: auto;
      font-size: 0.875rem;
      line-height: 1.65;
    }
    
    .line-numbers {
      display: flex;
      flex-direction: column;
      padding: 1.25rem 0;
      background: rgba(99, 102, 241, 0.05);
      border-right: 1px solid rgba(99, 102, 241, 0.15);
      user-select: none;
      position: sticky;
      left: 0;
    }
    
    .line-number {
      padding: 0 1rem;
      text-align: right;
      color: #475569;
      min-width: 3.5rem;
    }
    
    .code-content {
      flex: 1;
      padding: 1.25rem 1.5rem;
      overflow-x: auto;
    }
    
    .code-line {
      display: block;
      white-space: pre;
    }
    
    .code-line:hover {
      background: rgba(99, 102, 241, 0.08);
      margin: 0 -1.5rem;
      padding: 0 1.5rem;
    }
    
    ::-webkit-scrollbar {
      height: 8px;
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.5);
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(99, 102, 241, 0.3);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(99, 102, 241, 0.5);
    }
  </style>
</head>
<body>
  <div class="code-header">
    <div class="file-info">
      <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
      <span class="file-name">${escapeHtml(filename)}</span>
    </div>
    <span class="language-badge">${language}</span>
  </div>
  <div class="code-container">
    <div class="line-numbers">${lineNumbersHtml}</div>
    <div class="code-content"><code>${codeHtml}</code></div>
  </div>
</body>
</html>`;
}

export function renderJsonToHtml(content: string, filename: string): string {
  let formattedJson: string;
  try {
    const parsed = JSON.parse(content);
    formattedJson = JSON.stringify(parsed, null, 2);
  } catch {
    formattedJson = content;
  }
  
  const highlighted = highlightJson(formattedJson);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
    }
    
    .json-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      background: linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%);
      border-bottom: 1px solid rgba(52, 211, 153, 0.2);
    }
    
    .file-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .file-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: #34d399;
    }
    
    .file-name {
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 600;
      font-size: 0.875rem;
      color: #f1f5f9;
    }
    
    .language-badge {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.625rem;
      background: rgba(52, 211, 153, 0.2);
      border: 1px solid rgba(52, 211, 153, 0.3);
      border-radius: 9999px;
      color: #6ee7b7;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .json-content {
      padding: 1.5rem;
      font-size: 0.875rem;
      line-height: 1.65;
      overflow-x: auto;
    }
    
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .json-key { color: #93c5fd; }
    .json-string { color: #86efac; }
    .json-number { color: #fcd34d; }
    .json-boolean { color: #f472b6; }
    .json-null { color: #a78bfa; }
    .json-punctuation { color: #64748b; }
    
    ::-webkit-scrollbar {
      height: 8px;
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.5);
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(52, 211, 153, 0.3);
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="json-header">
    <div class="file-info">
      <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14,2 14,8 20,8"/>
      </svg>
      <span class="file-name">${escapeHtml(filename)}</span>
    </div>
    <span class="language-badge">JSON</span>
  </div>
  <div class="json-content">
    <pre>${highlighted}</pre>
  </div>
</body>
</html>`;
}

export function renderTextToHtml(content: string, filename: string): string {
  const escapedContent = escapeHtml(content);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 2rem;
    }
    
    .text-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    }
    
    .file-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: #94a3b8;
    }
    
    .file-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: #f1f5f9;
    }
    
    .text-content {
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.7;
    }
  </style>
</head>
<body>
  <div class="text-header">
    <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14,2 14,8 20,8"/>
    </svg>
    <span class="file-name">${escapeHtml(filename)}</span>
  </div>
  <div class="text-content">${escapedContent}</div>
</body>
</html>`;
}

function highlightJson(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span><span class="json-punctuation">:</span>')
    .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (-?\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
    .replace(/: (null)/g, ': <span class="json-null">$1</span>')
    .replace(/([{}[\],])/g, '<span class="json-punctuation">$1</span>');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderReactToHtml(content: string, filename: string): string {
  const transpileResult = transpileReactCode(content, filename);
  
  if (!transpileResult.success) {
    return renderTranspileError(transpileResult.error, transpileResult.message, filename);
  }
  
  // Extract external dependencies (non-React packages)
  const externalDeps = extractImports(content);
  const importMap = generateImportMap(externalDeps);
  
  // Strip React imports from transpiled code (React will be global)
  const codeWithoutReactImports = stripReactImports(transpileResult.code);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script type="importmap">
${importMap}
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #1a202c;
      background: #f7fafc;
      min-height: 100vh;
    }
    
    #root {
      width: 100%;
      min-height: 100vh;
    }
    
    /* Error display styling */
    .react-error-boundary {
      padding: 2rem;
      background: #fff5f5;
      border: 2px solid #fc8181;
      border-radius: 0.5rem;
      margin: 2rem;
      font-family: monospace;
    }
    
    .react-error-boundary h2 {
      color: #c53030;
      margin-bottom: 1rem;
    }
    
    .react-error-boundary pre {
      background: #fff;
      padding: 1rem;
      border-radius: 0.375rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="module">
    // Import React ecosystem ONCE (wrapper imports)
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
    
    // Make React available globally for transpiled code
    window.React = React;
    window._jsx = jsx;
    window._jsxs = jsxs;
    window._Fragment = Fragment;
    
    // Error boundary class
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      
      render() {
        if (this.state.hasError) {
          return React.createElement('div', { className: 'react-error-boundary' },
            React.createElement('h2', null, 'Runtime Error'),
            React.createElement('pre', null, this.state.error?.stack || this.state.error?.toString())
          );
        }
        return this.props.children;
      }
    }
    
    // Global error handlers
    window.addEventListener('error', (event) => {
      const root = document.getElementById('root');
      if (root) {
        createRoot(root).render(
          React.createElement('div', { className: 'react-error-boundary' },
            React.createElement('h2', null, 'Runtime Error'),
            React.createElement('pre', null, event.error?.stack || event.message)
          )
        );
      }
      event.preventDefault();
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      const root = document.getElementById('root');
      if (root) {
        createRoot(root).render(
          React.createElement('div', { className: 'react-error-boundary' },
            React.createElement('h2', null, 'Unhandled Promise Rejection'),
            React.createElement('pre', null, event.reason?.stack || event.reason)
          )
        );
      }
      event.preventDefault();
    });
    
    // Transpiled user code (React imports stripped, external deps via import map)
    ${codeWithoutReactImports}
    
    // Render the component
    try {
      const root = document.getElementById('root');
      if (root) {
        const reactRoot = createRoot(root);
        
        // Try to find the component to render
        const Component = typeof __DEFAULT_EXPORT__ !== 'undefined' ? __DEFAULT_EXPORT__ :
                          typeof App !== 'undefined' ? App :
                          typeof __NAMED_EXPORTS__ !== 'undefined' && __NAMED_EXPORTS__.App ? __NAMED_EXPORTS__.App :
                          typeof Component !== 'undefined' ? Component :
                          null;
        
        if (Component) {
          reactRoot.render(
            React.createElement(ErrorBoundary, null,
              React.createElement(Component)
            )
          );
        } else {
          reactRoot.render(
            React.createElement('div', { 
              style: { 
                padding: '2rem', 
                textAlign: 'center',
                color: '#718096'
              } 
            }, [
              React.createElement('h2', { key: 'title' }, 'React Component Ready'),
              React.createElement('p', { key: 'msg' }, 'Export a default component or named App/Component to see it rendered.')
            ])
          );
        }
      }
    } catch (error) {
      const root = document.getElementById('root');
      if (root) {
        createRoot(root).render(
          React.createElement('div', { className: 'react-error-boundary' },
            React.createElement('h2', null, 'Execution Error'),
            React.createElement('pre', null, error?.stack || error?.toString())
          )
        );
      }
    }
  </script>
</body>
</html>`;
}

function renderTranspileError(errorName: string, errorMessage: string, filename: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 2rem;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .error-container {
      max-width: 48rem;
      background: rgba(254, 226, 226, 0.1);
      border: 2px solid rgba(239, 68, 68, 0.5);
      border-radius: 1rem;
      padding: 2rem;
      backdrop-filter: blur(10px);
    }
    
    .error-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .error-icon {
      width: 3rem;
      height: 3rem;
      color: #ef4444;
    }
    
    h1 {
      color: #fecaca;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .error-type {
      font-family: 'JetBrains Mono', monospace;
      color: #fca5a5;
      font-size: 0.875rem;
      background: rgba(239, 68, 68, 0.1);
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      display: inline-block;
      margin-bottom: 1rem;
    }
    
    .error-message {
      font-family: 'JetBrains Mono', monospace;
      color: #e2e8f0;
      background: rgba(15, 23, 42, 0.8);
      padding: 1.5rem;
      border-radius: 0.75rem;
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.6;
      font-size: 0.875rem;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    
    .filename {
      color: #94a3b8;
      font-size: 0.875rem;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-header">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h1>Transpilation Failed</h1>
    </div>
    <div class="error-type">${escapeHtml(errorName)}</div>
    <div class="error-message">${escapeHtml(errorMessage)}</div>
    <div class="filename">File: ${escapeHtml(filename)}</div>
  </div>
</body>
</html>`;
}

export function getRenderedContent(content: string, filename: string): string {
  const inferredType = inferContentType(content, filename);
  
  switch (inferredType) {
    case 'html':
      return renderHtmlContent(content);
    case 'markdown':
      return renderMarkdownToHtml(content);
    case 'react':
      return renderReactToHtml(content, filename);
    case 'json':
      return renderJsonToHtml(content, filename);
    case 'css':
    case 'javascript':
    case 'code':
      return renderCodeToHtml(content, filename);
    case 'text':
    default:
      return renderTextToHtml(content, filename);
  }
}

export function getInferredType(content: string, filename: string): InferredContentType {
  return inferContentType(content, filename);
}
