import React, { useState } from 'react';
import { useOutletContext, Link, useParams } from 'react-router-dom';
import {
  FileCode,
  Folder,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
  Terminal,
  Network,
  BotMessageSquare,
  FileText,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import StatCard from '../components/common/StatCard.jsx';
import Badge from '../components/common/Badge.jsx';
import FilePreviewModal from '../components/files/FilePreviewModal.jsx';

export function DashboardPage() {
  const { repositoryData } = useOutletContext();
  const { owner, repo } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);

  if (!repositoryData) return null;

  const { repository, metrics, languages, techStack, architecture, importantFiles, readmeSnippet } =
    repositoryData;

  const layers = architecture?.layers || [];

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileCode}
          label="Total Files"
          value={metrics.totalFiles}
          subtext="Tracked source files"
          color="emerald"
        />
        <StatCard
          icon={Folder}
          label="Total Folders"
          value={metrics.totalFolders}
          subtext="Directory branches"
          color="blue"
        />
        <StatCard
          icon={Layers}
          label="Technologies"
          value={(techStack.frameworks?.length || 0) + (techStack.libraries?.length || 0)}
          subtext={`${techStack.languages?.length || 0} languages`}
          color="amber"
        />
        <StatCard
          icon={Network}
          label="Detected Layers"
          value={layers.length}
          subtext={`${layers.filter((l) => l.confidence === 'high').length} high confidence`}
          color="purple"
        />
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Tech Stack + Architecture Layers + Readme Excerpt */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tech Stack Summary Card */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Detected Tech Stack
              </h2>
              <span className="text-xs font-mono text-slate-500">Deterministic Manifest Analysis</span>
            </div>

            <div className="space-y-4">
              {/* Languages */}
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Languages
                </p>
                <div className="flex flex-wrap gap-2">
                  {languages?.length > 0 ? (
                    languages.map((lang) => (
                      <Badge key={lang.name} variant="blue" size="md">
                        {lang.name} <span className="opacity-70 text-[10px]">{lang.percentage}%</span>
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No language data returned.</span>
                  )}
                </div>
              </div>

              {/* Frameworks */}
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Frameworks & Runtimes
                </p>
                <div className="flex flex-wrap gap-2">
                  {techStack.frameworks?.length > 0 ? (
                    techStack.frameworks.map((fw) => (
                      <Badge key={fw} variant="brand" size="md">
                        {fw}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No frameworks explicitly detected.</span>
                  )}
                </div>
              </div>

              {/* Libraries & Tools */}
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Key Libraries & Tools
                </p>
                <div className="flex flex-wrap gap-2">
                  {[...(techStack.libraries || []), ...(techStack.tools || [])].map((item) => (
                    <Badge key={item} variant="default" size="sm">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Preview Card */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-400" />
                Architectural Blueprint
              </h2>
              <Link
                to={`/repository/${owner}/${repo}/architecture`}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium transition-colors"
              >
                View Full Map
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {layers.map((layer) => (
                <div
                  key={layer.name}
                  className="p-3.5 bg-dark-950 border border-dark-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200">{layer.name}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                          layer.confidence === 'high'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {layer.status} ({layer.confidence})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{layer.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-1 text-[11px] font-mono text-slate-400">
                    {layer.evidence?.slice(0, 3).map((item) => (
                      <span key={item} className="px-1.5 py-0.5 rounded bg-dark-900 border border-dark-800">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Readme Summary Excerpt */}
          {readmeSnippet && (
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  README Excerpt
                </h2>
                <span className="text-xs text-slate-500 font-mono">Documentation</span>
              </div>
              <div className="p-4 bg-dark-950 border border-dark-800 rounded-xl text-xs font-mono text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {readmeSnippet}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Landmark Files & Quick Ask Buddy */}
        <div className="space-y-6">
          {/* Important Files Landmark List */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-brand-400" />
                Landmark Files
              </h2>
              <span className="text-xs font-mono text-slate-500">{importantFiles?.length || 0}</span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {importantFiles?.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className="w-full text-left p-3 rounded-xl bg-dark-950 hover:bg-dark-800/80 border border-dark-800 hover:border-dark-700 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-200 group-hover:text-brand-400 transition-colors truncate">
                      {file.fileName}
                    </span>
                    <Badge variant="brand" size="sm">
                      {file.badge}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{file.purpose}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Ask Buddy Quick Action Widget */}
          <div className="bg-gradient-to-br from-brand-950/40 via-dark-900 to-dark-950 border border-brand-500/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-brand-500/10 border border-brand-500/30 rounded-xl text-brand-400">
                <BotMessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Ask Buddy</h3>
                <p className="text-xs text-slate-400">Ask anything about {repository.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Grounded strictly in verified repository code without hallucinations.
            </p>

            <Link
              to={`/repository/${owner}/${repo}/ask`}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-500/20"
            >
              <span>Chat with Buddy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          owner={owner}
          repo={repo}
          defaultBranch={repository.default_branch}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}

export default DashboardPage;
