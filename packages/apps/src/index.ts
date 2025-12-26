/**
 * zOS Apps Package
 *
 * Individual application windows for zOS. Each app exports:
 * - Default export: Window component (for direct use)
 * - *App export: Full app definition with manifest, icon, menuBar, dockConfig
 *
 * @example
 * ```tsx
 * // Using the window component directly
 * import { CalculatorWindow } from '@z-os/apps';
 * <CalculatorWindow onClose={handleClose} />
 *
 * // Using the full app definition
 * import { CalculatorApp } from '@z-os/apps';
 * console.log(CalculatorApp.manifest.identifier);
 * const Icon = CalculatorApp.icon;
 * const menuBar = CalculatorApp.menuBar;
 * ```
 */

// ============================================================================
// Productivity Apps
// ============================================================================

export { default as FinderWindow, FinderApp } from './finder';
export { default as TerminalWindow, TerminalApp } from './terminal';
export { default as SafariWindow, SafariApp } from './safari';
export { default as CalculatorWindow, CalculatorApp } from './calculator';
export { default as NotesWindow, NotesApp } from './notes';
export { default as RemindersWindow, RemindersApp } from './reminders';
export { default as TextEditWindow, TextEditApp } from './textedit';
export { default as StickiesWindow, StickiesApp } from './stickies';
export { default as CalendarWindow, CalendarApp } from './calendar';
export { default as TranslateWindow, TranslateApp } from './translate';
export { default as FreeformWindow, FreeformApp } from './freeform';
export { default as FontBookWindow, FontBookApp } from './font-book';
export { default as ContactsWindow, ContactsApp } from './contacts';

// ============================================================================
// Communication Apps
// ============================================================================

export { default as MailWindow, MailApp } from './mail';
export { default as MessagesWindow, MessagesApp } from './messages';
export { default as FaceTimeWindow, FaceTimeApp } from './facetime';

// ============================================================================
// Media Apps
// ============================================================================

export { default as PhotosWindow, PhotosApp } from './photos';
export { default as MusicWindow, MusicApp } from './music';
export { default as VoiceMemosWindow, VoiceMemosApp } from './voice-memos';
export { default as PodcastsWindow, PodcastsApp } from './podcasts';
export { default as BooksWindow, BooksApp } from './books';
export { default as NewsWindow, NewsApp } from './news';
export { default as PreviewWindow, PreviewApp } from './preview';

// ============================================================================
// System Apps
// ============================================================================

export { default as SettingsWindow, SettingsApp } from './settings';
export { default as ClockWindow, ClockApp } from './clock';
export { default as WeatherWindow, WeatherApp } from './weather';
export { default as ActivityMonitorWindow, ActivityMonitorApp } from './activity-monitor';
export { default as ConsoleWindow, ConsoleApp } from './console';
export { default as DiskUtilityWindow, DiskUtilityApp } from './disk-utility';
export { default as PasswordsWindow, PasswordsApp } from './passwords';

// ============================================================================
// AI & Web3 Apps
// ============================================================================

export { default as HanzoAIWindow, HanzoAIApp } from './hanzo-ai';
export { default as LuxWindow, LuxApp } from './lux';
export { default as ZooWindow, ZooApp } from './zoo';

// ============================================================================
// Reference & Finance Apps
// ============================================================================

export { default as DictionaryWindow, DictionaryApp } from './dictionary';
export { default as StocksWindow, StocksApp } from './stocks';

// ============================================================================
// Navigation Apps
// ============================================================================

export { default as MapsWindow, MapsApp } from './maps';

// ============================================================================
// Common types
// ============================================================================

export interface AppWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// ============================================================================
// Re-export manifests and configs for convenience
// ============================================================================

// Productivity
export {
  FinderManifest, FinderMenuBar, FinderDockConfig,
} from './finder';
export {
  TerminalManifest, TerminalMenuBar, TerminalDockConfig,
} from './terminal';
export {
  SafariManifest, SafariMenuBar, SafariDockConfig,
} from './safari';
export {
  CalculatorManifest,
} from './calculator';
export {
  NotesManifest, NotesMenuBar, NotesDockConfig,
} from './notes';
export {
  RemindersManifest, RemindersMenuBar, RemindersDockConfig,
} from './reminders';
export {
  TextEditManifest, TextEditMenuBar, TextEditDockConfig,
} from './textedit';
export {
  StickiesManifest, StickiesMenuBar, StickiesDockConfig,
} from './stickies';
export {
  CalendarManifest, CalendarMenuBar, CalendarDockConfig,
} from './calendar';
export {
  TranslateManifest, TranslateMenuBar, TranslateDockConfig,
} from './translate';
export {
  FreeformManifest, FreeformMenuBar, FreeformDockConfig,
} from './freeform';
export {
  FontBookManifest, FontBookMenuBar, FontBookDockConfig,
} from './font-book';
export {
  ContactsManifest, ContactsMenuBar, ContactsDockConfig,
} from './contacts';

// Communication
export {
  MailManifest, MailMenuBar, MailDockConfig,
} from './mail';
export {
  MessagesManifest, MessagesMenuBar, MessagesDockConfig,
} from './messages';
export {
  FaceTimeManifest, FaceTimeMenuBar, FaceTimeDockConfig,
} from './facetime';

// Media
export {
  PhotosManifest, PhotosMenuBar, PhotosDockConfig,
} from './photos';
export {
  MusicManifest, MusicMenuBar, MusicDockConfig,
} from './music';
export {
  VoiceMemosManifest, VoiceMemosMenuBar, VoiceMemosDockConfig,
} from './voice-memos';
export {
  PodcastsManifest, PodcastsMenuBar, PodcastsDockConfig,
} from './podcasts';
export {
  BooksManifest, BooksMenuBar, BooksDockConfig,
} from './books';
export {
  NewsManifest, NewsMenuBar, NewsDockConfig,
} from './news';
export {
  PreviewManifest, PreviewMenuBar, PreviewDockConfig,
} from './preview';

// System
export {
  SettingsManifest, SettingsMenuBar, SettingsDockConfig,
} from './settings';
export {
  ClockManifest, ClockMenuBar, ClockDockConfig,
} from './clock';
export {
  WeatherManifest, WeatherMenuBar, WeatherDockConfig,
} from './weather';
export {
  ActivityMonitorManifest, ActivityMonitorMenuBar, ActivityMonitorDockConfig,
} from './activity-monitor';
export {
  ConsoleManifest, ConsoleMenuBar, ConsoleDockConfig,
} from './console';
export {
  DiskUtilityManifest, DiskUtilityMenuBar, DiskUtilityDockConfig,
} from './disk-utility';
export {
  PasswordsManifest, PasswordsMenuBar, PasswordsDockConfig,
} from './passwords';

// AI & Web3
export {
  HanzoAIManifest, HanzoAIMenuBar, HanzoAIDockConfig,
} from './hanzo-ai';
export {
  LuxManifest, LuxMenuBar, LuxDockConfig,
} from './lux';
export {
  ZooManifest, ZooMenuBar, ZooDockConfig,
} from './zoo';

// Reference & Finance
export {
  DictionaryManifest, DictionaryMenuBar, DictionaryDockConfig,
} from './dictionary';
export {
  StocksManifest, StocksMenuBar, StocksDockConfig,
} from './stocks';

// Navigation
export {
  MapsManifest, MapsMenuBar, MapsDockConfig,
} from './maps';
