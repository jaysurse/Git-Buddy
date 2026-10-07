import React from 'react';
import { useParams, Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Network,
  BarChart3,
  BotMessageSquare,
  ExternalLink,
  Star,
  GitFork,
  Clock,
  RefreshCw,
  Eye,
  AlertCircle,
  Shield,
  Loader2,
} from 'lucide-react';
import useRepository from '../hooks/useRepository.js';
import { formatNumber, formatDate } from '../utils/formatters.js';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import LoadingSteps from '../components/common/LoadingSteps.jsx';

export function RepoLayout() {
  const { owner, repo } = useParams();
  const location = useLocation();
  const { data, loading, error, refresh } = useRepository(owner, repo);

  const baseUrl = `/repository/${owner}/${repo}`;

  const tabs = [
    { name: 'Overview', path: baseUrl, exact: true, icon: LayoutDashboard },
    { name: 'Files', path: `${baseUrl}/files`, icon: FolderTree },
    { name: 'Architecture', path: `${baseUrl}/architecture`, icon: Network },
    { name: 'Insights', path: `${baseUrl}/insights`, icon: BarChart3 },
    { name: 'Ask Buddy', path: `${baseUrl}/ask`, icon: BotMessageSquare, badge: 'AI' },
  ];

  const isTabActive = (tab) => {
    if (tab.exact) {
      return location.pathname === tab.path;
    }
    return location.pathname.startsWith(tab.path);
  };

  if (loading && !data) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <LoadingSteps targetRepo={`${owner}/${repo}`} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorBanner error={error} onRetry={refresh} title={`Failed to analyze ${owner}/${repo}`} />
      </div>
    );
  }

  const repository = data?.repository || {};
  const metrics = data?.metrics || {};

  return (
    <div className="min-h-screen pb-20 md:pb-12">
      {/* Top Repository Header Banner */}
      <section className="border-b border-dark-800 bg-gradient-to-b from-dark-900/60 to-dark-950/40 backdrop-blur-md pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Owner & Repo Identity */}
            <div className="flex items-start gap-3.5">
              {repository.owner?.avatar_url && (
                <img
                  src={repository.owner.avatar_url}
                  alt={repository.owner.login}
                  className="w-12 h-12 rounded-xl border border-dark-700 bg-dark-800 shadow-md shrink-0 mt-0.5"
                />
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-400">
                    <a
                      href={repository.owner?.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-slate-200 transition-colors"
                    >
                      {repository.owner?.login}
                    </a>
                  </span>
                  <span className="text-slate-600">/</span>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight truncate">
                    {repository.name}
                  </h1>
                  {repository.is_private ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Private
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Public
                    </span>
                  )}
                  {repository.license && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-dark-800 text-slate-300 border border-dark-700 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-slate-400" />
                      {repository.license.name || repository.license.key}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-1.5 line-clamp-2 max-w-3xl">
                  {repository.description}
                </p>
              </div>
            </div>

            {/* Quick Metrics & Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-3 bg-dark-900 border border-dark-800 rounded-xl px-3 py-1.5 text-xs">
                <span className="flex items-center gap-1 text-slate-300 font-medium" title="GitHub Stars">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {formatNumber(repository.stars)}
                </span>
                <span className="w-px h-3 bg-dark-700" />
                <span className="flex items-center gap-1 text-slate-300 font-medium" title="Forks">
                  <GitFork className="w-3.5 h-3.5 text-slate-400" />
                  {formatNumber(repository.forks)}
                </span>
                <span className="w-px h-3 bg-dark-700" />
                <span className="flex items-center gap-1 text-slate-400" title="Updated Date">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {formatDate(repository.pushed_at || repository.updated_at)}
                </span>
              </div>

              <a
                href={repository.html_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-200 text-xs font-medium border border-dark-700 transition-colors"
              >
                GitHub
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={refresh}
                disabled={loading}
                title="Refresh Analysis"
                className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-dark-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Truncation warning banner if repo was massive */}
          {metrics.isTruncated && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{metrics.warningMessage}</span>
            </div>
          )}

          {/* Navigation Tabs (Desktop & Tablet) */}
          <div className="flex items-center gap-1 sm:gap-2 mt-6 overflow-x-auto no-scrollbar border-b border-dark-800/80 -mb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isTabActive(tab);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-2 px-3.5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    active
                      ? 'border-brand-500 text-brand-400 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-dark-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                  {tab.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Outlet context={{ repositoryData: data, refreshRepo: refresh, isLoading: loading }} />
      </main>

      {/* Mobile Sticky Bottom Navigation Bar (Touch friendly >= 48px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-950/95 backdrop-blur-xl border-t border-dark-800 px-2 py-1 shadow-2xl">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                  active ? 'text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RepoLayout;
