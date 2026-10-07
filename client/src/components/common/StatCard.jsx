import React from 'react';

export function StatCard({ icon: Icon, label, value, subtext, color = 'emerald' }) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-4 flex items-center gap-4 transition-all hover:border-dark-700">
      {Icon && (
        <div className={`p-3 rounded-lg border shrink-0 ${colorMap[color] || colorMap.emerald}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-100 truncate mt-0.5">{value}</p>
        {subtext && <p className="text-xs text-slate-400 truncate mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

export default StatCard;
