import { describe, it, expect } from 'vitest';
import {
  renderMarkdownToHtml,
  renderHtmlContent,
  renderCodeToHtml,
  renderJsonToHtml,
  renderTextToHtml,
  getRenderedContent,
  getInferredType,
} from '../contentRenderer';

describe('renderMarkdownToHtml', () => {
  it('should render markdown headers', () => {
    const result = renderMarkdownToHtml('# Hello World');
    expect(result).toContain('<h1');
    expect(result).toContain('Hello World');
    expect(result).toContain('<!DOCTYPE html>');
  });

  it('should render markdown paragraphs', () => {
    const result = renderMarkdownToHtml('This is a paragraph.');
    expect(result).toContain('<p>This is a paragraph.</p>');
  });

  it('should render markdown links', () => {
    const result = renderMarkdownToHtml('[Link](https://example.com)');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('Link');
  });

  it('should render markdown code blocks', () => {
    const result = renderMarkdownToHtml('```js\nconst x = 1;\n```');
    expect(result).toContain('<code');
    expect(result).toContain('const x = 1;');
  });

  it('should include proper styling', () => {
    const result = renderMarkdownToHtml('# Test');
    expect(result).toContain('<style>');
    expect(result).toContain('font-family');
    expect(result).toContain('markdown-body');
  });

  it('should render lists', () => {
    const result = renderMarkdownToHtml('- Item 1\n- Item 2');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
    expect(result).toContain('Item 1');
  });

  it('should render ordered lists', () => {
    const result = renderMarkdownToHtml('1. First\n2. Second');
    expect(result).toContain('<ol>');
    expect(result).toContain('<li>');
  });

  it('should render blockquotes', () => {
    const result = renderMarkdownToHtml('> This is a quote');
    expect(result).toContain('<blockquote>');
    expect(result).toContain('This is a quote');
  });

  it('should render inline code', () => {
    const result = renderMarkdownToHtml('Use `const` keyword');
    expect(result).toContain('<code>const</code>');
  });

  it('should render bold text', () => {
    const result = renderMarkdownToHtml('This is **bold** text');
    expect(result).toContain('<strong>bold</strong>');
  });

  it('should render italic text', () => {
    const result = renderMarkdownToHtml('This is *italic* text');
    expect(result).toContain('<em>italic</em>');
  });
});

describe('renderHtmlContent', () => {
  it('should return complete HTML documents as-is', () => {
    const html = '<!DOCTYPE html><html><head></head><body>Test</body></html>';
    const result = renderHtmlContent(html);
    expect(result).toBe(html);
  });

  it('should wrap partial HTML in a document structure', () => {
    const html = '<div>Hello World</div>';
    const result = renderHtmlContent(html);
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<div>Hello World</div>');
  });

  it('should detect <html> tag and return as-is', () => {
    const html = '<html><body>Test</body></html>';
    const result = renderHtmlContent(html);
    expect(result).toBe(html);
  });

  it('should handle whitespace around DOCTYPE', () => {
    const html = '  <!DOCTYPE html><html></html>';
    const result = renderHtmlContent(html);
    expect(result).toBe(html);
  });

  it('should add base styles to wrapped content', () => {
    const result = renderHtmlContent('<p>Test</p>');
    expect(result).toContain('box-sizing: border-box');
    expect(result).toContain('font-family');
  });
});

describe('renderCodeToHtml', () => {
  it('should render code with line numbers', () => {
    const result = renderCodeToHtml('line1\nline2\nline3', 'test.js');
    expect(result).toContain('class="line-number"');
    expect(result).toContain('1');
    expect(result).toContain('2');
    expect(result).toContain('3');
  });

  it('should display filename in header', () => {
    const result = renderCodeToHtml('const x = 1;', 'app.js');
    expect(result).toContain('app.js');
  });

  it('should display language badge', () => {
    const result = renderCodeToHtml('const x = 1;', 'test.js');
    expect(result).toContain('javascript');
  });

  it('should escape HTML in code', () => {
    const result = renderCodeToHtml('<div>Hello</div>', 'test.txt');
    expect(result).toContain('&lt;div&gt;');
    expect(result).toContain('&lt;/div&gt;');
  });

  it('should include proper styling', () => {
    const result = renderCodeToHtml('code', 'test.py');
    expect(result).toContain('font-family');
    expect(result).toContain('JetBrains Mono');
  });

  it('should handle empty lines', () => {
    const result = renderCodeToHtml('line1\n\nline3', 'test.js');
    expect(result).toContain('line1');
    expect(result).toContain('line3');
  });
});

describe('renderJsonToHtml', () => {
  it('should format valid JSON with proper indentation', () => {
    const result = renderJsonToHtml('{"name":"test","value":123}', 'data.json');
    expect(result).toContain('"name"');
    expect(result).toContain('"test"');
  });

  it('should add syntax highlighting for keys', () => {
    const result = renderJsonToHtml('{"key":"value"}', 'test.json');
    expect(result).toContain('json-key');
  });

  it('should add syntax highlighting for strings', () => {
    const result = renderJsonToHtml('{"key":"value"}', 'test.json');
    expect(result).toContain('json-string');
  });

  it('should add syntax highlighting for numbers', () => {
    const result = renderJsonToHtml('{"count": 42}', 'test.json');
    expect(result).toContain('json-number');
  });

  it('should add syntax highlighting for booleans', () => {
    const result = renderJsonToHtml('{"active": true}', 'test.json');
    expect(result).toContain('json-boolean');
  });

  it('should add syntax highlighting for null', () => {
    const result = renderJsonToHtml('{"value": null}', 'test.json');
    expect(result).toContain('json-null');
  });

  it('should handle invalid JSON gracefully', () => {
    const result = renderJsonToHtml('{invalid json}', 'test.json');
    expect(result).toContain('{invalid json}');
  });

  it('should display filename in header', () => {
    const result = renderJsonToHtml('{}', 'config.json');
    expect(result).toContain('config.json');
  });

  it('should show JSON language badge', () => {
    const result = renderJsonToHtml('{}', 'test.json');
    expect(result).toContain('JSON');
  });
});

describe('renderTextToHtml', () => {
  it('should render plain text with proper escaping', () => {
    const result = renderTextToHtml('<script>alert("xss")</script>', 'test.txt');
    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>alert');
  });

  it('should display filename in header', () => {
    const result = renderTextToHtml('content', 'readme.txt');
    expect(result).toContain('readme.txt');
  });

  it('should preserve whitespace', () => {
    const result = renderTextToHtml('line1\n  indented\n    more', 'test.txt');
    expect(result).toContain('white-space: pre-wrap');
  });

  it('should include proper styling', () => {
    const result = renderTextToHtml('text', 'test.txt');
    expect(result).toContain('font-family');
  });
});

describe('getRenderedContent', () => {
  it('should render HTML content for HTML files', () => {
    const result = getRenderedContent('<div>Hello</div>', 'index.html');
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<div>Hello</div>');
  });

  it('should render markdown for .md files', () => {
    const result = getRenderedContent('# Title', 'readme.md');
    expect(result).toContain('<h1');
    expect(result).toContain('Title');
  });

  it('should render JSON for .json files', () => {
    const result = getRenderedContent('{"key":"value"}', 'data.json');
    expect(result).toContain('json-key');
  });

  it('should render code for .js files', () => {
    const result = getRenderedContent('const x = 1;', 'app.js');
    expect(result).toContain('javascript');
    expect(result).toContain('line-number');
  });

  it('should render code for .css files', () => {
    const result = getRenderedContent('.test { color: red; }', 'styles.css');
    expect(result).toContain('line-number');
  });

  it('should render text for unknown file types', () => {
    const result = getRenderedContent('plain text content', 'notes.txt');
    expect(result).toContain('plain text content');
  });

  it('should infer type from content when extension is unknown', () => {
    const result = getRenderedContent('<!DOCTYPE html><html></html>', 'file');
    expect(result).toContain('<!DOCTYPE html>');
  });
});

describe('getInferredType', () => {
  it('should return html for HTML content', () => {
    expect(getInferredType('<!DOCTYPE html><html></html>', 'test')).toBe('html');
  });

  it('should return markdown for .md files', () => {
    expect(getInferredType('# Title', 'readme.md')).toBe('markdown');
  });

  it('should return json for .json files', () => {
    expect(getInferredType('{}', 'data.json')).toBe('json');
  });

  it('should return javascript for .js files', () => {
    expect(getInferredType('const x = 1;', 'app.js')).toBe('javascript');
  });

  it('should return css for .css files', () => {
    expect(getInferredType('.test {}', 'styles.css')).toBe('css');
  });

  it('should return text for plain text', () => {
    expect(getInferredType('just some text', 'notes.txt')).toBe('text');
  });
});
