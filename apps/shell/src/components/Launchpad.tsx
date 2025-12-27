import React, { useEffect, useRef, useState } from 'react';
import {
  FinderIcon,
  SafariIcon,
  MailIcon,
  PhotosIcon,
  CalendarIcon,
  MessagesIcon,
  FaceTimeIcon,
  MusicIcon,
  TerminalIcon,
  TextEditIcon,
  HanzoIcon,
  LuxLogo,
  ZooLogo,
} from './dock/icons';
import {
  Calculator, Clock, FileText, CheckSquare, Cloud,
  Settings, BookOpen, Activity, Terminal as ConsoleIcon,
  Users, Book, HardDrive, Type, PenTool, Map, Newspaper,
  Key, Podcast, Image, TrendingUp, Languages, Mic
} from 'lucide-react';

interface LaunchpadProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
}

interface AppItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const LAUNCHPAD_APPS: AppItem[] = [
  // System Apps
  { id: 'finder', name: 'Finder', icon: <FinderIcon className="w-full h-full" /> },
  { id: 'safari', name: 'Safari', icon: <SafariIcon className="w-full h-full" /> },
  { id: 'mail', name: 'Mail', icon: <MailIcon className="w-full h-full" /> },
  { id: 'photos', name: 'Photos', icon: <PhotosIcon className="w-full h-full" /> },
  { id: 'calendar', name: 'Calendar', icon: <CalendarIcon className="w-full h-full" /> },
  { id: 'messages', name: 'Messages', icon: <MessagesIcon className="w-full h-full" /> },
  { id: 'facetime', name: 'FaceTime', icon: <FaceTimeIcon className="w-full h-full" /> },
  { id: 'music', name: 'Music', icon: <MusicIcon className="w-full h-full" /> },
  { id: 'terminal', name: 'Terminal', icon: <TerminalIcon className="w-full h-full" /> },
  { id: 'textedit', name: 'TextEdit', icon: <TextEditIcon className="w-full h-full" /> },
  
  // Utilities
  { id: 'calculator', name: 'Calculator', icon: <div className="w-full h-full bg-gradient-to-b from-orange-400 to-orange-600 rounded-xl flex items-center justify-center"><Calculator className="w-8 h-8 text-white" /></div> },
  { id: 'clock', name: 'Clock', icon: <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-900 rounded-xl flex items-center justify-center"><Clock className="w-8 h-8 text-white" /></div> },
  { id: 'notes', name: 'Notes', icon: <div className="w-full h-full bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-xl flex items-center justify-center"><FileText className="w-8 h-8 text-yellow-900" /></div> },
  { id: 'reminders', name: 'Reminders', icon: <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl flex items-center justify-center"><CheckSquare className="w-8 h-8 text-white" /></div> },
  { id: 'weather', name: 'Weather', icon: <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl flex items-center justify-center"><Cloud className="w-8 h-8 text-white" /></div> },
  { id: 'settings', name: 'Settings', icon: <div className="w-full h-full bg-gradient-to-b from-gray-500 to-gray-700 rounded-xl flex items-center justify-center"><Settings className="w-8 h-8 text-white" /></div> },
  { id: 'stickies', name: 'Stickies', icon: <div className="w-full h-full bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-xl flex items-center justify-center"><FileText className="w-8 h-8 text-yellow-800" /></div> },
  
  // Pro Apps
  { id: 'activity-monitor', name: 'Activity Monitor', icon: <div className="w-full h-full bg-gradient-to-b from-green-500 to-green-700 rounded-xl flex items-center justify-center"><Activity className="w-8 h-8 text-white" /></div> },
  { id: 'console', name: 'Console', icon: <div className="w-full h-full bg-gradient-to-b from-gray-600 to-gray-800 rounded-xl flex items-center justify-center"><ConsoleIcon className="w-8 h-8 text-white" /></div> },
  { id: 'disk-utility', name: 'Disk Utility', icon: <div className="w-full h-full bg-gradient-to-b from-gray-400 to-gray-600 rounded-xl flex items-center justify-center"><HardDrive className="w-8 h-8 text-white" /></div> },
  { id: 'font-book', name: 'Font Book', icon: <div className="w-full h-full bg-gradient-to-b from-blue-500 to-blue-700 rounded-xl flex items-center justify-center"><Type className="w-8 h-8 text-white" /></div> },
  
  // Media & Creative
  { id: 'books', name: 'Books', icon: <div className="w-full h-full bg-gradient-to-b from-orange-400 to-orange-600 rounded-xl flex items-center justify-center"><BookOpen className="w-8 h-8 text-white" /></div> },
  { id: 'podcasts', name: 'Podcasts', icon: <div className="w-full h-full bg-gradient-to-b from-purple-500 to-purple-700 rounded-xl flex items-center justify-center"><Podcast className="w-8 h-8 text-white" /></div> },
  { id: 'news', name: 'News', icon: <div className="w-full h-full bg-gradient-to-b from-red-500 to-red-700 rounded-xl flex items-center justify-center"><Newspaper className="w-8 h-8 text-white" /></div> },
  { id: 'preview', name: 'Preview', icon: <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl flex items-center justify-center"><Image className="w-8 h-8 text-white" /></div> },
  { id: 'voice-memos', name: 'Voice Memos', icon: <div className="w-full h-full bg-gradient-to-b from-red-400 to-red-600 rounded-xl flex items-center justify-center"><Mic className="w-8 h-8 text-white" /></div> },
  { id: 'freeform', name: 'Freeform', icon: <div className="w-full h-full bg-gradient-to-b from-teal-400 to-teal-600 rounded-xl flex items-center justify-center"><PenTool className="w-8 h-8 text-white" /></div> },
  
  // Information
  { id: 'contacts', name: 'Contacts', icon: <div className="w-full h-full bg-gradient-to-b from-gray-400 to-gray-600 rounded-xl flex items-center justify-center"><Users className="w-8 h-8 text-white" /></div> },
  { id: 'dictionary', name: 'Dictionary', icon: <div className="w-full h-full bg-gradient-to-b from-gray-500 to-gray-700 rounded-xl flex items-center justify-center"><Book className="w-8 h-8 text-white" /></div> },
  { id: 'maps', name: 'Maps', icon: <div className="w-full h-full bg-gradient-to-b from-green-400 to-green-600 rounded-xl flex items-center justify-center"><Map className="w-8 h-8 text-white" /></div> },
  { id: 'stocks', name: 'Stocks', icon: <div className="w-full h-full bg-gradient-to-b from-gray-800 to-black rounded-xl flex items-center justify-center"><TrendingUp className="w-8 h-8 text-green-400" /></div> },
  { id: 'translate', name: 'Translate', icon: <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl flex items-center justify-center"><Languages className="w-8 h-8 text-white" /></div> },
  { id: 'passwords', name: 'Passwords', icon: <div className="w-full h-full bg-gradient-to-b from-gray-600 to-gray-800 rounded-xl flex items-center justify-center"><Key className="w-8 h-8 text-white" /></div> },
  
  // Hanzo Ecosystem
  { id: 'hanzo', name: 'Hanzo AI', icon: <HanzoIcon className="w-full h-full" /> },
  { id: 'lux', name: 'Lux Wallet', icon: <LuxLogo className="w-full h-full" /> },
  { id: 'zoo', name: 'Zoo', icon: <ZooLogo className="w-full h-full" /> },
];

export const Launchpad: React.FC<LaunchpadProps> = ({
  isOpen,
  onClose,
  onOpenApp,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredApps = searchQuery
    ? LAUNCHPAD_APPS.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : LAUNCHPAD_APPS;

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-2xl flex flex-col items-center pt-12 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 outline-none focus:bg-white/15 focus:border-white/30 transition-colors"
          autoFocus
        />
      </div>

      {/* App Grid */}
      <div className="flex-1 overflow-y-auto px-12 pb-12 w-full max-w-6xl">
        <div className="grid grid-cols-7 gap-6 justify-items-center">
          {filteredApps.map((app, index) => (
            <button
              key={app.id}
              onClick={() => {
                onOpenApp(app.id);
                onClose();
              }}
              className="flex flex-col items-center group"
              style={{
                animationDelay: `${index * 20}ms`,
              }}
            >
              <div className="w-16 h-16 mb-2 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-150">
                {app.icon}
              </div>
              <span className="text-white/90 text-xs text-center max-w-[80px] truncate">
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Close hint */}
      <div className="pb-6 text-white/40 text-xs">
        Press ESC or click outside to close
      </div>
    </div>
  );
};

export default Launchpad;
