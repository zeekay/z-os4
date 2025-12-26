/**
 * Disk Utility App
 *
 * Storage management and disk operations for zOS.
 */

import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  HardDrive, Database, Usb, AlertCircle, CheckCircle,
  Trash2, LayoutGrid, Shield, RefreshCw, ChevronRight,
  FolderOpen, Image, Music, Film, FileText, AppWindow,
  Settings, Info, Play, Pause
} from 'lucide-react';
import { cn } from '@z-os/ui';

interface DiskUtilityWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface StorageCategory {
  name: string;
  size: number;
  color: string;
  icon: React.ElementType;
}

interface Drive {
  id: string;
  name: string;
  type: 'internal' | 'external';
  capacity: number;
  used: number;
  fileSystem: string;
  mountPoint: string;
  status: 'healthy' | 'warning' | 'error';
  partitions?: { name: string; size: number; used: number }[];
}

// Mock drive data
const mockDrives: Drive[] = [
  {
    id: 'macintosh-hd',
    name: 'Macintosh HD',
    type: 'internal',
    capacity: 512,
    used: 384,
    fileSystem: 'APFS',
    mountPoint: '/',
    status: 'healthy',
    partitions: [
      { name: 'Macintosh HD', size: 480, used: 360 },
      { name: 'Macintosh HD - Data', size: 32, used: 24 },
    ],
  },
  {
    id: 'recovery',
    name: 'Recovery',
    type: 'internal',
    capacity: 5,
    used: 2.5,
    fileSystem: 'APFS',
    mountPoint: '/System/Volumes/Recovery',
    status: 'healthy',
  },
  {
    id: 'external-ssd',
    name: 'External SSD',
    type: 'external',
    capacity: 1024,
    used: 450,
    fileSystem: 'exFAT',
    mountPoint: '/Volumes/External SSD',
    status: 'healthy',
  },
  {
    id: 'backup-drive',
    name: 'Backup Drive',
    type: 'external',
    capacity: 2048,
    used: 1536,
    fileSystem: 'HFS+',
    mountPoint: '/Volumes/Backup Drive',
    status: 'warning',
  },
];

// Storage breakdown for main drive
const storageCategories: StorageCategory[] = [
  { name: 'Applications', size: 85, color: 'bg-blue-500', icon: AppWindow },
  { name: 'Documents', size: 45, color: 'bg-yellow-500', icon: FileText },
  { name: 'Photos', size: 120, color: 'bg-purple-500', icon: Image },
  { name: 'Music', size: 35, color: 'bg-pink-500', icon: Music },
  { name: 'Videos', size: 65, color: 'bg-red-500', icon: Film },
  { name: 'System', size: 25, color: 'bg-green-500', icon: Settings },
  { name: 'Other', size: 9, color: 'bg-gray-500', icon: FolderOpen },
];

const DiskUtilityWindow: React.FC<DiskUtilityWindowProps> = ({ onClose, onFocus }) => {
  const [selectedDrive, setSelectedDrive] = useState<Drive>(mockDrives[0]);
  const [operationInProgress, setOperationInProgress] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const formatSize = (gb: number) => {
    if (gb >= 1024) {
      return `${(gb / 1024).toFixed(2)} TB`;
    }
    return `${gb.toFixed(1)} GB`;
  };

  const getAvailableSpace = (drive: Drive) => drive.capacity - drive.used;
  const getUsagePercent = (drive: Drive) => (drive.used / drive.capacity) * 100;

  const getStatusIcon = (status: Drive['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const runFirstAid = () => {
    setOperationInProgress('firstAid');
    setTimeout(() => {
      setOperationInProgress(null);
    }, 3000);
  };

  const totalCategorySize = storageCategories.reduce((sum, cat) => sum + cat.size, 0);

  // Pie chart calculation
  const renderPieChart = () => {
    let cumulativePercent = 0;
    const segments = storageCategories.map((cat, i) => {
      const percent = (cat.size / selectedDrive.used) * 100;
      const startAngle = cumulativePercent * 3.6; // 360 / 100
      cumulativePercent += percent;
      const endAngle = cumulativePercent * 3.6;

      // Convert to SVG arc path
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);
      const largeArc = percent > 50 ? 1 : 0;

      return (
        <path
          key={cat.name}
          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
          className={cat.color.replace('bg-', 'fill-')}
          opacity={0.9}
        />
      );
    });

    return (
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        {segments}
        <circle cx="50" cy="50" r="25" className="fill-[#1e1e1e]" />
      </svg>
    );
  };

  const internalDrives = mockDrives.filter(d => d.type === 'internal');
  const externalDrives = mockDrives.filter(d => d.type === 'external');

  return (
    <ZWindow
      title="Disk Utility"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 120, y: 90 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="system"
    >
      <div className="flex h-full bg-[#1e1e1e]">
        {/* Sidebar */}
        <div className="w-56 bg-black/30 border-r border-white/10 flex flex-col">
          {/* Internal drives */}
          <div className="p-2 border-b border-white/10">
            <span className="text-xs text-white/50 uppercase tracking-wider px-2">Internal</span>
          </div>
          <div className="p-2">
            {internalDrives.map(drive => (
              <button
                key={drive.id}
                onClick={() => setSelectedDrive(drive)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedDrive.id === drive.id
                    ? "bg-blue-500/20 text-white"
                    : "text-white/70 hover:bg-white/5"
                )}
              >
                <HardDrive className={cn(
                  "w-5 h-5",
                  selectedDrive.id === drive.id ? "text-blue-400" : "text-white/50"
                )} />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span>{drive.name}</span>
                    {getStatusIcon(drive.status)}
                  </div>
                  <div className="text-xs text-white/40">{formatSize(getAvailableSpace(drive))} free</div>
                </div>
              </button>
            ))}
          </div>

          {/* External drives */}
          <div className="p-2 border-t border-white/10">
            <span className="text-xs text-white/50 uppercase tracking-wider px-2">External</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {externalDrives.map(drive => (
              <button
                key={drive.id}
                onClick={() => setSelectedDrive(drive)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedDrive.id === drive.id
                    ? "bg-blue-500/20 text-white"
                    : "text-white/70 hover:bg-white/5"
                )}
              >
                <Usb className={cn(
                  "w-5 h-5",
                  selectedDrive.id === drive.id ? "text-blue-400" : "text-white/50"
                )} />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span>{drive.name}</span>
                    {getStatusIcon(drive.status)}
                  </div>
                  <div className="text-xs text-white/40">{formatSize(getAvailableSpace(drive))} free</div>
                </div>
              </button>
            ))}
            {externalDrives.length === 0 && (
              <div className="text-center text-white/30 text-sm py-4">
                No external drives
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#252525]">
            <div className="flex items-center gap-2">
              <button
                onClick={runFirstAid}
                disabled={operationInProgress !== null}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  operationInProgress
                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                    : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                )}
              >
                <Shield className="w-4 h-4" />
                First Aid
              </button>
              <button
                disabled={operationInProgress !== null}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-white/10 text-white/70"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                Partition
              </button>
              <button
                disabled={operationInProgress !== null}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-red-500/20 text-red-400"
                )}
              >
                <Trash2 className="w-4 h-4" />
                Erase
              </button>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showInfo ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/10 text-white/50"
              )}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Operation progress */}
          {operationInProgress && (
            <div className="p-4 bg-blue-500/10 border-b border-blue-500/20">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                <div className="flex-1">
                  <p className="text-white font-medium">Running First Aid on "{selectedDrive.name}"</p>
                  <p className="text-sm text-white/50">Checking file system structure...</p>
                </div>
              </div>
              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '45%' }} />
              </div>
            </div>
          )}

          {/* Drive content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              {/* Drive header */}
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <HardDrive className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedDrive.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <span>{selectedDrive.fileSystem}</span>
                    <span>|</span>
                    <span>{selectedDrive.mountPoint}</span>
                    <span>|</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedDrive.status)}
                      <span className={cn(
                        selectedDrive.status === 'healthy' && "text-green-400",
                        selectedDrive.status === 'warning' && "text-yellow-400",
                        selectedDrive.status === 'error' && "text-red-400",
                      )}>
                        {selectedDrive.status.charAt(0).toUpperCase() + selectedDrive.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity info */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-medium">Storage</p>
                    <p className="text-sm text-white/50">
                      {formatSize(selectedDrive.used)} used of {formatSize(selectedDrive.capacity)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{formatSize(getAvailableSpace(selectedDrive))}</p>
                    <p className="text-sm text-white/50">Available</p>
                  </div>
                </div>

                {/* Usage bar */}
                <div className="h-6 bg-white/10 rounded-full overflow-hidden flex">
                  {selectedDrive.id === 'macintosh-hd' ? (
                    // Show category breakdown for main drive
                    storageCategories.map((cat) => (
                      <div
                        key={cat.name}
                        className={cn("h-full", cat.color)}
                        style={{ width: `${(cat.size / selectedDrive.capacity) * 100}%` }}
                        title={`${cat.name}: ${formatSize(cat.size)}`}
                      />
                    ))
                  ) : (
                    // Simple usage bar for other drives
                    <div
                      className={cn(
                        "h-full",
                        getUsagePercent(selectedDrive) > 90 ? "bg-red-500" :
                        getUsagePercent(selectedDrive) > 75 ? "bg-yellow-500" :
                        "bg-blue-500"
                      )}
                      style={{ width: `${getUsagePercent(selectedDrive)}%` }}
                    />
                  )}
                </div>
              </div>

              {/* Storage breakdown (for main drive) */}
              {selectedDrive.id === 'macintosh-hd' && (
                <div className="grid grid-cols-2 gap-6">
                  {/* Pie chart */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {renderPieChart()}
                  </div>

                  {/* Categories list */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <h3 className="text-white font-medium mb-3">Storage Breakdown</h3>
                    {storageCategories.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-3 h-3 rounded-full", cat.color)} />
                          <cat.icon className="w-4 h-4 text-white/50" />
                          <span className="text-white/70">{cat.name}</span>
                        </div>
                        <span className="text-white font-medium">{formatSize(cat.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Partitions */}
              {selectedDrive.partitions && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-medium mb-3">Partitions</h3>
                  <div className="space-y-2">
                    {selectedDrive.partitions.map((partition, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                        <div className="flex items-center gap-3">
                          <Database className="w-4 h-4 text-white/50" />
                          <div>
                            <p className="text-white">{partition.name}</p>
                            <p className="text-xs text-white/40">
                              {formatSize(partition.used)} used of {formatSize(partition.size)}
                            </p>
                          </div>
                        </div>
                        <div className="w-32">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(partition.used / partition.size) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drive info panel */}
              {showInfo && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-medium mb-3">Drive Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/50">Name</span>
                        <span className="text-white">{selectedDrive.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Type</span>
                        <span className="text-white">{selectedDrive.type === 'internal' ? 'Internal' : 'External'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">File System</span>
                        <span className="text-white">{selectedDrive.fileSystem}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/50">Mount Point</span>
                        <span className="text-white font-mono text-xs">{selectedDrive.mountPoint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Capacity</span>
                        <span className="text-white">{formatSize(selectedDrive.capacity)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Available</span>
                        <span className="text-white">{formatSize(getAvailableSpace(selectedDrive))}</span>
                      </div>
                    </div>
                  </div>
                </div>
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
 * Disk Utility app manifest
 */
export const DiskUtilityManifest = {
  identifier: 'ai.hanzo.disk-utility',
  name: 'Disk Utility',
  version: '1.0.0',
  description: 'Storage management for zOS',
  category: 'utilities' as const,
  permissions: ['system', 'storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 900, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Disk Utility menu bar configuration
 */
export const DiskUtilityMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newImage', label: 'New Image', shortcut: '⌘N' },
        { type: 'item' as const, id: 'openImage', label: 'Open Disk Image...', shortcut: '⌘O' },
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
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showAllDevices', label: 'Show All Devices' },
        { type: 'item' as const, id: 'showOnlyVolumes', label: 'Show Only Volumes' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showAPFSSnapshots', label: 'Show APFS Snapshots' },
      ],
    },
    {
      id: 'images',
      label: 'Images',
      items: [
        { type: 'item' as const, id: 'convertImage', label: 'Convert...' },
        { type: 'item' as const, id: 'resizeImage', label: 'Resize...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'verify', label: 'Verify...' },
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
        { type: 'item' as const, id: 'diskUtilityHelp', label: 'Disk Utility Help' },
      ],
    },
  ],
};

/**
 * Disk Utility dock configuration
 */
export const DiskUtilityDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'showAllDevices', label: 'Show All Devices' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Disk Utility App definition for registry
 */
export const DiskUtilityApp = {
  manifest: DiskUtilityManifest,
  component: DiskUtilityWindow,
  icon: HardDrive,
  menuBar: DiskUtilityMenuBar,
  dockConfig: DiskUtilityDockConfig,
};

export default DiskUtilityWindow;
