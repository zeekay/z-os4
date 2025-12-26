import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { cn, ZWindow } from '@z-os/ui';
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Play,
  Square,
  GitBranch,
  GitPullRequest,
  Github,
  RefreshCw,
  Terminal,
  X,
  Plus,
  Search,
  Eye,
  Code2,
  Layers,
  Box,
  Cpu
} from 'lucide-react';

// Virtual file system structure
interface FileNode {
  name: string;
  type: 'file' | 'folder' | 'app';
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

const getLanguageExtension = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return javascript({ jsx: true, typescript: ext?.includes('t') });
    case 'md':
    case 'markdown':
      return markdown();
    case 'json':
      return json();
    case 'css':
    case 'scss':
    case 'sass':
      return css();
    case 'html':
    case 'htm':
      return html();
    default:
      return [];
  }
};

// Virtual file system representing zOS source
const createVirtualFileSystem = (): FileNode => ({
  name: 'zOS',
  type: 'folder',
  path: '/',
  children: [
    {
      name: 'Applications',
      type: 'folder',
      path: '/Applications',
      children: [
        {
          name: 'Terminal.app',
          type: 'app',
          path: '/Applications/Terminal.app',
          children: [
            { name: 'TerminalWindow.tsx', type: 'file', path: '/Applications/Terminal.app/TerminalWindow.tsx', language: 'tsx' },
            { name: 'manifest.json', type: 'file', path: '/Applications/Terminal.app/manifest.json', language: 'json' },
          ]
        },
        {
          name: 'Safari.app',
          type: 'app',
          path: '/Applications/Safari.app',
          children: [
            { name: 'SafariWindow.tsx', type: 'file', path: '/Applications/Safari.app/SafariWindow.tsx', language: 'tsx' },
            { name: 'manifest.json', type: 'file', path: '/Applications/Safari.app/manifest.json', language: 'json' },
          ]
        },
        {
          name: 'Finder.app',
          type: 'app',
          path: '/Applications/Finder.app',
          children: [
            { name: 'FinderWindow.tsx', type: 'file', path: '/Applications/Finder.app/FinderWindow.tsx', language: 'tsx' },
            { name: 'manifest.json', type: 'file', path: '/Applications/Finder.app/manifest.json', language: 'json' },
          ]
        },
        {
          name: 'Calculator.app',
          type: 'app',
          path: '/Applications/Calculator.app',
          children: [
            { name: 'CalculatorWindow.tsx', type: 'file', path: '/Applications/Calculator.app/CalculatorWindow.tsx', language: 'tsx' },
            { name: 'manifest.json', type: 'file', path: '/Applications/Calculator.app/manifest.json', language: 'json' },
          ]
        },
      ]
    },
    {
      name: 'System',
      type: 'folder',
      path: '/System',
      children: [
        {
          name: 'Core',
          type: 'folder',
          path: '/System/Core',
          children: [
            { name: 'Desktop.tsx', type: 'file', path: '/System/Core/Desktop.tsx', language: 'tsx' },
            { name: 'MenuBar.tsx', type: 'file', path: '/System/Core/MenuBar.tsx', language: 'tsx' },
            { name: 'Dock.tsx', type: 'file', path: '/System/Core/Dock.tsx', language: 'tsx' },
            { name: 'Spotlight.tsx', type: 'file', path: '/System/Core/Spotlight.tsx', language: 'tsx' },
          ]
        },
        {
          name: 'Hooks',
          type: 'folder',
          path: '/System/Hooks',
          children: [
            { name: 'useWindowManager.ts', type: 'file', path: '/System/Hooks/useWindowManager.ts', language: 'ts' },
          ]
        },
      ]
    },
    {
      name: 'Library',
      type: 'folder',
      path: '/Library',
      children: [
        { name: 'utils.ts', type: 'file', path: '/Library/utils.ts', language: 'ts' },
        { name: 'terminal.ts', type: 'file', path: '/Library/terminal.ts', language: 'ts' },
      ]
    },
  ]
});

interface FileTreeProps {
  node: FileNode;
  level: number;
  selectedPath: string | null;
  onSelect: (node: FileNode) => void;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  node,
  level,
  selectedPath,
  onSelect,
  expandedPaths,
  onToggleExpand,
}) => {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const isFolder = node.type === 'folder' || node.type === 'app';

  const getIcon = () => {
    if (node.type === 'app') {
      return <Box className="w-4 h-4 text-blue-400" />;
    }
    if (node.type === 'folder') {
      return <Folder className="w-4 h-4 text-blue-400" />;
    }
    const ext = node.name.split('.').pop();
    if (ext === 'tsx' || ext === 'ts') {
      return <Code2 className="w-4 h-4 text-blue-300" />;
    }
    if (ext === 'json') {
      return <Layers className="w-4 h-4 text-yellow-400" />;
    }
    return <File className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 cursor-pointer rounded text-sm',
          'hover:bg-[#2a2d2e]',
          isSelected && 'bg-[#094771]'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (isFolder) {
            onToggleExpand(node.path);
          }
          onSelect(node);
        }}
      >
        {isFolder && (
          <span className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        )}
        {!isFolder && <span className="w-4" />}
        {getIcon()}
        <span className={cn(
          'truncate',
          node.type === 'app' && 'font-medium'
        )}>
          {node.name}
        </span>
      </div>
      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTree
              key={child.path}
              node={child}
              level={level + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              expandedPaths={expandedPaths}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface OpenFile {
  path: string;
  name: string;
  content: string;
  modified: boolean;
  language: string;
}

interface CodeWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const CodeWindow: React.FC<CodeWindowProps> = ({ onClose, onFocus }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const [fileSystem] = useState<FileNode>(createVirtualFileSystem);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(['/', '/Applications', '/System'])
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildOutput, setBuildOutput] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [gitBranch, setGitBranch] = useState('main');
  const [showGitPanel, setShowGitPanel] = useState(false);
  const [prTitle, setPrTitle] = useState('');
  const [prDescription, setPrDescription] = useState('');

  // Sample file contents
  const fileContents: Record<string, string> = {
    '/Applications/Terminal.app/manifest.json': JSON.stringify({
      name: 'Terminal',
      identifier: 'ai.zeekay.zos.terminal',
      version: '1.0.0',
      icon: 'Terminal',
      entry: 'TerminalWindow.tsx',
      permissions: ['filesystem', 'network', 'shell'],
    }, null, 2),
    '/Applications/Calculator.app/manifest.json': JSON.stringify({
      name: 'Calculator',
      identifier: 'ai.zeekay.zos.calculator',
      version: '1.0.0',
      icon: 'Calculator',
      entry: 'CalculatorWindow.tsx',
      permissions: [],
    }, null, 2),
  };

  const handleToggleExpand = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleFileSelect = useCallback((node: FileNode) => {
    setSelectedPath(node.path);

    if (node.type === 'file') {
      const existing = openFiles.find(f => f.path === node.path);
      if (existing) {
        setActiveFile(node.path);
        return;
      }

      let content = fileContents[node.path] || '';

      if (!content) {
        content = `// Source: ${node.path}
//
// This file can be edited and submitted as a PR to zOS!
//
// To contribute:
// 1. Fork github.com/zeekay/z-os4
// 2. Edit this file
// 3. Create a Pull Request

export default function Component() {
  return null;
}
`;
      }

      const newFile: OpenFile = {
        path: node.path,
        name: node.name,
        content,
        modified: false,
        language: node.language || 'tsx',
      };

      setOpenFiles(prev => [...prev, newFile]);
      setActiveFile(node.path);
    }
  }, [openFiles, fileContents]);

  const handleCloseFile = useCallback((path: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenFiles(prev => prev.filter(f => f.path !== path));
    if (activeFile === path) {
      setActiveFile(openFiles.find(f => f.path !== path)?.path || null);
    }
  }, [activeFile, openFiles]);

  const handleSave = useCallback(() => {
    if (!activeFile) return;

    const file = openFiles.find(f => f.path === activeFile);
    if (!file) return;

    setOpenFiles(prev => prev.map(f =>
      f.path === activeFile ? { ...f, modified: false } : f
    ));

    console.log('File saved:', file.name);
  }, [activeFile, openFiles]);

  const handleBuild = useCallback(async () => {
    setIsBuilding(true);
    setBuildOutput(['Building zOS...', '']);

    await new Promise(r => setTimeout(r, 500));
    setBuildOutput(prev => [...prev, '✓ Compiling TypeScript...']);

    await new Promise(r => setTimeout(r, 500));
    setBuildOutput(prev => [...prev, '✓ Bundling with Vite...']);

    await new Promise(r => setTimeout(r, 500));
    setBuildOutput(prev => [...prev, '✓ Optimizing assets...']);

    await new Promise(r => setTimeout(r, 300));
    setBuildOutput(prev => [...prev, '', '✅ Build successful!', '', 'Ready to deploy to zeekay.ai']);

    setIsBuilding(false);
  }, []);

  const handleCreateBranch = useCallback(() => {
    const branchName = `feature/zos-edit-${Date.now()}`;
    setGitBranch(branchName);
  }, []);

  const handleCreatePR = useCallback(() => {
    if (!prTitle) return;

    const prUrl = `https://github.com/zeekay/z-os4/compare/main...${gitBranch}`;
    window.open(prUrl, '_blank');

    setPrTitle('');
    setPrDescription('');
    setShowGitPanel(false);
  }, [prTitle, gitBranch]);

  // Setup editor when active file changes
  useEffect(() => {
    if (!editorRef.current || !activeFile) return;

    const file = openFiles.find(f => f.path === activeFile);
    if (!file) return;

    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const languageExt = getLanguageExtension(file.name);

    const state = EditorState.create({
      doc: file.content,
      extensions: [
        basicSetup,
        oneDark,
        languageExt,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            setOpenFiles(prev => prev.map(f =>
              f.path === activeFile ? { ...f, content: newContent, modified: true } : f
            ));
          }
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '13px' },
          '.cm-scroller': {
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
          },
          '.cm-content': { caretColor: '#fff' },
          '.cm-cursor': { borderLeftColor: '#fff', borderLeftWidth: '2px' },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    view.focus();

    return () => {
      view.destroy();
    };
  }, [activeFile, openFiles]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleBuild();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleBuild]);

  return (
    <ZWindow
      title="Xcode"
      onClose={onClose}
      onFocus={onFocus}
      initialSize={{ width: 1200, height: 800 }}
      initialPosition={{ x: 100, y: 60 }}
    >
      <div className="flex flex-col h-full bg-[#1e1e1e] text-white">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#323233] border-b border-[#3c3c3c]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBuild}
              disabled={isBuilding}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium',
                'bg-[#0066cc] hover:bg-[#0055aa] disabled:opacity-50'
              )}
            >
              {isBuilding ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isBuilding ? 'Building...' : 'Build'}
            </button>
            <button
              onClick={() => setIsBuilding(false)}
              disabled={!isBuilding}
              className="p-1.5 rounded hover:bg-[#3c3c3c] disabled:opacity-30"
            >
              <Square className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-[#3c3c3c] mx-2" />
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={cn(
                'p-1.5 rounded',
                showPreview ? 'bg-[#0066cc]' : 'hover:bg-[#3c3c3c]'
              )}
              title="Toggle Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGitPanel(!showGitPanel)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded text-sm',
                showGitPanel ? 'bg-[#0066cc]' : 'hover:bg-[#3c3c3c]'
              )}
            >
              <GitBranch className="w-4 h-4" />
              {gitBranch}
            </button>
            <button
              className="flex items-center gap-1.5 px-2 py-1 rounded text-sm hover:bg-[#3c3c3c]"
              onClick={() => window.open('https://github.com/zeekay/z-os4', '_blank')}
            >
              <Github className="w-4 h-4" />
              GitHub
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - File Navigator */}
          <div className="w-64 bg-[#252526] border-r border-[#3c3c3c] flex flex-col">
            <div className="p-2 border-b border-[#3c3c3c]">
              <div className="flex items-center gap-2 px-2 py-1 bg-[#3c3c3c] rounded text-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  className="bg-transparent border-none outline-none flex-1 text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <FileTree
                node={fileSystem}
                level={0}
                selectedPath={selectedPath}
                onSelect={handleFileSelect}
                expandedPaths={expandedPaths}
                onToggleExpand={handleToggleExpand}
              />
            </div>

            {/* .app Bundle Info */}
            {selectedPath?.endsWith('.app') && (
              <div className="p-3 border-t border-[#3c3c3c] text-xs">
                <div className="font-medium mb-2 flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  App Bundle
                </div>
                <div className="text-gray-400 space-y-1">
                  <div>Format: zOS .app bundle</div>
                  <div>Type: React Component</div>
                  <div>Hot Reload: Enabled</div>
                </div>
              </div>
            )}
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Tab Bar */}
            {openFiles.length > 0 && (
              <div className="flex items-center bg-[#2d2d2d] border-b border-[#3c3c3c] overflow-x-auto">
                {openFiles.map(file => (
                  <div
                    key={file.path}
                    onClick={() => setActiveFile(file.path)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r border-[#3c3c3c]',
                      'hover:bg-[#2a2d2e]',
                      activeFile === file.path && 'bg-[#1e1e1e]'
                    )}
                  >
                    <Code2 className="w-4 h-4 text-blue-400" />
                    <span className={cn(file.modified && 'italic')}>
                      {file.name}
                      {file.modified && ' •'}
                    </span>
                    <button
                      onClick={(e) => handleCloseFile(file.path, e)}
                      className="p-0.5 rounded hover:bg-[#3c3c3c]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Editor / Welcome */}
            <div className="flex-1 flex">
              {activeFile ? (
                <div ref={editorRef} className="flex-1 overflow-hidden" />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
                  <div className="text-center text-gray-400 max-w-md">
                    <Code2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-semibold text-gray-200 mb-2">
                      Welcome to Xcode for zOS
                    </h2>
                    <p className="text-sm mb-4">
                      Edit zOS source code, build, and submit PRs directly from your browser.
                    </p>
                    <div className="text-xs space-y-1">
                      <div>⌘S to save • ⌘B to build</div>
                      <div>Select a file from the navigator to begin</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Panel */}
              {showPreview && (
                <div className="w-1/2 border-l border-[#3c3c3c] bg-white">
                  <div className="p-2 bg-[#2d2d2d] text-sm text-gray-400 border-b border-[#3c3c3c]">
                    Live Preview
                  </div>
                  <iframe
                    src="/"
                    className="w-full h-full"
                    title="zOS Preview"
                  />
                </div>
              )}
            </div>

            {/* Build Output */}
            {buildOutput.length > 0 && (
              <div className="h-32 bg-[#1e1e1e] border-t border-[#3c3c3c] overflow-auto">
                <div className="flex items-center justify-between px-3 py-1 bg-[#2d2d2d] border-b border-[#3c3c3c]">
                  <div className="flex items-center gap-2 text-sm">
                    <Terminal className="w-4 h-4" />
                    Build Output
                  </div>
                  <button
                    onClick={() => setBuildOutput([])}
                    className="p-1 rounded hover:bg-[#3c3c3c]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-2 font-mono text-xs">
                  {buildOutput.map((line, i) => (
                    <div key={i} className={cn(
                      line.startsWith('✓') && 'text-green-400',
                      line.startsWith('✅') && 'text-green-400 font-bold',
                      line.startsWith('❌') && 'text-red-400'
                    )}>
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Git Panel */}
          {showGitPanel && (
            <div className="w-80 bg-[#252526] border-l border-[#3c3c3c] flex flex-col">
              <div className="p-3 border-b border-[#3c3c3c]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-medium">
                    <GitPullRequest className="w-4 h-4" />
                    Create Pull Request
                  </div>
                  <button
                    onClick={() => setShowGitPanel(false)}
                    className="p-1 rounded hover:bg-[#3c3c3c]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Branch</div>
                    <div className="flex items-center gap-2">
                      <span className="flex-1 px-2 py-1 bg-[#3c3c3c] rounded text-sm">
                        {gitBranch}
                      </span>
                      {gitBranch === 'main' && (
                        <button
                          onClick={handleCreateBranch}
                          className="p-1.5 rounded bg-[#0066cc] hover:bg-[#0055aa]"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-1">Title</div>
                    <input
                      type="text"
                      value={prTitle}
                      onChange={(e) => setPrTitle(e.target.value)}
                      placeholder="Add feature to zOS..."
                      className="w-full px-2 py-1.5 bg-[#3c3c3c] rounded text-sm border border-transparent focus:border-[#0066cc] outline-none"
                    />
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-1">Description</div>
                    <textarea
                      value={prDescription}
                      onChange={(e) => setPrDescription(e.target.value)}
                      placeholder="Describe your changes..."
                      rows={4}
                      className="w-full px-2 py-1.5 bg-[#3c3c3c] rounded text-sm border border-transparent focus:border-[#0066cc] outline-none resize-none"
                    />
                  </div>

                  <button
                    onClick={handleCreatePR}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#238636] hover:bg-[#2ea043] rounded text-sm font-medium"
                  >
                    <GitPullRequest className="w-4 h-4" />
                    Create Pull Request
                  </button>
                </div>
              </div>

              <div className="flex-1 p-3 overflow-auto">
                <div className="text-xs text-gray-400 mb-2">Modified Files</div>
                {openFiles.filter(f => f.modified).map(file => (
                  <div
                    key={file.path}
                    className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-[#2a2d2e] rounded"
                  >
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    {file.name}
                  </div>
                ))}
                {openFiles.filter(f => f.modified).length === 0 && (
                  <div className="text-sm text-gray-500">No modified files</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default CodeWindow;
