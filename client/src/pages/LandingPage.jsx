import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Sparkles,
  Layers,
  FolderTree,
  Network,
  BotMessageSquare,
  ArrowRight,
  ShieldCheck,
  Check,
  Terminal,
  Zap,
} from 'lucide-react';
import { SAMPLE_REPOSITORIES } from '../data/sampleRepos.js';
import { extractOwnerRepo } from '../utils/formatters.js';

export function LandingPage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = (e) => {
    e?.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a GitHub repository URL or "owner/repo" string.');
      return;
    }

    const parsed = extractOwnerRepo(url.trim());
    if (!parsed) {
      setError('Please provide a valid GitHub repository link (e.g., https://github.com/facebook/react).');
      return;
    }

    navigate(`/repository/${parsed.owner}/${parsed.repo}`);
  };

  const handleSampleClick = (sampleUrl) => {
    setUrl(sampleUrl);
    const parsed = extractOwnerRepo(sampleUrl);
    if (parsed) {
      navigate(`/repository/${parsed.owner}/${parsed.repo}`);
    }
  };

  const featureCards = [
    {
      title: 'Repository Analyzer',
      description: 'Real-time extraction of live metadata, commit cadence, stars, licenses, and directory depth.',
      icon: Compass,
      color: 'emerald',
    },
    {
      title: 'Tech Stack Detection',
      description: 'Deterministic manifest analysis identifying languages, frameworks, ORMs, and build tools.',
      icon: Layers,
      color: 'blue',
    },
    {
      title: 'Visual File Structure',
      description: 'Interactive tree explorer with landmark highlighting, extension filters, and safe previews.',
      icon: FolderTree,
      color: 'amber',
    },
    {
      title: 'Architecture View',
      description: 'Interactive React Flow node map separating Frontend, Backend, Storage, and DevOps layers.',
      icon: Network,
      color: 'purple',
    },
    {
      title: 'AI Repository Q&A',
      description: 'Ask questions grounded strictly in verified repo facts. No hallucinated files or assumptions.',
      icon: BotMessageSquare,
      color: 'rose',
    },
    {
      title: 'Git Command Assistant',
      description: 'Natural language goal matcher and terminal error diagnostician for beginners.',
      icon: Terminal,
      color: 'cyan',
    },
  ];

  const colorIconStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-radial-gradient from-brand-500/10 via-transparent to-transparent pointer-events-none blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtitle Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dark-900 border border-brand-500/30 text-brand-400 text-xs font-mono font-medium shadow-md mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Real GitHub REST API v3 Integration</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.15]"
        >
          Understand any GitHub repository{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-200">
            visually.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
        >
          Paste a repository URL and get a clear overview of its structure, technologies, important files, and architecture without reading thousands of lines of code.
        </motion.p>

        {/* Main Search Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 sm:mt-10 max-w-2xl mx-auto"
        >
          <form
            onSubmit={handleAnalyze}
            className="p-2 sm:p-2.5 bg-dark-900/90 border border-dark-700/80 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center gap-2 transition-all focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20"
          >
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder="https://github.com/facebook/react or owner/repo"
                className="w-full px-4 py-3 bg-transparent text-slate-100 text-sm sm:text-base placeholder:text-slate-500 focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <span>Analyze Repository</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {error && <p className="text-xs text-rose-400 mt-2.5 text-left pl-2">{error}</p>}

          {/* Quick Demo Sample Repository Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-500 mr-1 flex items-center gap-1 font-mono">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              Try sample:
            </span>
            {SAMPLE_REPOSITORIES.map((repo) => (
              <button
                key={repo.name}
                type="button"
                onClick={() => handleSampleClick(repo.url)}
                className="px-2.5 py-1 rounded-lg bg-dark-900 hover:bg-dark-800 text-slate-300 hover:text-white text-xs font-mono border border-dark-800 hover:border-dark-700 transition-all flex items-center gap-1.5"
              >
                <span>{repo.name}</span>
                <span className="text-[10px] text-brand-400/80">({repo.badge})</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* The Core Flow Visual USP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-14 p-5 bg-dark-900/60 border border-dark-800 rounded-2xl max-w-3xl mx-auto"
        >
          <p className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-4">
            How GitHub Buddy Works
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            {['Paste Repo', 'Analyze', 'Understand', 'Visualize', 'Explore', 'Ask Questions'].map(
              (step, index) => (
                <div key={step} className="p-2 rounded-lg bg-dark-950 border border-dark-800 flex flex-col items-center">
                  <span className="text-brand-400 font-mono text-[10px] mb-1">0{index + 1}</span>
                  <span className="font-semibold text-slate-200">{step}</span>
                </div>
              )
            )}
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="mt-20 text-left">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Everything you need to master new codebases
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Designed specifically for students, bootcamps, and developers diving into open source.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureCards.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="bg-dark-900/70 border border-dark-800 rounded-2xl p-6 transition-all hover:border-dark-700 hover:bg-dark-900/90 group"
                >
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                      colorIconStyles[feature.color]
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-brand-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Trust & Safety Badges */}
        <div className="mt-16 pt-8 border-t border-dark-900 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            No Code Execution on Server
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-brand-400" />
            Secrets & .env Completely Blocked
          </span>
          <span className="flex items-center gap-1.5">
            <BotMessageSquare className="w-4 h-4 text-blue-400" />
            Fact-Grounded Q&A (Zero Hallucination)
          </span>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
