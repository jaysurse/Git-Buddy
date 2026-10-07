import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, GitBranch, Terminal } from 'lucide-react';

const ANALYSIS_STEPS = [
  { id: 'fetch', label: 'Fetching repository metadata from GitHub API' },
  { id: 'tree', label: 'Reading recursive Git tree and directory structure' },
  { id: 'tech', label: 'Detecting languages, frameworks, and manifest files' },
  { id: 'files', label: 'Identifying landmark files (README, configs, manifests)' },
  { id: 'arch', label: 'Analyzing architecture layers and component evidence' },
  { id: 'ready', label: 'Preparing visual map and repository insights' },
];

export function LoadingSteps({ targetRepo = '' }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Progressively advance through stages while the network request is completing
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 md:p-8 bg-dark-900/90 border border-dark-800 rounded-2xl shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-800">
        <div className="p-2.5 bg-brand-500/10 border border-brand-500/30 rounded-xl text-brand-400">
          <GitBranch className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Analyzing Repository
            <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
          </h3>
          {targetRepo && <p className="text-xs font-mono text-brand-400/90 mt-0.5">{targetRepo}</p>}
        </div>
      </div>

      <div className="space-y-4">
        {ANALYSIS_STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center gap-3 text-sm transition-colors ${
                isDone
                  ? 'text-brand-400'
                  : isCurrent
                  ? 'text-slate-100 font-medium'
                  : 'text-slate-500'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-brand-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-dark-700 shrink-0" />
              )}
              <span className="flex-1 truncate">{step.label}</span>
              {isDone && <span className="text-xs font-mono text-brand-500/70">Done</span>}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-dark-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          Real GitHub REST API v3
        </span>
        <span className="font-mono">
          Step {Math.min(currentStep + 1, ANALYSIS_STEPS.length)} / {ANALYSIS_STEPS.length}
        </span>
      </div>
    </div>
  );
}

export default LoadingSteps;
