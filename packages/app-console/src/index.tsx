/**
 * Console App
 *
 * System log viewer for zOS following macOS Console patterns.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  ScrollText, AlertCircle, AlertTriangle, Info, XCircle,
  Monitor, AppWindow, Trash2, Download, Search, ArrowDown,
  Filter, Clock, ChevronRight
} from 'lucide-react';
import { cn } from '@z-os/ui';

interface ConsoleWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

type LogType = 'info' | 'warning' | 'error' | 'fault';

interface LogEntry {
  id: string;
  timestamp: Date;
  process: string;
  type: LogType;
  message: string;
  subsystem?: string;
}

// Mock system processes
const systemProcesses = [
  'kernel_task', 'launchd', 'WindowServer', 'loginwindow',
  'Finder', 'Dock', 'SystemUIServer', 'Safari', 'Terminal',
  'Mail', 'Messages', 'Calendar', 'Notes', 'Music',
  'HanzoAI', 'netbiosd', 'mDNSResponder', 'bluetoothd',
  'coreaudiod', 'diskarbitrationd', 'configd', 'powerd'
];

// Generate mock log messages
const generateMockMessage = (process: string, type: LogType): string => {
  const messages: Record<LogType, string[]> = {
    info: [
      'Service started successfully',
      'Connection established',
      'Configuration loaded',
      'Cache refreshed',
      'Synchronization complete',
      'Network interface up',
      'Process spawned',
      'Memory allocated',
      'File descriptor opened',
      'Event loop started',
    ],
    warning: [
      'High memory usage detected',
      'Connection timeout, retrying...',
      'Deprecated API usage detected',
      'Rate limit approaching',
      'Certificate expires in 30 days',
      'Disk space running low',
      'Thread pool exhausted',
      'Slow query detected',
    ],
    error: [
      'Failed to connect to server',
      'Permission denied',
      'Resource not found',
      'Invalid configuration',
      'Authentication failed',
      'Socket connection refused',
      'Database query failed',
      'File not found',
    ],
    fault: [
      'Critical system failure',
      'Kernel panic detected',
      'Memory corruption',
      'Hardware error detected',
      'Fatal exception occurred',
    ],
  };

  const typeMessages = messages[type];
  return `[${process}] ${typeMessages[Math.floor(Math.random() * typeMessages.length)]}`;
};

// Generate initial mock logs
const generateMockLogs = (count: number): LogEntry[] => {
  const logs: LogEntry[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const types: LogType[] = ['info', 'info', 'info', 'info', 'warning', 'warning', 'error', 'fault'];
    const type = types[Math.floor(Math.random() * types.length)];
    const process = systemProcesses[Math.floor(Math.random() * systemProcesses.length)];

    logs.push({
      id: `log-${i}`,
      timestamp: new Date(now - (count - i) * 1000 * Math.random() * 10),
      process,
      type,
      message: generateMockMessage(process, type),
      subsystem: Math.random() > 0.7 ? 'com.apple.system' : undefined,
    });
  }

  return logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

const ConsoleWindow: React.FC<ConsoleWindowProps> = ({ onClose, onFocus }) => {
  const [logs, setLogs] = useState<LogEntry[]>(() => generateMockLogs(100));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processFilter, setProcessFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<LogType | ''>('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Generate new logs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const types: LogType[] = ['info', 'info', 'info', 'warning', 'error'];
      const type = types[Math.floor(Math.random() * types.length)];
      const process = systemProcesses[Math.floor(Math.random() * systemProcesses.length)];

      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        process,
        type,
        message: generateMockMessage(process, type),
      };

      setLogs(prev => [...prev.slice(-499), newLog]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const categories = [
    { id: 'all', label: 'All Messages', icon: ScrollText, count: logs.length },
    { id: 'errors', label: 'Errors', icon: AlertCircle, count: logs.filter(l => l.type === 'error').length },
    { id: 'faults', label: 'Faults', icon: XCircle, count: logs.filter(l => l.type === 'fault').length },
    { id: 'system', label: 'System', icon: Monitor, count: logs.filter(l => ['kernel_task', 'launchd', 'WindowServer'].includes(l.process)).length },
    { id: 'apps', label: 'Apps', icon: AppWindow, count: logs.filter(l => !['kernel_task', 'launchd', 'WindowServer', 'loginwindow'].includes(l.process)).length },
  ];

  const getTypeIcon = (type: LogType) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'fault': return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getTypeColor = (type: LogType) => {
    switch (type) {
      case 'info': return 'text-white/70';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'fault': return 'text-red-600 font-semibold';
    }
  };

  const filteredLogs = logs.filter(log => {
    // Category filter
    if (selectedCategory === 'errors' && log.type !== 'error') return false;
    if (selectedCategory === 'faults' && log.type !== 'fault') return false;
    if (selectedCategory === 'system' && !['kernel_task', 'launchd', 'WindowServer'].includes(log.process)) return false;
    if (selectedCategory === 'apps' && ['kernel_task', 'launchd', 'WindowServer', 'loginwindow'].includes(log.process)) return false;

    // Search filter
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // Process filter
    if (processFilter && log.process !== processFilter) return false;

    // Type filter
    if (typeFilter && log.type !== typeFilter) return false;

    return true;
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const clearLogs = () => {
    setLogs([]);
    setSelectedLog(null);
  };

  const exportLogs = () => {
    const content = filteredLogs
      .map(log => `[${formatFullDate(log.timestamp)}] [${log.type.toUpperCase()}] ${log.process}: ${log.message}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${new Date().toISOString().split('T')[0]}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueProcesses = [...new Set(logs.map(l => l.process))].sort();

  return (
    <ZWindow
      title="Console"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 100, y: 80 }}
      initialSize={{ width: 1000, height: 650 }}
      windowType="system"
    >
      <div className="flex h-full bg-[#1e1e1e]">
        {/* Sidebar */}
        <div className="w-48 bg-black/30 border-r border-white/10 flex flex-col">
          <div className="p-2 border-b border-white/10">
            <span className="text-xs text-white/50 uppercase tracking-wider px-2">Categories</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedCategory === category.id
                    ? "bg-blue-500/20 text-white"
                    : "text-white/70 hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <category.icon className={cn(
                    "w-4 h-4",
                    selectedCategory === category.id ? "text-blue-400" : "text-white/50"
                  )} />
                  <span>{category.label}</span>
                </div>
                <span className="text-xs text-white/40">{category.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-[#252525]">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-9 pr-3 py-1.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showFilters ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/10 text-white/50"
              )}
              title="Filters"
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                autoScroll ? "bg-green-500/20 text-green-400" : "hover:bg-white/10 text-white/50"
              )}
              title={autoScroll ? "Auto-scroll on" : "Auto-scroll off"}
            >
              <ArrowDown className="w-4 h-4" />
            </button>

            {/* Clear */}
            <button
              onClick={clearLogs}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-red-400"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Export */}
            <button
              onClick={exportLogs}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
              title="Export logs"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Filters row */}
          {showFilters && (
            <div className="flex items-center gap-4 p-2 border-b border-white/10 bg-[#252525]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Process:</span>
                <select
                  value={processFilter}
                  onChange={(e) => setProcessFilter(e.target.value)}
                  className="bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">All</option>
                  {uniqueProcesses.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as LogType | '')}
                  className="bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="fault">Fault</option>
                </select>
              </div>
            </div>
          )}

          {/* Log entries */}
          <div
            ref={logContainerRef}
            className="flex-1 overflow-auto font-mono text-xs"
          >
            <table className="w-full">
              <thead className="sticky top-0 bg-[#252525] text-white/50 border-b border-white/10">
                <tr>
                  <th className="text-left p-2 font-medium w-20">Time</th>
                  <th className="text-left p-2 font-medium w-6"></th>
                  <th className="text-left p-2 font-medium w-32">Process</th>
                  <th className="text-left p-2 font-medium">Message</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={cn(
                      "border-b border-white/5 cursor-pointer transition-colors",
                      selectedLog?.id === log.id ? "bg-blue-500/20" : "hover:bg-white/5"
                    )}
                  >
                    <td className="p-2 text-white/40">{formatTime(log.timestamp)}</td>
                    <td className="p-2">{getTypeIcon(log.type)}</td>
                    <td className="p-2 text-purple-400">{log.process}</td>
                    <td className={cn("p-2", getTypeColor(log.type))}>{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLogs.length === 0 && (
              <div className="flex items-center justify-center h-32 text-white/30">
                No log entries match your filters
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selectedLog && (
            <div className="border-t border-white/10 bg-[#252525] p-3">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getTypeIcon(selectedLog.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-white/50">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatFullDate(selectedLog.timestamp)}
                    </span>
                    <span className="text-purple-400">{selectedLog.process}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs",
                      selectedLog.type === 'info' && "bg-blue-500/20 text-blue-400",
                      selectedLog.type === 'warning' && "bg-yellow-500/20 text-yellow-400",
                      selectedLog.type === 'error' && "bg-red-500/20 text-red-400",
                      selectedLog.type === 'fault' && "bg-red-600/20 text-red-600"
                    )}>
                      {selectedLog.type}
                    </span>
                  </div>
                  <p className="text-sm text-white font-mono">{selectedLog.message}</p>
                  {selectedLog.subsystem && (
                    <p className="text-xs text-white/40">Subsystem: {selectedLog.subsystem}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status bar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/10 bg-[#252525] text-xs text-white/50">
            <span>{filteredLogs.length} entries</span>
            <div className="flex items-center gap-2">
              {autoScroll && (
                <span className="flex items-center gap-1 text-green-400">
                  <ArrowDown className="w-3 h-3" />
                  Auto-scroll
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Console app manifest
 */
export const ConsoleManifest = {
  identifier: 'ai.hanzo.console',
  name: 'Console',
  version: '1.0.0',
  description: 'System log viewer for zOS',
  category: 'utilities' as const,
  permissions: ['system'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 1000, height: 650 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Console menu bar configuration
 */
export const ConsoleMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newQuery', label: 'New Query', shortcut: '⌘N' },
        { type: 'item' as const, id: 'saveQuery', label: 'Save Query...', shortcut: '⌘S' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'export', label: 'Export...', shortcut: '⌘E' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'selectAll', label: 'Select All', shortcut: '⌘A' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'find', label: 'Find...', shortcut: '⌘F' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'allMessages', label: 'All Messages' },
        { type: 'item' as const, id: 'errors', label: 'Errors Only' },
        { type: 'item' as const, id: 'faults', label: 'Faults Only' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'clear', label: 'Clear', shortcut: '⌘K' },
      ],
    },
    {
      id: 'action',
      label: 'Action',
      items: [
        { type: 'item' as const, id: 'startStreaming', label: 'Start Streaming' },
        { type: 'item' as const, id: 'pauseStreaming', label: 'Pause Streaming' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'includeInfoMessages', label: 'Include Info Messages' },
        { type: 'item' as const, id: 'includeDebugMessages', label: 'Include Debug Messages' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'consoleHelp', label: 'Console Help' },
      ],
    },
  ],
};

/**
 * Console dock configuration
 */
export const ConsoleDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'showAllMessages', label: 'Show All Messages' },
    { type: 'item' as const, id: 'clearConsole', label: 'Clear Console' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Console App definition for registry
 */
export const ConsoleApp = {
  manifest: ConsoleManifest,
  component: ConsoleWindow,
  icon: ScrollText,
  menuBar: ConsoleMenuBar,
  dockConfig: ConsoleDockConfig,
};

export default ConsoleWindow;
