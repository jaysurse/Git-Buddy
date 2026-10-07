import React, { useState } from 'react';
import {
  AlertTriangle,
  Terminal,
  HelpCircle,
  Wrench,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import gitService from '../services/gitService.js';

export function GitErrorHelperPage() {
  const [errorInput, setErrorInput] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const sampleErrors = [
    'fatal: not a git repository (or any of the parent directories): .git',
    'error: failed to push some refs to https://github.com/user/repo.git',
    'error: Your local changes to the following files would be overwritten by checkout',
    'CONFLICT (content): Merge conflict in src/App.js',
    "You are in 'detached HEAD' state.",
    'fatal: Authentication failed for https://github.com/...',
  ];

  const handleDiagnose = async (textToDiagnose) => {
    const errorText = textToDiagnose || errorInput;
    if (!errorText.trim()) return;

    setLoading(true);
    try {
      const result = await gitService.explainError(errorText.trim());
      setDiagnosis(result);
    } catch {
      setDiagnosis({
        name: 'Error Diagnostics Failed',
        whatHappened: 'Could not diagnose this error string.',
        whyItHappened: 'Check your network connection to the backend.',
        howToFix: 'Run git status in your terminal.',
        exampleCommand: 'git status',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Git Error Diagnostician
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Stuck on a confusing Git terminal error? Paste it below to understand what went wrong and how to fix it step-by-step.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <label className="block text-xs font-mono uppercase text-slate-400 mb-2 font-semibold">
          Paste Terminal Error Message:
        </label>
        <textarea
          rows={4}
          value={errorInput}
          onChange={(e) => setErrorInput(e.target.value)}
          placeholder="e.g. fatal: not a git repository (or any of the parent directories): .git"
          className="w-full p-4 bg-dark-950 border border-dark-700 rounded-xl text-slate-200 text-xs sm:text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
        />

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="text-[11px] font-mono">Sample errors:</span>
            {sampleErrors.slice(0, 3).map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setErrorInput(sample);
                  handleDiagnose(sample);
                }}
                className="px-2 py-0.5 rounded bg-dark-950 hover:bg-dark-800 text-slate-400 hover:text-slate-200 text-[11px] font-mono border border-dark-800 transition-colors"
              >
                Sample {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleDiagnose()}
            disabled={loading || !errorInput.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
          >
            <span>Diagnose & Fix</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Diagnosis Results Card */}
      {diagnosis && (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
          <div className="flex items-center gap-3 pb-4 border-b border-dark-800">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-rose-400 font-semibold">Diagnosis</span>
              <h3 className="text-lg font-bold text-slate-100">{diagnosis.name}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What Happened */}
            <div className="p-4 bg-dark-950 rounded-xl border border-dark-800">
              <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                What Happened
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{diagnosis.whatHappened}</p>
            </div>

            {/* Why It Happened */}
            <div className="p-4 bg-dark-950 rounded-xl border border-dark-800">
              <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                Why It Happened
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{diagnosis.whyItHappened}</p>
            </div>
          </div>

          {/* How To Fix */}
          <div className="p-5 bg-dark-950 rounded-xl border border-dark-800 space-y-3">
            <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              How To Fix It
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{diagnosis.howToFix}</p>

            {/* Example Command Box */}
            {diagnosis.exampleCommand && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono text-slate-400">
                  <span>Suggested Command:</span>
                  <button
                    onClick={() => handleCopy(diagnosis.exampleCommand)}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-dark-900 border border-dark-700 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                  {diagnosis.exampleCommand}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GitErrorHelperPage;
