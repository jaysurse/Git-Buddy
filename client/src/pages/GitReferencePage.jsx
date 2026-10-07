import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Search,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  Layers,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import gitService from '../services/gitService.js';
import Badge from '../components/common/Badge.jsx';

export function GitReferencePage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [goalResult, setGoalResult] = useState(null);
  const [goalLoading, setGoalLoading] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    gitService.getCommands(search).then((data) => {
      setCategories(data);
    });
  }, [search]);

  const handleMatchGoal = async (e) => {
    e?.preventDefault();
    if (!goalInput.trim()) return;

    setGoalLoading(true);
    try {
      const result = await gitService.matchGoal(goalInput.trim());
      setGoalResult(result);
    } catch {
      setGoalResult({
        matched: false,
        command: 'git status',
        explanation: 'Check repository status.',
      });
    } finally {
      setGoalLoading(false);
    }
  };

  const handleCopy = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const filteredCategories =
    activeCategory === 'All'
      ? categories
      : categories.filter((c) => c.category === activeCategory);

  const goalSuggestions = [
    'create a new branch',
    'undo last commit without losing code',
    'save work temporarily without commit',
    'sync branch with github',
    'discard local changes in a file',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex p-3 bg-brand-500/10 border border-brand-500/20 rounded-2xl text-brand-400 mb-4">
          <Terminal className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Git Command Reference
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Master everyday Git operations with categorized commands and natural language intent matching.
        </p>
      </div>

      {/* "Describe what you're trying to do" Section */}
      <div className="bg-gradient-to-br from-dark-900 via-dark-900 to-dark-950 border border-brand-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-2 text-brand-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Natural Language Git Matcher
        </div>
        <h2 className="text-xl font-bold text-slate-100">Describe what you want to achieve</h2>
        <p className="text-xs text-slate-400 mt-1">
          Type your goal in plain English, and we will find the exact Git command.
        </p>

        <form onSubmit={handleMatchGoal} className="mt-5 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="e.g. I want to create a new branch, or undo my last commit..."
            className="flex-1 px-4 py-3 bg-dark-950 border border-dark-700 rounded-xl text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          <button
            type="submit"
            disabled={goalLoading || !goalInput.trim()}
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 shrink-0"
          >
            <span>Find Command</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Goal Suggestions */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 text-[11px] font-mono">Try asking:</span>
          {goalSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setGoalInput(suggestion);
                gitService.matchGoal(suggestion).then((r) => setGoalResult(r));
              }}
              className="px-2.5 py-1 rounded-lg bg-dark-950 hover:bg-dark-800 text-slate-300 hover:text-white border border-dark-800 text-xs transition-colors"
            >
              "{suggestion}"
            </button>
          ))}
        </div>

        {/* Goal Result Box */}
        {goalResult && (
          <div className="mt-6 p-4 sm:p-5 bg-dark-950 border border-brand-500/40 rounded-xl shadow-inner animate-in fade-in">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-mono uppercase text-brand-400 font-bold">
                Recommended Command
              </span>
              <button
                onClick={() => handleCopy(goalResult.command)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-dark-900 hover:bg-dark-800 text-slate-200 text-xs font-mono border border-dark-700 transition-colors"
              >
                {copiedCmd === goalResult.command ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <code className="block p-3 rounded-lg bg-dark-900 text-emerald-300 font-mono text-sm sm:text-base overflow-x-auto border border-dark-800">
              {goalResult.command}
            </code>
            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{goalResult.explanation}</p>
          </div>
        )}
      </div>

      {/* Categorized Command Library */}
      <div className="space-y-6">
        {/* Search & Category Filter Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Git commands or descriptions..."
              className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {['All', ...categories.map((c) => c.category)].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-brand-500 text-dark-950 font-bold'
                    : 'bg-dark-900 text-slate-400 hover:text-slate-200 border border-dark-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.category}
              className="bg-dark-900 border border-dark-800 rounded-2xl p-5 space-y-4 shadow-lg"
            >
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-brand-400" />
                  {cat.category}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
              </div>

              <div className="space-y-3">
                {cat.commands.map((item) => (
                  <div
                    key={item.cmd}
                    className="p-3 bg-dark-950 border border-dark-850 rounded-xl flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-mono font-bold text-slate-200">{item.cmd}</code>
                      <button
                        onClick={() => handleCopy(item.example || item.cmd)}
                        className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-dark-800 transition-colors"
                        title="Copy command"
                      >
                        {copiedCmd === (item.example || item.cmd) ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.description}</p>
                    {item.example && item.example !== item.cmd && (
                      <p className="text-[10px] font-mono text-brand-400/80 mt-0.5">
                        Ex: {item.example}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GitReferencePage;
