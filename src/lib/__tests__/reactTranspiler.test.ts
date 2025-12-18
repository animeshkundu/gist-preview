import { describe, it, expect } from 'vitest';
import { transpileReactCode, resolveImports, needsReactRuntime, generateImportMap } from '../reactTranspiler';

describe('reactTranspiler', () => {
  describe('transpileReactCode', () => {
    it('should transpile simple JSX', () => {
      const code = `
        function App() {
          return <div>Hello World</div>;
        }
      `;
      
      const result = transpileReactCode(code, 'App.jsx');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.code).toContain('React.createElement');
        expect(result.code).not.toContain('<div>');
        expect(result.code).not.toContain('import');
      }
    });

    it('should transpile JSX with props', () => {
      const code = `
        function Button({ label, onClick }) {
          return <button onClick={onClick}>{label}</button>;
        }
      `;
      
      const result = transpileReactCode(code, 'Button.jsx');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.code).toContain('React.createElement');
        expect(result.code).not.toContain('import');
      }
    });

    it('should handle TypeScript JSX', () => {
      const code = `
        interface Props {
          name: string;
        }
        
        function Greeting({ name }: Props) {
          return <h1>Hello {name}</h1>;
        }
      `;
      
      const result = transpileReactCode(code, 'Greeting.tsx');
      expect(result.success).toBe(true);
    });

    it('should return error for invalid syntax', () => {
      const code = 'function App() { return <div> }';
      
      const result = transpileReactCode(code, 'App.jsx');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
        expect(result.message).toBeTruthy();
      }
    });

    it('should transpile hooks', () => {
      const code = `
        import { useState } from 'react';
        
        function Counter() {
          const [count, setCount] = useState(0);
          return <button onClick={() => setCount(count + 1)}>{count}</button>;
        }
      `;
      
      const result = transpileReactCode(code, 'Counter.jsx');
      expect(result.success).toBe(true);
    });
  });

  describe('resolveImports', () => {
    it('should resolve React imports to CDN', () => {
      const code = `import React from 'react';`;
      const resolved = resolveImports(code);
      expect(resolved).toContain('https://esm.sh/react@18.2.0');
    });

    it('should resolve ReactDOM imports', () => {
      const code = `import ReactDOM from 'react-dom';`;
      const resolved = resolveImports(code);
      expect(resolved).toContain('https://esm.sh/react-dom@18.2.0');
    });

    it('should resolve react-dom/client', () => {
      const code = `import { createRoot } from 'react-dom/client';`;
      const resolved = resolveImports(code);
      expect(resolved).toContain('https://esm.sh/react-dom@18.2.0/client');
    });

    it('should preserve relative imports', () => {
      const code = `import Component from './Component';`;
      const resolved = resolveImports(code);
      expect(resolved).toBe(code);
    });

    it('should map unknown packages to esm.sh', () => {
      const code = `import lodash from 'lodash';`;
      const resolved = resolveImports(code);
      expect(resolved).toContain('https://esm.sh/lodash');
    });

    it('should handle multiple imports', () => {
      const code = `
        import React, { useState } from 'react';
        import { createRoot } from 'react-dom/client';
      `;
      const resolved = resolveImports(code);
      expect(resolved).toContain('https://esm.sh/react@18.2.0');
      expect(resolved).toContain('https://esm.sh/react-dom@18.2.0/client');
    });
  });

  describe('needsReactRuntime', () => {
    it('should detect React import', () => {
      expect(needsReactRuntime(`import React from 'react';`)).toBe(true);
    });

    it('should detect React usage', () => {
      expect(needsReactRuntime(`React.createElement('div')`)).toBe(true);
    });

    it('should detect hooks', () => {
      expect(needsReactRuntime(`const [state, setState] = useState(0);`)).toBe(true);
      expect(needsReactRuntime(`useEffect(() => {}, []);`)).toBe(true);
    });

    it('should detect Component class', () => {
      expect(needsReactRuntime(`class App extends Component {}`)).toBe(true);
    });

    it('should return false for plain JS', () => {
      expect(needsReactRuntime(`const x = 1;`)).toBe(false);
    });
  });

  describe('generateImportMap', () => {
    it('should generate valid import map JSON', () => {
      const importMap = generateImportMap();
      const parsed = JSON.parse(importMap);
      
      expect(parsed).toHaveProperty('imports');
      expect(parsed.imports).toHaveProperty('react');
      expect(parsed.imports).toHaveProperty('react-dom');
      expect(parsed.imports).toHaveProperty('react/jsx-runtime');
    });

    it('should map to esm.sh CDN', () => {
      const importMap = generateImportMap();
      expect(importMap).toContain('esm.sh');
    });
  });
});
