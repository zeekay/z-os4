/**
 * Mail App
 *
 * Email client for zOS following macOS Mail patterns.
 */

import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { Inbox, Send, Archive, Trash2, Star, Edit3, Mail as MailIcon } from 'lucide-react';

interface MailWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  starred: boolean;
}

const mockEmails: Email[] = [
  { id: '1', from: 'Hanzo AI', subject: 'Welcome to zOS', preview: 'Thank you for using zOS. Here are some tips to get started...', date: 'Today', read: false, starred: true },
  { id: '2', from: 'System', subject: 'Security Update Available', preview: 'A new security update is available for your system...', date: 'Yesterday', read: false, starred: false },
  { id: '3', from: 'Developer Team', subject: 'New Features Released', preview: 'We are excited to announce new features including...', date: 'Dec 20', read: true, starred: false },
  { id: '4', from: 'Newsletter', subject: 'Weekly Digest', preview: 'Here is your weekly summary of activities...', date: 'Dec 18', read: true, starred: false },
];

const folders = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, count: 2 },
  { id: 'sent', label: 'Sent', icon: Send, count: 0 },
  { id: 'archive', label: 'Archive', icon: Archive, count: 0 },
  { id: 'trash', label: 'Trash', icon: Trash2, count: 0 },
];

const MailWindow: React.FC<MailWindowProps> = ({ onClose, onFocus }) => {
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const email = mockEmails.find(e => e.id === selectedEmail);

  return (
    <ZWindow
      title="Mail"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 100, y: 60 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="system"
    >
      <div className="flex h-full bg-[#1e1e1e]">
        {/* Sidebar */}
        <div className="w-56 bg-[#2c2c2e] border-r border-white/10 flex flex-col">
          {/* Compose button */}
          <div className="p-3">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              <Edit3 className="w-4 h-4" />
              <span>Compose</span>
            </button>
          </div>

          {/* Folders */}
          <div className="flex-1 p-2">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  selectedFolder === folder.id ? 'bg-blue-500/20 text-blue-400' : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <folder.icon className="w-4 h-4" />
                <span className="flex-1 text-left text-sm">{folder.label}</span>
                {folder.count > 0 && (
                  <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                    {folder.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="w-72 border-r border-white/10 flex flex-col">
          <div className="p-3 border-b border-white/10">
            <input
              type="text"
              placeholder="Search Mail"
              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockEmails.map((email) => (
              <button
                key={email.id}
                onClick={() => setSelectedEmail(email.id)}
                className={`w-full p-3 border-b border-white/5 text-left transition-colors ${
                  selectedEmail === email.id ? 'bg-blue-500/20' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${email.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                  <span className={`text-sm flex-1 truncate ${email.read ? 'text-white/70' : 'text-white font-semibold'}`}>
                    {email.from}
                  </span>
                  {email.starred && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                </div>
                <p className={`text-sm truncate mb-1 ${email.read ? 'text-white/50' : 'text-white/80'}`}>
                  {email.subject}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-white/40 truncate flex-1">{email.preview}</p>
                  <span className="text-xs text-white/30">{email.date}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 flex flex-col">
          {email ? (
            <>
              <div className="p-4 border-b border-white/10">
                <h2 className="text-white text-lg font-semibold mb-2">{email.subject}</h2>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {email.from[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{email.from}</p>
                    <p className="text-white/40 text-xs">{email.date}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-white/70 leading-relaxed">{email.preview}</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30">
              Select an email to read
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Mail app manifest
 */
export const MailManifest = {
  identifier: 'ai.hanzo.mail',
  name: 'Mail',
  version: '1.0.0',
  description: 'Email client for zOS',
  category: 'productivity' as const,
  permissions: ['network', 'storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 900, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Mail menu bar configuration
 */
export const MailMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newMessage', label: 'New Message', shortcut: '⌘N' },
        { type: 'item' as const, id: 'newMailbox', label: 'New Mailbox...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'saveAs', label: 'Save As...', shortcut: '⌘S' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'print', label: 'Print...', shortcut: '⌘P' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'undo', label: 'Undo', shortcut: '⌘Z' },
        { type: 'item' as const, id: 'redo', label: 'Redo', shortcut: '⇧⌘Z' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'cut', label: 'Cut', shortcut: '⌘X' },
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
        { type: 'item' as const, id: 'paste', label: 'Paste', shortcut: '⌘V' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'selectAll', label: 'Select All', shortcut: '⌘A' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showMailboxList', label: 'Show Mailbox List', shortcut: '⇧⌘M' },
        { type: 'item' as const, id: 'showPreviewPane', label: 'Show Preview' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'sortByDate', label: 'Sort by Date' },
        { type: 'item' as const, id: 'sortByFrom', label: 'Sort by From' },
        { type: 'item' as const, id: 'sortBySubject', label: 'Sort by Subject' },
      ],
    },
    {
      id: 'mailbox',
      label: 'Mailbox',
      items: [
        { type: 'item' as const, id: 'getMail', label: 'Get New Mail', shortcut: '⇧⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'archive', label: 'Archive', shortcut: '⌃⌘A' },
        { type: 'item' as const, id: 'moveToJunk', label: 'Move to Junk', shortcut: '⇧⌘J' },
        { type: 'item' as const, id: 'moveToTrash', label: 'Move to Trash', shortcut: '⌘⌫' },
      ],
    },
    {
      id: 'message',
      label: 'Message',
      items: [
        { type: 'item' as const, id: 'reply', label: 'Reply', shortcut: '⌘R' },
        { type: 'item' as const, id: 'replyAll', label: 'Reply All', shortcut: '⇧⌘R' },
        { type: 'item' as const, id: 'forward', label: 'Forward', shortcut: '⇧⌘F' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'markAsRead', label: 'Mark as Read', shortcut: '⇧⌘U' },
        { type: 'item' as const, id: 'flagMessage', label: 'Flag', shortcut: '⇧⌘L' },
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
        { type: 'item' as const, id: 'mailHelp', label: 'Mail Help' },
      ],
    },
  ],
};

/**
 * Mail dock configuration
 */
export const MailDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newMessage', label: 'New Message' },
    { type: 'item' as const, id: 'getMail', label: 'Get New Mail' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Mail App definition for registry
 */
export const MailApp = {
  manifest: MailManifest,
  component: MailWindow,
  icon: MailIcon,
  menuBar: MailMenuBar,
  dockConfig: MailDockConfig,
};

export default MailWindow;
