import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart3,
  PieChart,
  Shield,
  Star,
  GitFork,
  AlertCircle,
  Eye,
  Calendar,
  HardDrive,
} from 'lucide-react';
import { formatNumber, formatBytes, formatDate } from '../utils/formatters.js';
import StatCard from '../components/common/StatCard.jsx';
import Badge from '../components/common/Badge.jsx';

export function InsightsPage() {
  const { repositoryData } = useOutletContext();
  if (!repositoryData) return null;

  const { repository, metrics, languages, techStack } = repositoryData;

  const colorPalette = [
    '#22c55e', // brand emerald
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#a855f7', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#64748b', // slate
  ];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Star}
          label="Stars"
          value={formatNumber(repository.stars)}
          subtext="GitHub Stargazers"
          color="amber"
        />
        <StatCard
          icon={GitFork}
          label="Forks"
          value={formatNumber(repository.forks)}
          subtext="Community Forks"
          color="blue"
        />
        <StatCard
          icon={AlertCircle}
          label="Open Issues"
          value={formatNumber(repository.open_issues)}
          subtext="Issues & PRs"
          color="rose"
        />
        <StatCard
          icon={HardDrive}
          label="Repo Size"
          value={formatBytes(repository.size_kb * 1024)}
          subtext="Total repository disk"
          color="emerald"
        />
      </div>

      {/* Language Breakdown Section */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-brand-400" />
            Language Distribution
          </h2>
          <span className="text-xs font-mono text-slate-500">GitHub Byte Ratio</span>
        </div>

        {/* Multi-color Progress Bar */}
        {languages?.length > 0 && (
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-dark-950 mb-6 border border-dark-800">
            {languages.map((lang, idx) => (
              <div
                key={lang.name}
                style={{
                  width: `${lang.percentage}%`,
                  backgroundColor: colorPalette[idx % colorPalette.length],
                }}
                title={`${lang.name}: ${lang.percentage}%`}
                className="h-full transition-all"
              />
            ))}
          </div>
        )}

        {/* Language Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {languages?.map((lang, idx) => (
            <div
              key={lang.name}
              className="p-3 bg-dark-950 border border-dark-800 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: colorPalette[idx % colorPalette.length] }}
                />
                <span className="text-sm font-semibold text-slate-200">{lang.name}</span>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-slate-100 font-bold">{lang.percentage}%</span>
                <p className="text-[10px] text-slate-500">{formatBytes(lang.bytes)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata & Community Specs */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-400" />
          Repository Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-dark-950 rounded-xl border border-dark-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-mono">
              Default Branch
            </span>
            <p className="text-slate-200 font-mono font-bold mt-1 text-sm">{repository.default_branch}</p>
          </div>

          <div className="p-3.5 bg-dark-950 rounded-xl border border-dark-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-mono">License</span>
            <p className="text-slate-200 font-mono font-bold mt-1 text-sm">
              {repository.license?.name || 'No explicit license'}
            </p>
          </div>

          <div className="p-3.5 bg-dark-950 rounded-xl border border-dark-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-mono">Created On</span>
            <p className="text-slate-200 font-mono font-bold mt-1 text-sm">
              {formatDate(repository.created_at)}
            </p>
          </div>

          <div className="p-3.5 bg-dark-950 rounded-xl border border-dark-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-mono">Last Pushed</span>
            <p className="text-slate-200 font-mono font-bold mt-1 text-sm">
              {formatDate(repository.pushed_at)}
            </p>
          </div>

          <div className="p-3.5 bg-dark-950 rounded-xl border border-dark-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-mono">
              Repository Type
            </span>
            <p className="text-slate-200 font-mono font-bold mt-1 text-sm">
              {repository.is_fork ? 'Forked Project' : 'Original Repository'}
            </p>
          </div>

          <div className="p-3.5 bg-dark-950 rounded-xl border border-dark-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-mono">
              Analysis Depth
            </span>
            <p className="text-slate-200 font-mono font-bold mt-1 text-sm">
              {metrics.totalFiles} files in {metrics.totalFolders} dirs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsightsPage;
