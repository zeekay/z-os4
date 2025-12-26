/**
 * GenericPreview Component
 *
 * Displays file icon and metadata for unsupported file types.
 */

import React from 'react';
import {
  File,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  FileType,
  Folder,
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface GenericPreviewProps {
  filename: string;
  size?: number;
  modified?: Date;
  mimeType?: string;
  className?: string;
}

// Format bytes to human-readable size
function formatSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return 'Unknown';
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// Format date to readable string
function formatDate(date?: Date): string {
  if (!date) return 'Unknown';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get file extension
function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toUpperCase() || '' : '';
}

// Get appropriate icon for file type
function getFileIcon(filename: string, mimeType?: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mime = mimeType?.toLowerCase() || '';

  // Folder
  if (mime === 'inode/directory' || ext === '') {
    return Folder;
  }

  // Images
  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return FileImage;
  }

  // Videos
  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
    return FileVideo;
  }

  // Audio
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) {
    return FileAudio;
  }

  // Archives
  if (['zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar'].includes(ext)) {
    return FileArchive;
  }

  // Spreadsheets
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return FileSpreadsheet;
  }

  // Code files
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'hpp', 'swift', 'kt', 'sh', 'bash', 'zsh'].includes(ext)) {
    return FileCode;
  }

  // Text/documents
  if (['txt', 'md', 'json', 'yaml', 'yml', 'toml', 'xml', 'html', 'css'].includes(ext)) {
    return FileText;
  }

  // PDF
  if (ext === 'pdf') {
    return FileType;
  }

  return File;
}

export function GenericPreview({ filename, size, modified, mimeType, className }: GenericPreviewProps) {
  const Icon = getFileIcon(filename, mimeType);
  const extension = getExtension(filename);

  return (
    <div className={cn('flex flex-col items-center justify-center h-full p-8', className)}>
      {/* Large file icon */}
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center shadow-xl">
          <Icon className="w-16 h-16 text-white/50" />
        </div>
        {extension && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500/80 rounded-full text-xs font-medium text-white shadow-lg">
            {extension}
          </div>
        )}
      </div>

      {/* File name */}
      <div className="text-xl font-medium text-white/90 mb-6 text-center max-w-full px-4 break-all">
        {filename}
      </div>

      {/* File info */}
      <div className="w-full max-w-sm bg-white/5 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/40">Kind</span>
          <span className="text-sm text-white/80">
            {mimeType || `${extension || 'Unknown'} File`}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/40">Size</span>
          <span className="text-sm text-white/80">
            {formatSize(size)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/40">Modified</span>
          <span className="text-sm text-white/80">
            {formatDate(modified)}
          </span>
        </div>
      </div>

      {/* Preview unavailable message */}
      <div className="mt-8 text-sm text-white/40 text-center">
        No preview available for this file type
      </div>
    </div>
  );
}

export default GenericPreview;
