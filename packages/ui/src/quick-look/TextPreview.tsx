/**
 * TextPreview Component
 *
 * Displays text/code files with syntax highlighting.
 * Uses a simple, built-in syntax highlighter to avoid external dependencies.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../lib/utils';

export interface TextPreviewProps {
  content: string;
  language?: string;
  filename?: string;
  className?: string;
}

// Simple token types for syntax highlighting
type TokenType = 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'function' | 'plain';

interface Token {
  type: TokenType;
  value: string;
}

// Keywords for common languages
const KEYWORDS: Record<string, string[]> = {
  javascript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
    'switch', 'case', 'break', 'continue', 'class', 'extends', 'new', 'this', 'super',
    'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'finally',
    'throw', 'typeof', 'instanceof', 'true', 'false', 'null', 'undefined', 'void',
  ],
  typescript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
    'switch', 'case', 'break', 'continue', 'class', 'extends', 'new', 'this', 'super',
    'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'finally',
    'throw', 'typeof', 'instanceof', 'true', 'false', 'null', 'undefined', 'void',
    'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'implements',
    'public', 'private', 'protected', 'readonly', 'abstract', 'as', 'is', 'keyof',
  ],
  python: [
    'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally',
    'with', 'as', 'import', 'from', 'return', 'yield', 'raise', 'pass', 'break',
    'continue', 'lambda', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None',
    'global', 'nonlocal', 'assert', 'del', 'async', 'await',
  ],
  go: [
    'func', 'package', 'import', 'var', 'const', 'type', 'struct', 'interface',
    'map', 'chan', 'if', 'else', 'for', 'range', 'switch', 'case', 'default',
    'return', 'break', 'continue', 'goto', 'fallthrough', 'defer', 'go', 'select',
    'true', 'false', 'nil', 'iota',
  ],
  rust: [
    'fn', 'let', 'mut', 'const', 'static', 'struct', 'enum', 'trait', 'impl',
    'pub', 'mod', 'use', 'crate', 'self', 'super', 'if', 'else', 'match', 'for',
    'while', 'loop', 'break', 'continue', 'return', 'async', 'await', 'move',
    'true', 'false', 'Some', 'None', 'Ok', 'Err',
  ],
  json: ['true', 'false', 'null'],
  css: [
    '@import', '@media', '@keyframes', '@font-face', '@supports', '@charset',
  ],
  html: [],
};

// Language detection from filename
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
    ts: 'typescript', tsx: 'typescript', mts: 'typescript',
    py: 'python', pyw: 'python',
    go: 'go',
    rs: 'rust',
    json: 'json',
    css: 'css', scss: 'css', less: 'css',
    html: 'html', htm: 'html',
    md: 'markdown',
    yaml: 'yaml', yml: 'yaml',
    sh: 'bash', bash: 'bash', zsh: 'bash',
  };
  return langMap[ext] || 'plain';
}

// Simple tokenizer
function tokenize(code: string, language: string): Token[][] {
  const lines = code.split('\n');
  const keywords = KEYWORDS[language] || [];
  const keywordSet = new Set(keywords);

  return lines.map(line => {
    const tokens: Token[] = [];
    let i = 0;

    while (i < line.length) {
      // Comments
      if (line.slice(i, i + 2) === '//' || line[i] === '#') {
        tokens.push({ type: 'comment', value: line.slice(i) });
        break;
      }

      // Block comment start (simplistic)
      if (line.slice(i, i + 2) === '/*') {
        const end = line.indexOf('*/', i + 2);
        if (end !== -1) {
          tokens.push({ type: 'comment', value: line.slice(i, end + 2) });
          i = end + 2;
        } else {
          tokens.push({ type: 'comment', value: line.slice(i) });
          break;
        }
        continue;
      }

      // Strings (double quotes)
      if (line[i] === '"') {
        let j = i + 1;
        while (j < line.length && (line[j] !== '"' || line[j - 1] === '\\')) j++;
        tokens.push({ type: 'string', value: line.slice(i, j + 1) });
        i = j + 1;
        continue;
      }

      // Strings (single quotes)
      if (line[i] === "'") {
        let j = i + 1;
        while (j < line.length && (line[j] !== "'" || line[j - 1] === '\\')) j++;
        tokens.push({ type: 'string', value: line.slice(i, j + 1) });
        i = j + 1;
        continue;
      }

      // Template literals
      if (line[i] === '`') {
        let j = i + 1;
        while (j < line.length && line[j] !== '`') j++;
        tokens.push({ type: 'string', value: line.slice(i, j + 1) });
        i = j + 1;
        continue;
      }

      // Numbers
      if (/\d/.test(line[i])) {
        let j = i;
        while (j < line.length && /[\d.xXa-fA-FeE_]/.test(line[j])) j++;
        tokens.push({ type: 'number', value: line.slice(i, j) });
        i = j;
        continue;
      }

      // Words (identifiers/keywords)
      if (/[a-zA-Z_$]/.test(line[i])) {
        let j = i;
        while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
        const word = line.slice(i, j);
        const isFunction = line[j] === '(';

        if (keywordSet.has(word)) {
          tokens.push({ type: 'keyword', value: word });
        } else if (isFunction) {
          tokens.push({ type: 'function', value: word });
        } else {
          tokens.push({ type: 'plain', value: word });
        }
        i = j;
        continue;
      }

      // Operators
      if (/[+\-*/%=<>!&|^~?:]/.test(line[i])) {
        tokens.push({ type: 'operator', value: line[i] });
        i++;
        continue;
      }

      // Everything else
      tokens.push({ type: 'plain', value: line[i] });
      i++;
    }

    return tokens;
  });
}

// Token color mapping
const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: 'text-purple-400',
  string: 'text-green-400',
  comment: 'text-white/40 italic',
  number: 'text-orange-400',
  operator: 'text-cyan-400',
  function: 'text-blue-400',
  plain: 'text-white/90',
};

export function TextPreview({ content, language, filename, className }: TextPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  const detectedLanguage = useMemo(() => {
    if (language) return language;
    if (filename) return detectLanguage(filename);
    return 'plain';
  }, [language, filename]);

  const tokenizedLines = useMemo(() => {
    return tokenize(content, detectedLanguage);
  }, [content, detectedLanguage]);

  useEffect(() => {
    // Simulate a brief loading state for large files
    const timer = setTimeout(() => setIsLoading(false), 50);
    return () => clearTimeout(timer);
  }, [content]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn('h-full overflow-auto', className)}>
      <pre className="p-4 text-sm font-mono leading-relaxed">
        <code>
          {tokenizedLines.map((tokens, lineIndex) => (
            <div key={lineIndex} className="flex">
              {/* Line number */}
              <span className="inline-block w-12 text-right pr-4 text-white/30 select-none shrink-0">
                {lineIndex + 1}
              </span>
              {/* Line content */}
              <span className="flex-1 whitespace-pre">
                {tokens.length === 0 ? '\n' : tokens.map((token, tokenIndex) => (
                  <span key={tokenIndex} className={TOKEN_COLORS[token.type]}>
                    {token.value}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

export default TextPreview;
