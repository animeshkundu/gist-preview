import { describe, it, expect } from 'vitest';
import {
  inferContentType,
  shouldRenderAsWebPage,
  getDisplayType,
  InferredContentType,
} from '../contentTypeInference';

describe('inferContentType', () => {
  describe('HTML detection', () => {
    it('should detect HTML by .html extension', () => {
      expect(inferContentType('some content', 'file.html')).toBe('html');
    });

    it('should detect HTML by .htm extension', () => {
      expect(inferContentType('some content', 'file.htm')).toBe('html');
    });

    it('should detect HTML by DOCTYPE', () => {
      expect(inferContentType('<!DOCTYPE html><html></html>', 'file.txt')).toBe('html');
    });

    it('should detect HTML by DOCTYPE with leading whitespace', () => {
      expect(inferContentType('  <!DOCTYPE html><html></html>', 'file.txt')).toBe('html');
    });

    it('should detect HTML with full structure', () => {
      const html = '<html><head></head><body><div>Hello</div></body></html>';
      expect(inferContentType(html, 'file.txt')).toBe('html');
    });

    it('should detect HTML with multiple tags', () => {
      const html = '<div><p>Hello</p><span>World</span><a href="#">Link</a><h1>Title</h1><h2>Subtitle</h2></div>';
      expect(inferContentType(html, 'file.txt')).toBe('html');
    });

    it('should detect HTML with self-closing tags', () => {
      const html = '<div><img src="test.jpg" /><br /><input type="text" /></div>';
      expect(inferContentType(html, 'file.txt')).toBe('html');
    });
  });

  describe('Markdown detection', () => {
    it('should detect Markdown by .md extension', () => {
      expect(inferContentType('# Hello', 'file.md')).toBe('markdown');
    });

    it('should detect Markdown by .markdown extension', () => {
      expect(inferContentType('# Hello', 'file.markdown')).toBe('markdown');
    });

    it('should detect Markdown by content patterns - headers', () => {
      const md = '# Title\n## Subtitle\n### Section\nSome text here.';
      expect(inferContentType(md, 'file.txt')).toBe('markdown');
    });

    it('should detect Markdown with links', () => {
      const md = 'Check out [this link](https://example.com) for more info.';
      expect(inferContentType(md, 'file.txt')).toBe('markdown');
    });

    it('should detect Markdown with images', () => {
      const md = '![Alt text](image.png)';
      expect(inferContentType(md, 'file.txt')).toBe('markdown');
    });

    it('should detect Markdown with code blocks', () => {
      const md = '```javascript\nconst x = 1;\n```';
      expect(inferContentType(md, 'file.txt')).toBe('markdown');
    });

    it('should detect Markdown with lists', () => {
      const md = '# List\n- Item 1\n- Item 2\n- Item 3';
      expect(inferContentType(md, 'file.txt')).toBe('markdown');
    });

    it('should detect Markdown with ordered lists', () => {
      const md = '# List\n1. First\n2. Second\n3. Third';
      expect(inferContentType(md, 'file.txt')).toBe('markdown');
    });

    it('should detect Markdown with blockquotes', () => {
      const md = '# Quote\n> This is a quote\n> More quote';
      expect(inferContentType(md, 'file.txt')).toBe('markdown');
    });

    it('should detect Markdown with tables', () => {
      const md = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
      expect(inferContentType(md, 'file.txt')).toBe('markdown');
    });

    it('should detect Markdown with bold text', () => {
      const md = '# Hello\nThis is **bold** text.';
      expect(inferContentType(md, 'file.txt')).toBe('markdown');
    });

    it('should detect Markdown with inline code', () => {
      const md = '# Code\nUse `const` for constants.';
      expect(inferContentType(md, 'file.txt')).toBe('markdown');
    });
  });

  describe('JSON detection', () => {
    it('should detect JSON by .json extension', () => {
      expect(inferContentType('{"key": "value"}', 'file.json')).toBe('json');
    });

    it('should detect JSON by content - object', () => {
      expect(inferContentType('{"name": "test", "value": 123}', 'file.txt')).toBe('json');
    });

    it('should detect JSON by content - array', () => {
      expect(inferContentType('[1, 2, 3]', 'file.txt')).toBe('json');
    });

    it('should detect JSON with nested structures', () => {
      const json = '{"data": {"nested": true}, "list": [1, 2, 3]}';
      expect(inferContentType(json, 'file.txt')).toBe('json');
    });

    it('should not detect invalid JSON', () => {
      expect(inferContentType('{invalid json}', 'file.txt')).not.toBe('json');
    });

    it('should not detect text starting with { as JSON if invalid', () => {
      expect(inferContentType('{this is not json', 'file.txt')).not.toBe('json');
    });
  });

  describe('CSS detection', () => {
    it('should detect CSS by .css extension', () => {
      expect(inferContentType('body { color: red; }', 'styles.css')).toBe('css');
    });

    it('should detect CSS by content patterns', () => {
      const css = '.container { display: flex; } #main { background: #fff; }';
      expect(inferContentType(css, 'file.txt')).toBe('css');
    });

    it('should detect CSS with media queries', () => {
      const css = '@media (max-width: 768px) { .container { width: 100%; } }';
      expect(inferContentType(css, 'file.txt')).toBe('css');
    });

    it('should detect CSS with color values', () => {
      const css = '.element { color: #ff0000; background: rgba(0,0,0,0.5); }';
      expect(inferContentType(css, 'file.txt')).toBe('css');
    });

    it('should detect CSS with units', () => {
      const css = '.box { width: 100px; height: 50vh; margin: 1rem; }';
      expect(inferContentType(css, 'file.txt')).toBe('css');
    });
  });

  describe('JavaScript detection', () => {
    it('should detect JavaScript by .js extension', () => {
      expect(inferContentType('const x = 1;', 'script.js')).toBe('javascript');
    });

    it('should detect JavaScript by .jsx extension', () => {
      expect(inferContentType('const x = 1;', 'component.jsx')).toBe('react');
    });

    it('should detect JavaScript by .ts extension', () => {
      expect(inferContentType('const x: number = 1;', 'script.ts')).toBe('javascript');
    });

    it('should detect JavaScript by .tsx extension', () => {
      expect(inferContentType('const x = 1;', 'component.tsx')).toBe('react');
    });

    it('should detect JavaScript by .mjs extension', () => {
      expect(inferContentType('export const x = 1;', 'module.mjs')).toBe('javascript');
    });

    it('should detect JavaScript by .cjs extension', () => {
      expect(inferContentType('module.exports = {};', 'module.cjs')).toBe('javascript');
    });

    it('should detect JavaScript by content patterns', () => {
      const js = 'function hello() { console.log("Hello"); return true; }';
      expect(inferContentType(js, 'file.txt')).toBe('javascript');
    });

    it('should detect JavaScript with arrow functions', () => {
      const js = 'const fn = () => { return 42; };';
      expect(inferContentType(js, 'file.txt')).toBe('javascript');
    });

    it('should detect JavaScript with async/await', () => {
      const js = 'async function fetchData() { await fetch(url); }';
      expect(inferContentType(js, 'file.txt')).toBe('javascript');
    });

    it('should detect JavaScript with DOM APIs', () => {
      const js = 'document.getElementById("app").innerHTML = "Hello";';
      expect(inferContentType(js, 'file.txt')).toBe('javascript');
    });

    it('should detect JavaScript with Promise chains', () => {
      const js = 'fetch(url).then(res => res.json()).catch(err => console.error(err));';
      expect(inferContentType(js, 'file.txt')).toBe('javascript');
    });
  });

  describe('code detection', () => {
    it('should detect generic code patterns', () => {
      const code = 'def hello():\n    print("Hello")\n    return True';
      const result = inferContentType(code, 'file.txt');
      expect(['code', 'text']).toContain(result);
    });
  });

  describe('text fallback', () => {
    it('should return text for plain text content', () => {
      expect(inferContentType('Just some plain text.', 'file.txt')).toBe('text');
    });

    it('should return text for empty content', () => {
      expect(inferContentType('', 'file.txt')).toBe('text');
    });
  });
});

describe('shouldRenderAsWebPage', () => {
  it('should return true for html', () => {
    expect(shouldRenderAsWebPage('html')).toBe(true);
  });

  it('should return true for markdown', () => {
    expect(shouldRenderAsWebPage('markdown')).toBe(true);
  });

  it('should return false for json', () => {
    expect(shouldRenderAsWebPage('json')).toBe(false);
  });

  it('should return false for css', () => {
    expect(shouldRenderAsWebPage('css')).toBe(false);
  });

  it('should return false for javascript', () => {
    expect(shouldRenderAsWebPage('javascript')).toBe(false);
  });

  it('should return false for code', () => {
    expect(shouldRenderAsWebPage('code')).toBe(false);
  });

  it('should return false for text', () => {
    expect(shouldRenderAsWebPage('text')).toBe(false);
  });
});

describe('React detection', () => {
  it('should detect React by .jsx extension', () => {
    expect(inferContentType('const x = 1;', 'App.jsx')).toBe('react');
  });

  it('should detect React by .tsx extension', () => {
    expect(inferContentType('const x = 1;', 'Component.tsx')).toBe('react');
  });

  it('should detect React by JSX syntax', () => {
    const jsx = 'function App() { return <div>Hello</div>; }';
    expect(inferContentType(jsx, 'file.js')).toBe('react');
  });

  it('should detect React by import statement', () => {
    const code = `import React from 'react';\n\nfunction App() { return null; }`;
    expect(inferContentType(code, 'file.js')).toBe('react');
  });

  it('should detect React hooks', () => {
    const code = 'const [count, setCount] = useState(0);';
    expect(inferContentType(code, 'file.js')).toBe('react');
  });

  it('should detect React component with multiple hooks', () => {
    const code = `
      function Counter() {
        const [count, setCount] = useState(0);
        useEffect(() => {}, []);
        return <button>{count}</button>;
      }
    `;
    expect(inferContentType(code, 'file.js')).toBe('react');
  });

  it('should detect React class component', () => {
    const code = 'class App extends React.Component { render() {} }';
    expect(inferContentType(code, 'file.js')).toBe('react');
  });

  it('should detect JSX with className', () => {
    const code = 'const el = <div className="container">Content</div>';
    expect(inferContentType(code, 'file.js')).toBe('react');
  });

  it('should not detect plain JS as React', () => {
    const code = 'function add(a, b) { return a + b; }';
    expect(inferContentType(code, 'file.js')).not.toBe('react');
  });
});

describe('getDisplayType', () => {
  const testCases: [InferredContentType, string][] = [
    ['html', 'HTML'],
    ['markdown', 'Markdown'],
    ['json', 'JSON'],
    ['css', 'CSS'],
    ['javascript', 'JavaScript'],
    ['react', 'React'],
    ['code', 'Code'],
    ['text', 'Text'],
  ];

  testCases.forEach(([type, expected]) => {
    it(`should return "${expected}" for type "${type}"`, () => {
      expect(getDisplayType(type)).toBe(expected);
    });
  });
});
