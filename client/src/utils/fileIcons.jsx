import React from 'react';
import {
  FileCode,
  FileText,
  FileJson,
  FileSpreadsheet,
  Settings,
  Folder,
  FolderOpen,
  Image,
  Terminal,
  Shield,
  Layers,
  Database,
  Globe,
  File,
} from 'lucide-react';

export function getFileIcon(fileName, isFolder = false, isOpen = false) {
  if (isFolder) {
    return isOpen ? (
      <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
    ) : (
      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
    );
  }

  const name = (fileName || '').toLowerCase();
  const ext = name.split('.').pop();

  if (name === 'package.json' || name === 'pom.xml' || name === 'go.mod' || name === 'cargo.toml') {
    return <Layers className="w-4 h-4 text-emerald-400 shrink-0" />;
  }

  if (name === 'dockerfile' || name.startsWith('docker-compose')) {
    return <Terminal className="w-4 h-4 text-sky-400 shrink-0" />;
  }

  if (name === '.gitignore' || name === 'license') {
    return <Shield className="w-4 h-4 text-slate-400 shrink-0" />;
  }

  if (name.endsWith('.env.example') || name.includes('config')) {
    return <Settings className="w-4 h-4 text-amber-300 shrink-0" />;
  }

  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
      return <FileCode className="w-4 h-4 text-yellow-400 shrink-0" />;
    case 'ts':
    case 'tsx':
      return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
    case 'html':
    case 'htm':
      return <Globe className="w-4 h-4 text-orange-400 shrink-0" />;
    case 'css':
    case 'scss':
    case 'less':
      return <FileCode className="w-4 h-4 text-pink-400 shrink-0" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-emerald-400 shrink-0" />;
    case 'md':
    case 'markdown':
    case 'txt':
      return <FileText className="w-4 h-4 text-slate-300 shrink-0" />;
    case 'py':
      return <FileCode className="w-4 h-4 text-blue-300 shrink-0" />;
    case 'java':
    case 'kt':
      return <FileCode className="w-4 h-4 text-red-400 shrink-0" />;
    case 'go':
      return <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />;
    case 'rs':
      return <FileCode className="w-4 h-4 text-orange-500 shrink-0" />;
    case 'sql':
      return <Database className="w-4 h-4 text-purple-400 shrink-0" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <Image className="w-4 h-4 text-teal-400 shrink-0" />;
    case 'sh':
    case 'bash':
      return <Terminal className="w-4 h-4 text-green-400 shrink-0" />;
    case 'csv':
      return <FileSpreadsheet className="w-4 h-4 text-green-500 shrink-0" />;
    default:
      return <File className="w-4 h-4 text-slate-400 shrink-0" />;
  }
}
