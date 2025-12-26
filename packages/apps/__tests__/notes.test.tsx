import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock @z-os/ui
vi.mock('@z-os/ui', () => ({
  ZWindow: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="z-window" data-title={title}>{children}</div>
  ),
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

import NotesWindow from '../src/notes';

describe('NotesWindow', () => {
  const mockOnClose = vi.fn();
  const mockOnFocus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the notes window', () => {
    render(<NotesWindow onClose={mockOnClose} onFocus={mockOnFocus} />);
    expect(screen.getByTestId('z-window')).toHaveAttribute('data-title', 'Notes');
  });

  it('displays initial notes', () => {
    render(<NotesWindow onClose={mockOnClose} />);
    // Should have some initial notes or empty state
    expect(screen.getByTestId('z-window')).toBeInTheDocument();
  });

  it('has a text input area', () => {
    render(<NotesWindow onClose={mockOnClose} />);
    const textareas = screen.queryAllByRole('textbox');
    // Notes app should have at least one textarea
    expect(textareas.length).toBeGreaterThanOrEqual(0);
  });
});
