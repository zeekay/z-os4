import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock @z-os/ui
vi.mock('@z-os/ui', () => ({
  ZWindow: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="z-window" data-title={title}>{children}</div>
  ),
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

import ActivityMonitorWindow from '../src/activity-monitor';

describe('ActivityMonitorWindow', () => {
  const mockOnClose = vi.fn();
  const mockOnFocus = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the activity monitor window', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} onFocus={mockOnFocus} />);
    expect(screen.getByTestId('z-window')).toHaveAttribute('data-title', 'Activity Monitor');
  });

  it('displays all tab buttons', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} />);
    // Get all tab buttons
    const buttons = screen.getAllByRole('button');
    const tabLabels = ['CPU', 'Memory', 'Energy', 'Disk', 'Network'];
    tabLabels.forEach(label => {
      const tabButton = buttons.find(btn => btn.textContent?.includes(label));
      expect(tabButton).toBeDefined();
    });
  });

  it('shows CPU tab by default', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} />);
    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
  });

  it('switches to Memory tab when clicked', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} />);

    const buttons = screen.getAllByRole('button');
    const memoryTab = buttons.find(btn => btn.textContent?.includes('Memory'));
    expect(memoryTab).toBeDefined();
    fireEvent.click(memoryTab!);

    expect(screen.getByText('Memory Pressure')).toBeInTheDocument();
    expect(screen.getByText('App Memory')).toBeInTheDocument();
  });

  it('switches to Energy tab when clicked', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} />);

    const buttons = screen.getAllByRole('button');
    const energyTab = buttons.find(btn => btn.textContent?.includes('Energy'));
    fireEvent.click(energyTab!);

    expect(screen.getByText('Energy Impact')).toBeInTheDocument();
    expect(screen.getByText('Last 12 hours')).toBeInTheDocument();
  });

  it('switches to Disk tab when clicked', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} />);

    const buttons = screen.getAllByRole('button');
    const diskTab = buttons.find(btn => btn.textContent?.includes('Disk'));
    fireEvent.click(diskTab!);

    expect(screen.getByText('Disk Activity')).toBeInTheDocument();
    expect(screen.getByText('Disk Usage')).toBeInTheDocument();
  });

  it('switches to Network tab when clicked', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} />);

    const buttons = screen.getAllByRole('button');
    const networkTab = buttons.find(btn => btn.textContent?.includes('Network'));
    fireEvent.click(networkTab!);

    expect(screen.getByText('Network Activity')).toBeInTheDocument();
    expect(screen.getByText('Data Received')).toBeInTheDocument();
    expect(screen.getByText('Data Sent')).toBeInTheDocument();
  });

  it('displays process list table', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} />);

    expect(screen.getByText('Process Name')).toBeInTheDocument();
    expect(screen.getByText('PID')).toBeInTheDocument();
    expect(screen.getByText('% CPU')).toBeInTheDocument();
    expect(screen.getByText('Threads')).toBeInTheDocument();
  });

  it('displays simulated processes', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} />);

    expect(screen.getByText('kernel_task')).toBeInTheDocument();
    expect(screen.getByText('Safari')).toBeInTheDocument();
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.getByText('Finder')).toBeInTheDocument();
    expect(screen.getByText('Hanzo AI')).toBeInTheDocument();
  });

  it('shows process count in footer', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} />);
    expect(screen.getByText('10 processes')).toBeInTheDocument();
  });

  it('renders CPU history graph', () => {
    const { container } = render(<ActivityMonitorWindow onClose={mockOnClose} />);
    const graphContainer = container.querySelector('.h-24.flex.items-end');
    expect(graphContainer).toBeInTheDocument();
  });

  it('displays memory information in Memory tab', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} />);

    const buttons = screen.getAllByRole('button');
    const memoryTab = buttons.find(btn => btn.textContent?.includes('Memory'));
    fireEvent.click(memoryTab!);

    expect(screen.getByText('Physical Memory: 16 GB')).toBeInTheDocument();
  });

  it('displays disk information in Disk tab', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} />);

    const buttons = screen.getAllByRole('button');
    const diskTab = buttons.find(btn => btn.textContent?.includes('Disk'));
    fireEvent.click(diskTab!);

    expect(screen.getByText('Read: 12.5 MB/s')).toBeInTheDocument();
    expect(screen.getByText('Write: 4.2 MB/s')).toBeInTheDocument();
    expect(screen.getByText(/256 GB available/)).toBeInTheDocument();
  });

  it('displays network statistics in Network tab', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} />);

    const buttons = screen.getAllByRole('button');
    const networkTab = buttons.find(btn => btn.textContent?.includes('Network'));
    fireEvent.click(networkTab!);

    expect(screen.getByText('1.45 GB')).toBeInTheDocument();
    expect(screen.getByText('284 MB')).toBeInTheDocument();
  });

  it('sorts processes by CPU usage', () => {
    render(<ActivityMonitorWindow onClose={mockOnClose} />);

    const rows = screen.getAllByRole('row').slice(1);
    const firstRow = rows[0];
    expect(firstRow.textContent).toContain('Hanzo AI');
  });
});
