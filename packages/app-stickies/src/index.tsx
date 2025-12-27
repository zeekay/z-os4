import React, { useState, useCallback } from 'react';
import { ZWindow } from '@z-os/ui';
import { Plus, Trash2, Pin, PinOff, StickyNote } from 'lucide-react';
import { cn } from '@z-os/ui';

interface StickiesWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface StickyNote {
  id: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: Date;
}

const COLORS = [
  { id: 'yellow', bg: 'bg-yellow-200', text: 'text-yellow-900', border: 'border-yellow-300' },
  { id: 'pink', bg: 'bg-pink-200', text: 'text-pink-900', border: 'border-pink-300' },
  { id: 'green', bg: 'bg-green-200', text: 'text-green-900', border: 'border-green-300' },
  { id: 'blue', bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-300' },
  { id: 'purple', bg: 'bg-purple-200', text: 'text-purple-900', border: 'border-purple-300' },
  { id: 'orange', bg: 'bg-orange-200', text: 'text-orange-900', border: 'border-orange-300' },
];

const StickiesWindow: React.FC<StickiesWindowProps> = ({ onClose, onFocus }) => {
  const [notes, setNotes] = useState<StickyNote[]>([
    {
      id: '1',
      content: 'Welcome to Stickies!\n\nClick the + button to add a new note.',
      color: 'yellow',
      pinned: true,
      createdAt: new Date(),
    },
    {
      id: '2',
      content: 'Shopping List:\n- Milk\n- Bread\n- Eggs\n- Coffee',
      color: 'pink',
      pinned: false,
      createdAt: new Date(),
    },
    {
      id: '3',
      content: 'Meeting notes:\n\nDiscuss project timeline\nReview budget\nAssign tasks',
      color: 'green',
      pinned: false,
      createdAt: new Date(),
    },
  ]);
  const [selectedNote, setSelectedNote] = useState<string | null>('1');

  const getColorClasses = (colorId: string) => {
    return COLORS.find(c => c.id === colorId) || COLORS[0];
  };

  const addNote = useCallback(() => {
    const newNote: StickyNote = {
      id: Date.now().toString(),
      content: '',
      color: COLORS[Math.floor(Math.random() * COLORS.length)].id,
      pinned: false,
      createdAt: new Date(),
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNote(newNote.id);
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote === id) {
      setSelectedNote(notes.length > 1 ? notes.find(n => n.id !== id)?.id || null : null);
    }
  }, [selectedNote, notes]);

  const updateNote = useCallback((id: string, content: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n));
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  }, []);

  const changeColor = useCallback((id: string, color: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, color } : n));
  }, []);

  const selectedNoteData = notes.find(n => n.id === selectedNote);

  return (
    <ZWindow
      title="Stickies"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 300, y: 100 }}
      initialSize={{ width: 700, height: 500 }}
    >
      <div className="flex h-full bg-[#2a2a2a]">
        {/* Sidebar - Note list */}
        <div className="w-48 bg-[#1e1e1e] border-r border-white/10 flex flex-col">
          <div className="p-2 border-b border-white/10">
            <button
              onClick={addNote}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(note => {
              const colors = getColorClasses(note.color);
              return (
                <button
                  key={note.id}
                  onClick={() => setSelectedNote(note.id)}
                  className={cn(
                    "w-full p-2 rounded-lg text-left transition-all",
                    colors.bg,
                    colors.text,
                    selectedNote === note.id ? "ring-2 ring-blue-500" : ""
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs line-clamp-3 flex-1">
                      {note.content || 'Empty note'}
                    </p>
                    {note.pinned && <Pin className="w-3 h-3 flex-shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content - Selected note */}
        <div className="flex-1 flex flex-col">
          {selectedNoteData ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between p-2 border-b border-white/10 bg-[#252525]">
                <div className="flex items-center gap-1">
                  {COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => changeColor(selectedNoteData.id, color.id)}
                      className={cn(
                        "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                        color.bg,
                        selectedNoteData.color === color.id ? "border-white ring-2 ring-white/50" : "border-transparent"
                      )}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePin(selectedNoteData.id)}
                    className={cn(
                      "p-1.5 rounded hover:bg-white/10 transition-colors",
                      selectedNoteData.pinned ? "text-yellow-400" : "text-white/50"
                    )}
                    title={selectedNoteData.pinned ? "Unpin note" : "Pin note"}
                  >
                    {selectedNoteData.pinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteNote(selectedNoteData.id)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Note editor */}
              <div className={cn("flex-1 p-0", getColorClasses(selectedNoteData.color).bg)}>
                <textarea
                  value={selectedNoteData.content}
                  onChange={(e) => updateNote(selectedNoteData.id, e.target.value)}
                  placeholder="Type your note here..."
                  className={cn(
                    "w-full h-full p-4 resize-none border-none outline-none bg-transparent",
                    getColorClasses(selectedNoteData.color).text,
                    "placeholder:opacity-50"
                  )}
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30">
              <div className="text-center">
                <p>No note selected</p>
                <button
                  onClick={addNote}
                  className="mt-2 text-yellow-400 hover:underline"
                >
                  Create a new note
                </button>
              </div>
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
 * Stickies app manifest
 */
export const StickiesManifest = {
  identifier: 'ai.hanzo.stickies',
  name: 'Stickies',
  version: '1.0.0',
  description: 'Sticky notes app for zOS',
  category: 'productivity' as const,
  permissions: ['storage'] as const,
  window: {
    type: 'default' as const,
    defaultSize: { width: 700, height: 500 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Stickies menu bar configuration
 */
export const StickiesMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newNote', label: 'New Note', shortcut: '⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close Note', shortcut: '⌘W' },
        { type: 'item' as const, id: 'closeAll', label: 'Close All', shortcut: '⌥⌘W' },
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
      id: 'note',
      label: 'Note',
      items: [
        { type: 'item' as const, id: 'floatOnTop', label: 'Float on Top' },
        { type: 'item' as const, id: 'translucent', label: 'Translucent' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'yellow', label: 'Yellow' },
        { type: 'item' as const, id: 'pink', label: 'Pink' },
        { type: 'item' as const, id: 'green', label: 'Green' },
        { type: 'item' as const, id: 'blue', label: 'Blue' },
        { type: 'item' as const, id: 'purple', label: 'Purple' },
        { type: 'item' as const, id: 'orange', label: 'Orange' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'arrangeByColor', label: 'Arrange by Color' },
        { type: 'item' as const, id: 'collapseAll', label: 'Collapse All' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'stickiesHelp', label: 'Stickies Help' },
      ],
    },
  ],
};

/**
 * Stickies dock configuration
 */
export const StickiesDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newNote', label: 'New Note' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Stickies App definition for registry
 */
export const StickiesApp = {
  manifest: StickiesManifest,
  component: StickiesWindow,
  icon: StickyNote,
  menuBar: StickiesMenuBar,
  dockConfig: StickiesDockConfig,
};

export default StickiesWindow;
