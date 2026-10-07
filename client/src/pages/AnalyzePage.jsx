import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Key, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SAMPLE_REPOSITORIES } from '../data/sampleRepos.js';
import { extractOwnerRepo } from '../utils/formatters.js';

export function AnalyzePage() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState(() => sessionStorage.getItem('gh_user_token') || '');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = (e) => {
    e?.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a GitHub repository URL or "owner/repo"');
      return;
    }

    const parsed = extractOwnerRepo(url.trim());
    if (!parsed) {
      setError('Invalid format. Use https://github.com/owner/repo or owner/repo.');
      return;
    }

    if (token.trim()) {
      sessionStorage.setItem('gh_user_token', token.trim());
    } else {
      sessionStorage.removeItem('gh_user_token');
    }

    navigate(`/repository/${parsed.owner}/${parsed.repo}`);
  };

  const handleSelectSample = (sampleUrl) => {
    setUrl(sampleUrl);
    const parsed = extractOwnerRepo(sampleUrl);
    if (parsed) {
      navigate(`/repository/${parsed.owner}/${parsed.repo}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-brand-500/10 border border-brand-500/20 rounded-2xl text-brand-400 mb-4">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Analyze Any Public Repository
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
          Enter any public GitHub repository to extract its file hierarchy, technology stack, and architectural blueprint.
        </p>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2 font-semibold">
              Repository URL or Identifier
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. https://github.com/expressjs/express or pallets/flask"
              className="w-full px-4 py-3 bg-dark-950 border border-dark-700 rounded-xl text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500 font-mono transition-colors"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          {/* Optional GitHub Token Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{showTokenInput ? 'Hide' : 'Add optional GitHub Token (increases rate limit)'}</span>
            </button>

            {showTokenInput && (
              <div className="mt-2.5 p-3.5 bg-dark-950 border border-dark-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Personal Access Token (Classic)</span>
                  <span className="text-slate-500 text-[10px]">Stored in browser session only</span>
                </div>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-slate-100 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                />
                <p className="text-[11px] text-slate-500">
                  Tokens only require public read access. Useful if your IP is rate-limited on the shared GitHub API.
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Sample Selector */}
        <div className="mt-8 pt-6 border-t border-dark-800">
          <p className="text-xs font-mono uppercase text-slate-400 mb-3">Popular Repositories to Explore</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SAMPLE_REPOSITORIES.map((repo) => (
              <button
                key={repo.name}
                type="button"
                onClick={() => handleSelectSample(repo.url)}
                className="p-3 bg-dark-950 hover:bg-dark-800/80 border border-dark-800 hover:border-dark-700 rounded-xl text-left transition-all flex items-start justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200 group-hover:text-brand-400 transition-colors">
                      {repo.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-800 text-brand-300 font-mono">
                      {repo.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{repo.tagline}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 shrink-0 mt-1 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyzePage;
