import React from 'react';
import { AlertTriangle, RefreshCw, Key, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ErrorBanner({ error, onRetry, title = 'Repository Analysis Issue' }) {
  const isRateLimit =
    typeof error === 'string' &&
    (error.includes('rate limit') || error.includes('429') || error.includes('RATE_LIMIT'));

  return (
    <div className="bg-rose-950/30 border border-rose-800/50 rounded-2xl p-6 text-slate-200 max-w-2xl mx-auto shadow-xl">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-rose-200">{title}</h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {typeof error === 'string' ? error : error?.message || 'An error occurred while loading this repository.'}
          </p>

          {isRateLimit && (
            <div className="mt-4 p-3 bg-dark-900 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-start gap-2">
              <Key className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-semibold">GitHub Rate Limit Tip:</span> Unauthenticated GitHub API calls are limited to 60 requests/hour. You can add a <code className="bg-dark-800 px-1 py-0.5 rounded text-amber-200">GITHUB_TOKEN</code> to your server <code className="bg-dark-800 px-1 py-0.5 rounded">.env</code> file for 5,000 requests/hour.
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 text-sm font-medium border border-dark-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Analyze Another Repo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorBanner;
