import React, { useState, useMemo } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { Search, Filter, FolderTree, FileCode, Sparkles, X, Layers } from 'lucide-react';
import FileNode from '../components/files/FileNode.jsx';
import FilePreviewModal from '../components/files/FilePreviewModal.jsx';
import Badge from '../components/common/Badge.jsx';

export function FilesPage() {
  const { repositoryData } = useOutletContext();
  const { owner, repo } = useParams();

  const [search, setSearch] = useState('');
  const [selectedExt, setSelectedExt] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fileTree = repositoryData?.fileTree || [];
  const importantFiles = repositoryData?.importantFiles || [];
  const defaultBranch = repositoryData?.repository?.default_branch || 'main';

  // Compute all unique extensions in the tree for the filter dropdown/pills
  const availableExtensions = useMemo(() => {
    const exts = new Set();
    function collect(nodes) {
      for (const n of nodes) {
        if (n.type === 'file' && n.extension) {
          exts.add(n.extension);
        }
        if (n.children) {
          collect(n.children);
        }
      }
    }
    collect(fileTree);
    return Array.from(exts).slice(0, 10);
  }, [fileTree]);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Extension Filters */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files by name (e.g. index, package, auth)..."
            className="w-full pl-10 pr-9 py-2.5 bg-dark-950 border border-dark-700 rounded-xl text-slate-200 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="p-1 text-slate-500 hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Extension Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Filter:
          </span>
          <button
            onClick={() => setSelectedExt('')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors shrink-0 ${
              selectedExt === ''
                ? 'bg-brand-500 text-dark-950 font-bold'
                : 'bg-dark-950 text-slate-400 hover:text-slate-200 border border-dark-800'
            }`}
          >
            All
          </button>
          {availableExtensions.map((ext) => (
            <button
              key={ext}
              onClick={() => setSelectedExt(selectedExt === ext ? '' : ext)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                selectedExt === ext
                  ? 'bg-brand-500 text-dark-950 font-bold'
                  : 'bg-dark-950 text-slate-400 hover:text-slate-200 border border-dark-800'
              }`}
            >
              .{ext}
            </button>
          ))}
        </div>
      </div>

      {/* Main File Explorer Container */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Header Title */}
        <div className="px-5 py-4 border-b border-dark-800 flex items-center justify-between bg-dark-900/50">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <FolderTree className="w-4 h-4 text-amber-400" />
            <span>Repository Directory Tree</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Click files to preview & view purpose
          </span>
        </div>

        {/* Tree Root */}
        <div className="p-3 sm:p-4 divide-y divide-dark-800/40 max-h-[700px] overflow-y-auto">
          {fileTree.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm font-mono">
              No files found matching the selected filters.
            </div>
          ) : (
            fileTree.map((node) => (
              <FileNode
                key={node.path}
                node={node}
                level={0}
                onSelectFile={setSelectedFile}
                searchFilter={search}
                extFilter={selectedExt}
              />
            ))
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          owner={owner}
          repo={repo}
          defaultBranch={defaultBranch}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}

export default FilesPage;
