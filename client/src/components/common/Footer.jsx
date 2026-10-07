import React from 'react';
import { GitBranch, Heart, ShieldCheck, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-dark-900 bg-dark-950/80 py-10 mt-auto text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-brand-500/10 border border-brand-500/20 rounded-lg text-brand-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-200 text-sm">GitHub Buddy</p>
            <p className="text-slate-400">Understand any GitHub repository visually.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
          <Link to="/analyze" className="hover:text-slate-200 transition-colors">
            Analyze
          </Link>
          <Link to="/git" className="hover:text-slate-200 transition-colors">
            Git Reference
          </Link>
          <Link to="/git/errors" className="hover:text-slate-200 transition-colors">
            Error Helper
          </Link>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Secrets Filtered
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Grounded AI
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <span>Built for students & developers</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
