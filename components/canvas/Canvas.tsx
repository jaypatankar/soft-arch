"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useStudio } from "@/lib/store";
import { metaFor } from "@/lib/nodeCatalog";
import type { NodeKind } from "@/lib/types";
import { ArchNodeView } from "./ArchNodeView";

const nodeTypes: NodeTypes = { arch: ArchNodeView };

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
  style: { strokeWidth: 1.5 },
  labelBgPadding: [6, 3] as [number, number],
  labelBgBorderRadius: 4,
};

export function Canvas() {
  const nodes = useStudio((s) => s.nodes);
  const edges = useStudio((s) => s.edges);
  const onNodesChange = useStudio((s) => s.onNodesChange);
  const onEdgesChange = useStudio((s) => s.onEdgesChange);
  const onConnect = useStudio((s) => s.onConnect);
  const addNode = useStudio((s) => s.addNode);
  const selectNode = useStudio((s) => s.selectNode);
  const selectEdge = useStudio((s) => s.selectEdge);
  const fitSignal = useStudio((s) => s.fitSignal);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const wrapper = useRef<HTMLDivElement>(null);

  // Re-fit the viewport whenever the layout changes (AI draw or Tidy).
  useEffect(() => {
    if (fitSignal === 0) return;
    const t = setTimeout(() => fitView({ padding: 0.3, maxZoom: 1, duration: 300 }), 60);
    return () => clearTimeout(t);
  }, [fitSignal, fitView]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const kind = event.dataTransfer.getData("application/archnode") as NodeKind;
      if (!kind) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode(kind, position);
    },
    [addNode, screenToFlowPosition],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div ref={wrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => selectNode(node.id)}
        onEdgeClick={(_, edge) => selectEdge(edge.id)}
        onPaneClick={() => selectNode(null)}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => metaFor((n.data as { kind: NodeKind }).kind).accent}
          className="!bg-zinc-100 dark:!bg-zinc-800"
        />
      </ReactFlow>
    </div>
  );
}
