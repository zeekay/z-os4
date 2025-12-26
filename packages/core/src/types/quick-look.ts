/**
 * Quick Look Types
 *
 * Types for the file preview system.
 */

export type FileType =
  | 'image'
  | 'text'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'unknown';

export interface QuickLookFile {
  /** Unique identifier for the file */
  id: string;
  /** File name with extension */
  name: string;
  /** File path or URL */
  path: string;
  /** File MIME type */
  mimeType?: string;
  /** File size in bytes */
  size?: number;
  /** Last modified date */
  modified?: Date;
  /** Image dimensions (for images) */
  dimensions?: {
    width: number;
    height: number;
  };
  /** Duration in seconds (for audio/video) */
  duration?: number;
  /** File content (for text files) */
  content?: string;
}

export interface QuickLookState {
  /** Whether Quick Look is currently visible */
  isOpen: boolean;
  /** Currently previewed file */
  currentFile: QuickLookFile | null;
  /** List of files for navigation */
  fileList: QuickLookFile[];
  /** Index of current file in fileList */
  currentIndex: number;
  /** Whether in fullscreen mode */
  isFullscreen: boolean;
}

export interface QuickLookContextType extends QuickLookState {
  /** Show Quick Look for a file */
  showQuickLook: (file: QuickLookFile, fileList?: QuickLookFile[]) => void;
  /** Hide Quick Look */
  hideQuickLook: () => void;
  /** Navigate to next file */
  nextFile: () => void;
  /** Navigate to previous file */
  prevFile: () => void;
  /** Toggle fullscreen mode */
  toggleFullscreen: () => void;
  /** Get file type from extension or MIME type */
  getFileType: (file: QuickLookFile) => FileType;
}

/**
 * Extension to file type mapping
 */
export const EXTENSION_TYPE_MAP: Record<string, FileType> = {
  // Images
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  bmp: 'image',
  ico: 'image',

  // Text/Code
  txt: 'text',
  md: 'text',
  json: 'text',
  js: 'text',
  jsx: 'text',
  ts: 'text',
  tsx: 'text',
  css: 'text',
  scss: 'text',
  less: 'text',
  html: 'text',
  xml: 'text',
  yaml: 'text',
  yml: 'text',
  toml: 'text',
  ini: 'text',
  cfg: 'text',
  conf: 'text',
  sh: 'text',
  bash: 'text',
  zsh: 'text',
  py: 'text',
  rb: 'text',
  go: 'text',
  rs: 'text',
  java: 'text',
  c: 'text',
  cpp: 'text',
  h: 'text',
  hpp: 'text',
  swift: 'text',
  kt: 'text',
  sql: 'text',
  graphql: 'text',
  gql: 'text',

  // Video
  mp4: 'video',
  webm: 'video',
  mov: 'video',
  avi: 'video',
  mkv: 'video',
  m4v: 'video',

  // Audio
  mp3: 'audio',
  wav: 'audio',
  ogg: 'audio',
  flac: 'audio',
  aac: 'audio',
  m4a: 'audio',
  wma: 'audio',

  // PDF
  pdf: 'pdf',
};

/**
 * MIME type to file type mapping
 */
export const MIME_TYPE_MAP: Record<string, FileType> = {
  // Images
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'image/bmp': 'image',
  'image/x-icon': 'image',

  // Text
  'text/plain': 'text',
  'text/markdown': 'text',
  'text/html': 'text',
  'text/css': 'text',
  'text/javascript': 'text',
  'application/json': 'text',
  'application/xml': 'text',
  'application/x-yaml': 'text',

  // Video
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',
  'video/x-matroska': 'video',

  // Audio
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/flac': 'audio',
  'audio/aac': 'audio',
  'audio/x-m4a': 'audio',

  // PDF
  'application/pdf': 'pdf',
};

/**
 * Language mapping for syntax highlighting
 */
export const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  h: 'c',
  hpp: 'cpp',
  swift: 'swift',
  kt: 'kotlin',
  sql: 'sql',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  md: 'markdown',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  xml: 'xml',
  html: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',
  graphql: 'graphql',
  gql: 'graphql',
};
