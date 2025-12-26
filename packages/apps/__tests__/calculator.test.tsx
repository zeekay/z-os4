import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock @z-os/sdk
vi.mock('@z-os/sdk', () => ({
  defineApp: (def: unknown) => def,
  ZOSApp: ({ children }: { children: React.ReactNode }) => <div data-testid="zos-app">{children}</div>,
  useSDK: () => ({
    keyboard: {
      register: vi.fn(() => vi.fn()),
    },
    clipboard: {
      writeText: vi.fn(),
      read: vi.fn(() => Promise.resolve({ text: '' })),
    },
    notifications: {
      show: vi.fn(),
    },
  }),
  createEditMenu: vi.fn(() => ({ id: 'edit', label: 'Edit', items: [] })),
  createViewMenu: vi.fn(() => ({ id: 'view', label: 'View', items: [] })),
  createWindowMenu: vi.fn(() => ({ id: 'window', label: 'Window', items: [] })),
  createHelpMenu: vi.fn(() => ({ id: 'help', label: 'Help', items: [] })),
  createDockContextMenu: vi.fn(() => []),
}));

// Mock @z-os/ui
vi.mock('@z-os/ui', () => ({
  ZWindow: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="z-window" data-title={title}>{children}</div>
  ),
}));

// Import after mocks
import CalculatorWindow, { CalculatorApp } from '../src/calculator';

// Helper to get the display element (first text-5xl span)
const getDisplay = (container: HTMLElement) => {
  return container.querySelector('.text-5xl');
};

describe('CalculatorWindow', () => {
  const mockOnClose = vi.fn();
  const mockOnFocus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the calculator with display showing 0', () => {
    const { container } = render(<CalculatorWindow onClose={mockOnClose} onFocus={mockOnFocus} />);
    const display = getDisplay(container);
    expect(display).toHaveTextContent('0');
  });

  it('renders all number buttons', () => {
    render(<CalculatorWindow onClose={mockOnClose} />);
    for (let i = 0; i <= 9; i++) {
      // Each number should be a button
      const buttons = screen.getAllByText(String(i));
      expect(buttons.length).toBeGreaterThan(0);
    }
  });

  it('renders all operator buttons', () => {
    render(<CalculatorWindow onClose={mockOnClose} />);
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('−')).toBeInTheDocument();
    expect(screen.getByText('×')).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();
    expect(screen.getByText('=')).toBeInTheDocument();
  });

  it('renders function buttons', () => {
    render(<CalculatorWindow onClose={mockOnClose} />);
    expect(screen.getByText('AC')).toBeInTheDocument();
    expect(screen.getByText('+/-')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByText('.')).toBeInTheDocument();
  });

  it('displays entered digits', async () => {
    const { container } = render(<CalculatorWindow onClose={mockOnClose} />);
    const user = userEvent.setup();
    const display = getDisplay(container);

    await user.click(screen.getByRole('button', { name: '5' }));
    expect(display).toHaveTextContent('5');

    await user.click(screen.getByRole('button', { name: '3' }));
    expect(display).toHaveTextContent('53');
  });

  it('performs addition', async () => {
    const { container } = render(<CalculatorWindow onClose={mockOnClose} />);
    const user = userEvent.setup();
    const display = getDisplay(container);

    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: '+' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '=' }));

    expect(display).toHaveTextContent('8');
  });

  it('performs subtraction', async () => {
    const { container } = render(<CalculatorWindow onClose={mockOnClose} />);
    const user = userEvent.setup();
    const display = getDisplay(container);

    await user.click(screen.getByRole('button', { name: '9' }));
    await user.click(screen.getByRole('button', { name: '−' }));
    await user.click(screen.getByRole('button', { name: '4' }));
    await user.click(screen.getByRole('button', { name: '=' }));

    expect(display).toHaveTextContent('5');
  });

  it('performs multiplication', async () => {
    const { container } = render(<CalculatorWindow onClose={mockOnClose} />);
    const user = userEvent.setup();
    const display = getDisplay(container);

    await user.click(screen.getByRole('button', { name: '6' }));
    await user.click(screen.getByRole('button', { name: '×' }));
    await user.click(screen.getByRole('button', { name: '7' }));
    await user.click(screen.getByRole('button', { name: '=' }));

    expect(display).toHaveTextContent('42');
  });

  it('performs division', async () => {
    const { container } = render(<CalculatorWindow onClose={mockOnClose} />);
    const user = userEvent.setup();
    const display = getDisplay(container);

    await user.click(screen.getByRole('button', { name: '8' }));
    await user.click(screen.getByRole('button', { name: '/' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '=' }));

    expect(display).toHaveTextContent('4');
  });

  it('handles decimal input', async () => {
    const { container } = render(<CalculatorWindow onClose={mockOnClose} />);
    const user = userEvent.setup();
    const display = getDisplay(container);

    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '.' }));
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '4' }));

    expect(display).toHaveTextContent('3.14');
  });

  it('prevents multiple decimal points', async () => {
    const { container } = render(<CalculatorWindow onClose={mockOnClose} />);
    const user = userEvent.setup();
    const display = getDisplay(container);

    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '.' }));
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '.' }));
    await user.click(screen.getByRole('button', { name: '4' }));

    expect(display).toHaveTextContent('3.14');
  });

  it('clears display with AC/C button', async () => {
    const { container } = render(<CalculatorWindow onClose={mockOnClose} />);
    const user = userEvent.setup();
    const display = getDisplay(container);

    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'AC' }));

    expect(display).toHaveTextContent('0');
  });

  it('toggles sign with +/- button', async () => {
    const { container } = render(<CalculatorWindow onClose={mockOnClose} />);
    const user = userEvent.setup();
    const display = getDisplay(container);

    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: '+/-' }));

    expect(display).toHaveTextContent('-5');
  });

  it('calculates percentage', async () => {
    const { container } = render(<CalculatorWindow onClose={mockOnClose} />);
    const user = userEvent.setup();
    const display = getDisplay(container);

    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByRole('button', { name: '%' }));

    expect(display).toHaveTextContent('0.5');
  });

  it('chains operations', async () => {
    const { container } = render(<CalculatorWindow onClose={mockOnClose} />);
    const user = userEvent.setup();
    const display = getDisplay(container);

    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '+' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '×' }));
    // At this point 2+3=5 should be calculated
    await user.click(screen.getByRole('button', { name: '4' }));
    await user.click(screen.getByRole('button', { name: '=' }));

    expect(display).toHaveTextContent('20');
  });
});

describe('CalculatorApp', () => {
  it('has correct manifest properties', () => {
    expect(CalculatorApp.manifest.identifier).toBe('ai.hanzo.calculator');
    expect(CalculatorApp.manifest.name).toBe('Calculator');
    expect(CalculatorApp.manifest.version).toBe('1.0.0');
    expect(CalculatorApp.manifest.category).toBe('utilities');
  });

  it('has window configuration', () => {
    expect(CalculatorApp.manifest.window).toBeDefined();
    expect(CalculatorApp.manifest.window?.type).toBe('system');
    expect(CalculatorApp.manifest.window?.resizable).toBe(false);
    expect(CalculatorApp.manifest.window?.defaultSize).toEqual({ width: 240, height: 360 });
  });

  it('has icon component', () => {
    expect(CalculatorApp.icon).toBeDefined();
  });

  it('has component defined', () => {
    expect(CalculatorApp.component).toBeDefined();
  });
});
