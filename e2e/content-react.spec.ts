import { test, expect, createMockGistResponse, waitForIframeContent } from './fixtures/helpers';

test.describe('GistPreview - React/JSX Content', () => {
  test('should transpile and render simple JSX component', async ({ page }) => {
    const mockGistId = 'jsx-simple';
    const jsxContent = `function Hello() {
  return <h1>Hello from React!</h1>;
}

ReactDOM.render(<Hello />, document.getElementById('root'));`;
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockGistResponse(mockGistId, 'App.jsx', jsxContent, 'JavaScript')),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    // React component should be rendered
    const iframe = page.frameLocator('iframe');
    // Give it time to transpile and execute
    await page.waitForTimeout(1000);
    await expect(iframe.locator('body')).toContainText('Hello from React');
  });

  test('should handle JSX with state', async ({ page }) => {
    const mockGistId = 'jsx-state';
    const jsxContent = `function Counter() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

ReactDOM.render(<Counter />, document.getElementById('root'));`;
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockGistResponse(mockGistId, 'Counter.jsx', jsxContent, 'JavaScript')),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    await page.waitForTimeout(1000);
    
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('body')).toContainText('Count: 0');
  });

  test('should handle TSX files', async ({ page }) => {
    const mockGistId = 'tsx-test';
    const tsxContent = `interface Props {
  name: string;
}

function Greeting({ name }: Props) {
  return <h1>Hello, {name}!</h1>;
}

ReactDOM.render(<Greeting name="TypeScript" />, document.getElementById('root'));`;
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockGistResponse(mockGistId, 'Greeting.tsx', tsxContent, 'TypeScript')),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    await page.waitForTimeout(1000);
    
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('body')).toContainText('Hello, TypeScript!');
  });

  test('should handle JSX with multiple components', async ({ page }) => {
    const mockGistId = 'jsx-multi';
    const jsxContent = `function Header() {
  return <header><h1>My App</h1></header>;
}

function Footer() {
  return <footer><p>Footer Content</p></footer>;
}

function App() {
  return (
    <div>
      <Header />
      <main>Main content</main>
      <Footer />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));`;
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockGistResponse(mockGistId, 'MultiComponent.jsx', jsxContent, 'JavaScript')),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    await page.waitForTimeout(1000);
    
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('header h1')).toContainText('My App');
    await expect(iframe.locator('main')).toContainText('Main content');
    await expect(iframe.locator('footer p')).toContainText('Footer Content');
  });

  test('should handle JSX with props and children', async ({ page }) => {
    const mockGistId = 'jsx-props';
    const jsxContent = `function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  );
}

function App() {
  return (
    <Card title="Welcome">
      <p>This is the card content</p>
    </Card>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));`;
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockGistResponse(mockGistId, 'Card.jsx', jsxContent, 'JavaScript')),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    await page.waitForTimeout(1000);
    
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('.card h2')).toContainText('Welcome');
    await expect(iframe.locator('.card-body p')).toContainText('card content');
  });
});
