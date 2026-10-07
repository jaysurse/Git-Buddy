import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileCode, Shield, Loader2, Info, ExternalLink } from 'lucide-react';
import repositoryService from '../../services/repositoryService.js';
import Badge from '../common/Badge.jsx';
import { formatBytes } from '../../utils/formatters.js';

export function FilePreviewModal({ file, owner, repo, defaultBranch = 'main', onClose }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!file?.path) return;

    setLoading(true);
    setError(null);

    repositoryService
      .getFilePreview(owner, repo, file.path, defaultBranch)
      .then((data) => {
        if (isMounted) {
          setContent(data?.content || '// File is empty or could not be loaded.');
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to preview file content.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [file, owner, repo, defaultBranch]);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const info = file.importantInfo || file;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
      <div className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-dark-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-400 shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 font-mono truncate">
                  {file.fileName || file.name}
                </h3>
                {info.badge && <Badge variant="brand" size="sm">{info.badge}</Badge>}
              </div>
              <p className="text-xs text-slate-400 font-mono truncate mt-0.5">{file.path}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://github.com/${owner}/${repo}/blob/${defaultBranch}/${file.path}`}
              target="_blank"
              rel="noreferrer"
              title="View on GitHub"
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-dark-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={handleCopy}
              disabled={loading || !content}
              title="Copy Code"
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-dark-800 transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-dark-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* File Purpose & Landmark Explanation */}
        {info.explanation && (
          <div className="px-5 py-3.5 bg-dark-950/70 border-b border-dark-800 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">{info.purpose || 'Landmark File'}: </span>
              <span className="text-slate-400 leading-relaxed">{info.explanation}</span>
            </div>
          </div>
        )}

        {/* Code Content View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 font-mono text-xs text-slate-300 bg-dark-950 leading-relaxed">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
              <span>Fetching file content safely...</span>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-400">
              <p>{error}</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap word-break">{content}</pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-dark-800 bg-dark-900 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Secrets & credentials automatically filtered
          </span>
          <span>{formatBytes(file.size)}</span>
        </div>
      </div>
    </div>
  );
}

export default FilePreviewModal;
