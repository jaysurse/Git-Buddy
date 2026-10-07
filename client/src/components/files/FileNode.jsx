import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Sparkles } from 'lucide-react';
import { getFileIcon } from '../../utils/fileIcons.jsx';
import { formatBytes } from '../../utils/formatters.js';
import Badge from '../common/Badge.jsx';

export function FileNode({ node, level = 0, onSelectFile, searchFilter, extFilter }) {
  const [isOpen, setIsOpen] = useState(level < 1); // Expand root folders by default
  const isFolder = node.type === 'folder';

  // If searchFilter or extFilter is active, auto-expand folders that contain matches
  const shouldFilterMatch = (item) => {
    if (!searchFilter && !extFilter) return true;
    if (item.type === 'file') {
      const matchSearch = !searchFilter || item.name.toLowerCase().includes(searchFilter.toLowerCase());
      const matchExt = !extFilter || item.extension === extFilter;
      return matchSearch && matchExt;
    }
    // Folder matches if any recursive child matches
    return item.children?.some((child) => shouldFilterMatch(child));
  };

  if (!shouldFilterMatch(node)) {
    return null;
  }

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        style={{ paddingLeft: `${Math.max(level * 18 + 8, 8)}px` }}
        className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer select-none transition-colors min-h-[38px] ${
          isFolder ? 'hover:bg-dark-900 text-slate-200' : 'hover:bg-dark-800 text-slate-300'
        } ${node.isImportant ? 'bg-brand-500/5' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {isFolder ? (
            <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          ) : (
            <span className="w-4" />
          )}

          {getFileIcon(node.name, isFolder, isOpen)}

          <span
            className={`text-xs font-mono truncate ${
              isFolder ? 'font-semibold text-slate-200' : 'text-slate-300'
            } ${node.isImportant ? 'text-brand-300 font-semibold' : ''}`}
          >
            {node.name}
          </span>

          {node.isImportant && (
            <Badge variant="brand" size="sm" className="hidden sm:inline-flex">
              {node.importantInfo?.badge || 'Landmark'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono text-slate-500">
          {!isFolder && <span>{formatBytes(node.size)}</span>}
          {isFolder && node.children && (
            <span className="text-[10px] text-slate-600">
              {node.children.length} {node.children.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
      </div>

      {/* Recursive Render for children */}
      {isFolder && isOpen && node.children && (
        <div className="relative border-l border-dark-800/80 ml-4 sm:ml-5">
          {node.children.map((child) => (
            <FileNode
              key={child.path}
              node={child}
              level={level + 1}
              onSelectFile={onSelectFile}
              searchFilter={searchFilter}
              extFilter={extFilter}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FileNode;
