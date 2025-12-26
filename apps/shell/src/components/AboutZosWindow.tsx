import React, { useState, useEffect } from 'react';
import { cn } from '@z-os/ui';

// Extend Navigator interface for non-standard deviceMemory property
interface NavigatorWithDeviceMemory extends Navigator {
  deviceMemory?: number;
}

interface AboutZosWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

// Z Logo for About window
const ZLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn("w-24 h-24", className)}
  >
    <rect width="100" height="100" rx="12" fill="#000000"/>
    <path d="M 15 15 H 85 V 30 L 35 70 H 85 V 85 H 15 V 70 L 65 30 H 15 Z" fill="#ffffff"/>
  </svg>
);

// System info interface
interface SystemInfo {
  platform: string;
  browser: string;
  screenResolution: string;
  colorDepth: string;
  language: string;
  timezone: string;
  memory?: string;
  cores?: number;
}

const getSystemInfo = (): SystemInfo => {
  const ua = navigator.userAgent;

  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  // Detect platform
  let platform = 'Unknown';
  if (ua.includes('Mac')) platform = 'macOS';
  else if (ua.includes('Windows')) platform = 'Windows';
  else if (ua.includes('Linux')) platform = 'Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) platform = 'iOS';
  else if (ua.includes('Android')) platform = 'Android';

  return {
    platform,
    browser,
    screenResolution: `${window.screen.width} × ${window.screen.height}`,
    colorDepth: `${window.screen.colorDepth}-bit`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    memory: (navigator as NavigatorWithDeviceMemory).deviceMemory ? `${(navigator as NavigatorWithDeviceMemory).deviceMemory} GB` : undefined,
    cores: navigator.hardwareConcurrency,
  };
};

const AboutZosWindow: React.FC<AboutZosWindowProps> = ({ isOpen, onClose }) => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSystemInfo(getSystemInfo());
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[30000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[420px] bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Window controls */}
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>

        <div className="flex flex-col items-center justify-start px-6 pb-6 text-white">
          {/* Logo */}
          <ZLogo className="w-24 h-24 mb-4" />

          {/* Title */}
          <h1 className="text-2xl font-semibold mb-1">zOS</h1>
          <p className="text-sm text-white/60 mb-4">Version 4.2.0</p>

          {/* Tagline */}
          <p className="text-xs text-white/50 mb-6 text-center max-w-[280px]">
            Open Source • Decentralized Intelligence
          </p>

          {/* System Info */}
          {systemInfo && (
            <div className="w-full max-w-[320px] space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/50">Platform</span>
                <span className="text-white/90">{systemInfo.platform}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/50">Browser</span>
                <span className="text-white/90">{systemInfo.browser}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/50">Display</span>
                <span className="text-white/90">{systemInfo.screenResolution}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/50">Color Depth</span>
                <span className="text-white/90">{systemInfo.colorDepth}</span>
              </div>
              {systemInfo.cores && (
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-white/50">CPU Cores</span>
                  <span className="text-white/90">{systemInfo.cores}</span>
                </div>
              )}
              {systemInfo.memory && (
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-white/50">Memory</span>
                  <span className="text-white/90">{systemInfo.memory}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/50">Language</span>
                <span className="text-white/90">{systemInfo.language}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/50">Timezone</span>
                <span className="text-white/90 text-xs">{systemInfo.timezone}</span>
              </div>
            </div>
          )}

          {/* Links */}
          <div className="mt-6 flex gap-4 text-xs">
            <a
              href="https://github.com/zeekay/z-os4"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              GitHub
            </a>
            <span className="text-white/20">•</span>
            <a
              href="https://zeekay.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              zeekay.ai
            </a>
          </div>

          {/* Copyright */}
          <p className="mt-4 text-[10px] text-white/30 text-center">
            © {new Date().getFullYear()} Zach Kelling. All rights reserved.
          </p>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AboutZosWindow;
