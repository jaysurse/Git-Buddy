import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Layers, ShieldCheck, Cpu, Database, Settings } from 'lucide-react';

export function RootNode({ data }) {
  return (
    <div className="px-5 py-4 rounded-2xl bg-gradient-to-br from-brand-950 via-dark-900 to-dark-950 border-2 border-brand-500/50 shadow-2xl min-w-[220px] text-center">
      <Handle type="source" position={Position.Bottom} className="!bg-brand-400 !w-3 !h-3" />
      <div className="flex items-center justify-center gap-2 mb-1">
        <div className="p-1.5 bg-brand-500/20 rounded-lg text-brand-400">
          <GitBranch className="w-4 h-4" />
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-400">
          {data.badge || 'Root'}
        </span>
      </div>
      <h4 className="text-sm font-bold text-slate-100">{data.label}</h4>
      <p className="text-[11px] text-slate-400 mt-1">{data.description}</p>
    </div>
  );
}

export function LayerNode({ data }) {
  const isHigh = data.status === 'Detected';

  return (
    <div className="px-4 py-3.5 rounded-xl bg-dark-900 border-2 border-dark-700 shadow-xl min-w-[210px]">
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2.5 !h-2.5" />
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-dark-800 text-slate-300">
          {data.badge || 'Layer'}
        </span>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            isHigh
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          {data.status || 'Detected'}
        </span>
      </div>
      <h4 className="text-sm font-bold text-slate-100">{data.label}</h4>
      <p className="text-[11px] text-slate-400 mt-1">{data.description}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2.5 !h-2.5" />
    </div>
  );
}

export function ComponentNode({ data }) {
  return (
    <div className="px-3.5 py-3 rounded-xl bg-dark-950 border border-dark-700 shadow-md min-w-[190px]">
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-2 !h-2" />
      <div className="flex items-center justify-between gap-1.5 mb-1">
        <span className="text-[10px] font-mono text-brand-400/90">{data.badge || 'Component'}</span>
        <span className="text-[10px] text-slate-500 font-mono">{data.status || 'Detected'}</span>
      </div>
      <h5 className="text-xs font-semibold text-slate-200">{data.label}</h5>
      {data.description && <p className="text-[10px] text-slate-400 mt-0.5">{data.description}</p>}
      {data.path && (
        <span className="inline-block mt-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-dark-900 border border-dark-800 text-slate-400 truncate max-w-full">
          {data.path}
        </span>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-2 !h-2" />
    </div>
  );
}

export const nodeTypes = {
  rootNode: RootNode,
  layerNode: LayerNode,
  componentNode: ComponentNode,
};

export default nodeTypes;
