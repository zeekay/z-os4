/**
 * Quick Look Module
 *
 * File preview system for zOS following macOS Quick Look patterns.
 */

// Main overlay component
export { QuickLookOverlay } from './QuickLookOverlay';
export type { QuickLookOverlayProps, QuickLookFile, FileType } from './QuickLookOverlay';

// Preview components
export { ImagePreview } from './ImagePreview';
export type { ImagePreviewProps } from './ImagePreview';

export { TextPreview } from './TextPreview';
export type { TextPreviewProps } from './TextPreview';

export { VideoPreview } from './VideoPreview';
export type { VideoPreviewProps } from './VideoPreview';

export { AudioPreview } from './AudioPreview';
export type { AudioPreviewProps } from './AudioPreview';

export { PDFPreview } from './PDFPreview';
export type { PDFPreviewProps } from './PDFPreview';

export { GenericPreview } from './GenericPreview';
export type { GenericPreviewProps } from './GenericPreview';
