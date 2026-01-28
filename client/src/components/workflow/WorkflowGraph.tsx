import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import type { Node, Edge, NodeTypes } from "reactflow";
import "reactflow/dist/style.css";
import { WorkflowNode } from "./WorkflowNode";

interface WorkflowGraphProps {
    nodes: Node[];
    edges: Edge[];
    onNodeClick: (event: React.MouseEvent, node: Node) => void;
}

const nodeTypes: NodeTypes = {
    workflowNode: WorkflowNode,
};

export function WorkflowGraph({ nodes, edges, onNodeClick }: WorkflowGraphProps) {
    return (
        <div className="h-[600px] w-full border rounded-md bg-slate-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background gap={16} size={1} />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}
