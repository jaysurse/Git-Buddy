import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from '../components/architecture/CustomNodes.jsx';
import { Network, List, LayoutGrid, Info, ShieldCheck } from 'lucide-react';
import Badge from '../components/common/Badge.jsx';

export function ArchitecturePage() {
  const { repositoryData } = useOutletContext();
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' | 'list'

  const architecture = repositoryData?.architecture || { layers: [], graph: { nodes: [], edges: [] } };
  const initialNodes = architecture.graph?.nodes || [];
  const initialEdges = (architecture.graph?.edges || []).map((e) => ({
    ...e,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' },
    style: { stroke: '#475569', strokeWidth: 1.5 },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const layers = architecture.layers || [];

  return (
    <div className="space-y-6">
      {/* Controls & Legend Header */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Network className="w-5 h-5 text-brand-400" />
            Visual Architecture & Layer Map
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Grounded representation of application tiers derived from repository files.
          </p>
        </div>

        {/* View Switcher: Canvas vs Structured List */}
        <div className="flex items-center gap-2 bg-dark-950 p-1 rounded-xl border border-dark-800 shrink-0">
          <button
            onClick={() => setViewMode('canvas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'canvas'
                ? 'bg-brand-500 text-dark-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-brand-500 text-dark-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Structured List</span>
          </button>
        </div>
      </div>

      {/* Legend Note */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-dark-900/60 border border-dark-800/80 rounded-xl text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <strong className="text-slate-300">Detected:</strong> Verified by direct configuration/files
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <strong className="text-slate-300">Likely:</strong> Inferred from common structural conventions
        </span>
        <span className="text-[11px] text-slate-500 hidden md:inline ml-auto font-mono">
          Scroll to zoom • Drag to pan • Click nodes to focus
        </span>
      </div>

      {/* View Mode: React Flow Canvas */}
      {viewMode === 'canvas' ? (
        <div className="bg-dark-950 border border-dark-800 rounded-2xl h-[550px] sm:h-[650px] relative overflow-hidden shadow-2xl">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={1.5}
            attributionPosition="bottom-right"
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls className="!bg-dark-900 !border-dark-700" showInteractive={false} />
            <MiniMap
              nodeColor={() => '#22c55e'}
              maskColor="rgba(10, 13, 20, 0.8)"
              className="!bg-dark-950 !border-dark-800 rounded-xl hidden sm:block"
            />
          </ReactFlow>
        </div>
      ) : (
        /* View Mode: Structured List Alternative (Optimized for Mobile & Touch) */
        <div className="space-y-4">
          {layers.map((layer) => (
            <div
              key={layer.name}
              className="bg-dark-900 border border-dark-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100">{layer.name}</h3>
                  <Badge variant={layer.confidence === 'high' ? 'brand' : 'amber'} size="sm">
                    {layer.status} ({layer.confidence})
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{layer.description}</p>

              <div>
                <p className="text-[11px] font-mono text-slate-500 uppercase mb-1.5">
                  Supporting Repository Evidence:
                </p>
                <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                  {layer.evidence?.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 rounded bg-dark-950 border border-dark-800 text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ArchitecturePage;
