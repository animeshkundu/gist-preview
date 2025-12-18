import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GistInput } from '../GistInput';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('GistInput', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render input field', () => {
    render(<GistInput onSubmit={mockOnSubmit} />);
    expect(screen.getByPlaceholderText(/paste a github gist url/i)).toBeInTheDocument();
  });

  it('should render preview button', () => {
    render(<GistInput onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
  });

  it('should call onSubmit with valid gist ID', async () => {
    const user = userEvent.setup();
    render(<GistInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/paste a github gist url/i);
    await user.type(input, 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4');
    
    const button = screen.getByRole('button', { name: /preview/i });
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4');
  });

  it('should call onSubmit with gist ID from URL', async () => {
    const user = userEvent.setup();
    render(<GistInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/paste a github gist url/i);
    await user.type(input, 'https://gist.github.com/user/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4');
    
    const button = screen.getByRole('button', { name: /preview/i });
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4');
  });

  it('should show error for empty input', async () => {
    const user = userEvent.setup();
    render(<GistInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/paste a github gist url/i);
    await user.type(input, 'a');
    await user.clear(input);

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(await screen.findByText(/please enter a gist url or id/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show error for invalid URL', async () => {
    const user = userEvent.setup();
    render(<GistInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/paste a github gist url/i);
    await user.type(input, 'https://github.com/user/repo');
    
    const button = screen.getByRole('button', { name: /preview/i });
    await user.click(button);

    expect(await screen.findByText(/url must be from gist.github.com/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should clear error when typing', async () => {
    const user = userEvent.setup();
    render(<GistInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/paste a github gist url/i);
    await user.type(input, 'invalid');
    
    const button = screen.getByRole('button', { name: /preview/i });
    await user.click(button);

    expect(await screen.findByText(/url must be from gist.github.com/i)).toBeInTheDocument();

    await user.type(input, 'x');

    expect(screen.queryByText(/url must be from gist.github.com/i)).not.toBeInTheDocument();
  });

  it('should submit on Enter key', async () => {
    const user = userEvent.setup();
    render(<GistInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/paste a github gist url/i);
    await user.type(input, 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4');
    
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSubmit).toHaveBeenCalledWith('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4');
  });

  it('should show loading state', () => {
    render(<GistInput onSubmit={mockOnSubmit} loading={true} />);

    const input = screen.getByPlaceholderText(/paste a github gist url/i);
    expect(input).toBeDisabled();

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should show external error', () => {
    render(<GistInput onSubmit={mockOnSubmit} error="API Error occurred" />);

    expect(screen.getByText('API Error occurred')).toBeInTheDocument();
  });

  it('should disable button when input is empty', () => {
    render(<GistInput onSubmit={mockOnSubmit} />);

    const button = screen.getByRole('button', { name: /preview/i });
    expect(button).toBeDisabled();
  });

  it('should enable button when input has value', async () => {
    const user = userEvent.setup();
    render(<GistInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/paste a github gist url/i);
    await user.type(input, 'test');

    const button = screen.getByRole('button', { name: /preview/i });
    expect(button).not.toBeDisabled();
  });

  it('should show clear button when input has value', async () => {
    const user = userEvent.setup();
    render(<GistInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/paste a github gist url/i);
    await user.type(input, 'test');

    const clearButtons = screen.getAllByRole('button');
    expect(clearButtons.length).toBeGreaterThan(1);
  });

  it('should clear input when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<GistInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/paste a github gist url/i) as HTMLInputElement;
    await user.type(input, 'test value');

    expect(input.value).toBe('test value');

    const buttons = screen.getAllByRole('button');
    const clearButton = buttons.find(btn => btn.querySelector('svg'));
    if (clearButton && clearButton !== buttons[buttons.length - 1]) {
      await user.click(clearButton);
    }
  });

  it('should render example text', () => {
    render(<GistInput onSubmit={mockOnSubmit} />);

    expect(screen.getByText(/example:/i)).toBeInTheDocument();
  });
});
