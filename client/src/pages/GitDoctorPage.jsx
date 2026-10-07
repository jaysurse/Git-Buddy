import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Copy,
  Check,
  Wrench,
  FileText,
  ShieldCheck,
  Code2,
  Activity,
} from 'lucide-react';
import runGitDoctor from '../utils/gitDoctor.js';

const TONES = {
  emerald: { text: 'text-emerald-400', stroke: '#22c55e', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  amber: { text: 'text-amber-400', stroke: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  rose: { text: 'text-rose-400', stroke: '#f43f5e', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

const STATUS = {
  pass: { icon: CheckCircle2, label: 'Passed', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  warn: { icon: AlertTriangle, label: 'Warning', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  fail: { icon: XCircle, label: 'Issue', cls: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
};

const CATEGORY_ICONS = {
  Documentation: FileText,
  'Repository Hygiene': ShieldCheck,
  'Code Quality': Code2,
  Activity,
};

function ScoreRing({ score, tone }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={TONES[tone].stroke} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-slate-100">{score}</span>
        <span className="text-[11px] text-slate-500 font-mono">/ 100</span>
      </div>
    </div>
  );
}

function CommandBlock({ cmd }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };
  return (
    <div className="relative group mt-1.5">
      <pre className="bg-dark-950 border border-dark-800 rounded-lg p-3 pr-11 text-xs font-mono text-emerald-300 whitespace-pre-wrap break-all">{cmd}</pre>
      <button onClick={copy} className="absolute top-2 right-2 p-1.5 rounded-md bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-slate-200" aria-label="Copy command">
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function CheckRow({ item, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const s = STATUS[item.status];
  const Icon = s.icon;
  return (
    <div className="bg-dark-950 border border-dark-800 rounded-xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-dark-900/60 transition-colors">
        <Icon className={`w-5 h-5 shrink-0 ${s.cls.split(' ')[0]}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-100">{item.title}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${s.cls}`}>{s.label}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{item.message}</p>
        </div>
        <span className="text-xs font-mono text-slate-500 shrink-0">{item.earned}/{item.max}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-dark-800 space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">Why it matters</p>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.why}</p>
          </div>
          {item.status !== 'pass' && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                <Wrench className="w-3 h-3" /> How to fix
              </p>
              <ol className="mt-1.5 space-y-2.5">
                {item.fix.map((step, i) => (
                  <li key={i} className="text-xs text-slate-300">
                    <span className="text-slate-500 font-mono mr-1.5">{i + 1}.</span>
                    {step.label}
                    {step.cmd && <CommandBlock cmd={step.cmd} />}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GitDoctorPage() {
  const { repositoryData } = useOutletContext();
  const report = useMemo(() => (repositoryData ? runGitDoctor(repositoryData) : null), [repositoryData]);
  if (!report) return null;

  const tone = TONES[report.grade.tone];
  const categories = [...new Set(report.checks.map((c) => c.category))];

  return (
    <div className="space-y-6">
      {/* Health Score Summary */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreRing score={report.score} tone={report.grade.tone} />
          <div className="flex-1 w-full text-center sm:text-left">
            <h2 className="text-lg font-bold text-slate-100 flex items-center justify-center sm:justify-start gap-2">
              <Stethoscope className="w-5 h-5 text-brand-400" />
              Git Doctor – Repository Health
            </h2>
            <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full border ${tone.text} ${tone.bg} ${tone.border}`}>
              {report.grade.label}
            </span>
            <p className="text-sm text-slate-400 mt-3 max-w-2xl">
              Git Doctor ran {report.summary.total} health checks on documentation, repository hygiene, code quality and activity.
              {report.issues.length > 0 ? ' Fix the issues below to improve the score.' : ' Great job – no issues found!'}
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4 max-w-md mx-auto sm:mx-0">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-xl font-bold text-emerald-400">{report.summary.passed}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Passed</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-xl font-bold text-amber-400">{report.summary.warnings}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Warnings</p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                <p className="text-xl font-bold text-rose-400">{report.summary.failed}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Issues</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top issues */}
      {report.issues.length > 0 && (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Detected Issues & Risks
          </h3>
          <p className="text-xs text-slate-500 mb-4">Sorted by impact on the health score. Click an item to see how to fix it.</p>
          <div className="space-y-2.5">
            {report.issues.map((item, idx) => (
              <CheckRow key={item.id} item={item} defaultOpen={idx === 0} />
            ))}
          </div>
        </div>
      )}

      {/* All checks by category */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-brand-400" />
          All Health Checks
        </h3>
        <div className="space-y-6">
          {categories.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat] || CheckCircle2;
            const list = report.checks.filter((c) => c.category === cat);
            return (
              <div key={cat}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <CatIcon className="w-3.5 h-3.5" /> {cat}
                  <span className="font-mono text-slate-600 normal-case">
                    ({list.reduce((s, c) => s + c.earned, 0)}/{list.reduce((s, c) => s + c.max, 0)} pts)
                  </span>
                </p>
                <div className="space-y-2">
                  {list.map((item) => (
                    <CheckRow key={item.id} item={item} defaultOpen={false} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GitDoctorPage;
