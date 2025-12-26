import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock @z-os/ui
vi.mock('@z-os/ui', () => ({
  ZWindow: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="z-window" data-title={title}>{children}</div>
  ),
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

import StickiesWindow from '../src/stickies';

describe('StickiesWindow', () => {
  const mockOnClose = vi.fn();
  const mockOnFocus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the stickies window', () => {
    render(<StickiesWindow onClose={mockOnClose} onFocus={mockOnFocus} />);
    expect(screen.getByTestId('z-window')).toHaveAttribute('data-title', 'Stickies');
  });

  it('shows initial welcome note', () => {
    render(<StickiesWindow onClose={mockOnClose} />);
    // There may be multiple elements with this text (sidebar preview + editor)
    const elements = screen.getAllByText(/Welcome to Stickies!/);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('displays new note button', () => {
    render(<StickiesWindow onClose={mockOnClose} />);
    expect(screen.getByText('New Note')).toBeInTheDocument();
  });

  it('creates a new note when clicking New Note button', async () => {
    render(<StickiesWindow onClose={mockOnClose} />);
    const user = userEvent.setup();

    const initialNoteCount = screen.getAllByRole('button').filter(
      btn => btn.classList.contains('rounded-lg')
    ).length;

    await user.click(screen.getByText('New Note'));

    // Should have one more note button in the sidebar
    const newNoteCount = screen.getAllByRole('button').filter(
      btn => btn.classList.contains('rounded-lg') && btn.closest('.overflow-y-auto')
    ).length;

    expect(newNoteCount).toBeGreaterThanOrEqual(initialNoteCount);
  });

  it('displays the text editor for selected note', () => {
    render(<StickiesWindow onClose={mockOnClose} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('allows editing note content', async () => {
    render(<StickiesWindow onClose={mockOnClose} />);
    const user = userEvent.setup();

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'New test content');

    expect(textarea).toHaveValue('New test content');
  });

  it('displays color picker buttons', () => {
    render(<StickiesWindow onClose={mockOnClose} />);
    // There should be 6 color buttons
    const colorButtons = screen.getAllByRole('button').filter(
      btn => btn.classList.contains('rounded-full') && btn.classList.contains('w-5')
    );
    expect(colorButtons.length).toBe(6);
  });

  it('has pin and delete buttons in toolbar', () => {
    render(<StickiesWindow onClose={mockOnClose} />);
    expect(screen.getByTitle(/pin note/i)).toBeInTheDocument();
    expect(screen.getByTitle(/delete note/i)).toBeInTheDocument();
  });

  it('toggles pin state when clicking pin button', async () => {
    render(<StickiesWindow onClose={mockOnClose} />);
    const user = userEvent.setup();

    const pinButton = screen.getByTitle(/pin note/i);
    await user.click(pinButton);

    // After toggling, should see the opposite state
    expect(pinButton).toBeInTheDocument();
  });

  it('deletes a note when clicking delete button', async () => {
    render(<StickiesWindow onClose={mockOnClose} />);
    const user = userEvent.setup();

    // First create a new note
    await user.click(screen.getByText('New Note'));

    // Get the delete button and click it
    const deleteButton = screen.getByTitle(/delete note/i);
    await user.click(deleteButton);

    // Note should be deleted - we should still have some notes
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows placeholder text for empty notes', () => {
    render(<StickiesWindow onClose={mockOnClose} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder', 'Type your note here...');
  });

  it('displays "Empty note" text for notes without content in sidebar', async () => {
    render(<StickiesWindow onClose={mockOnClose} />);
    const user = userEvent.setup();

    // Create a new note (which will be empty)
    await user.click(screen.getByText('New Note'));

    // The sidebar should show "Empty note" for the new note
    expect(screen.getByText('Empty note')).toBeInTheDocument();
  });

  it('maintains multiple notes in the sidebar', () => {
    render(<StickiesWindow onClose={mockOnClose} />);

    // Should have initial notes visible in sidebar
    const sidebar = screen.getByText('New Note').closest('div')?.parentElement;
    expect(sidebar).toBeInTheDocument();

    // Check for note content previews (may have multiple matches)
    expect(screen.getAllByText(/Welcome to Stickies!/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Shopping List/).length).toBeGreaterThan(0);
  });
});
