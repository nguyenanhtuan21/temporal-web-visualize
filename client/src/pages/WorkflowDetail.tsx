import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getWorkflowEvents } from "../api/client";
import { transformEventsToGraph } from "../lib/graph-transformer";
import { WorkflowGraph } from "../components/workflow/WorkflowGraph";
import type { HistoryEvent } from "../types/schema";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import type { Node } from "reactflow";

export default function WorkflowDetail() {
    const { workflowId, runId, namespace } = useParams();
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [viewMode, setViewMode] = useState<"graph" | "history">("graph");

    const { data, isLoading, error } = useQuery<HistoryEvent[]>({
        queryKey: ["workflow-events", workflowId, runId, namespace],
        queryFn: () =>
            getWorkflowEvents(workflowId!, runId!, namespace || "default"),
        enabled: !!workflowId && !!runId,
    });

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    };

    if (isLoading) return <div>Loading events...</div>;
    if (error) return <div className="text-red-500">Error: {(error as Error).message}</div>;

    const { nodes, edges } = data ? transformEventsToGraph(data) : { nodes: [], edges: [] };

    return (
        <div className="flex flex-col gap-4 h-full relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Workflow Detail</h1>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <div>ID: {workflowId}</div>
                        <div>RunID: {runId}</div>
                    </div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode("graph")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'graph' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Graph View
                    </button>
                    <button
                        onClick={() => setViewMode("history")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'history' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        History Table
                    </button>
                </div>
            </div>

            {viewMode === "graph" ? (
                nodes.length > 0 ? (
                    <WorkflowGraph nodes={nodes} edges={edges} onNodeClick={onNodeClick} />
                ) : (
                    <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                        <h3 className="text-lg font-semibold text-red-700 mb-2">No nodes generated</h3>
                        <p className="text-sm text-red-600 mb-4">API returned data, but no nodes were created. Raw data:</p>
                        <pre className="text-xs overflow-auto h-96 bg-white p-2 border rounded">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )
            ) : (
                <div className="border rounded-md overflow-hidden bg-white">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-3 font-medium text-slate-500">ID</th>
                                <th className="p-3 font-medium text-slate-500">Time</th>
                                <th className="p-3 font-medium text-slate-500">Event Type</th>
                                <th className="p-3 font-medium text-slate-500">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data?.map(event => (
                                <tr key={event.eventId} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono">{event.eventId}</td>
                                    <td className="p-3">{new Date(event.eventTime).toLocaleString()}</td>
                                    <td className="p-3 font-medium">{event.eventType}</td>
                                    <td className="p-3 text-slate-500 max-w-md truncate">
                                        {JSON.stringify(event).slice(0, 100)}...
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Sheet open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
                <SheetContent className="w-[600px] sm:max-w-[600px]">
                    <SheetHeader>
                        <SheetTitle>Node Details: {selectedNode?.data.label}</SheetTitle>
                        <SheetDescription>
                            Logical ID: {selectedNode?.id}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold mb-2">Events Grouped</h4>
                            <div className="max-h-[600px] overflow-auto space-y-2">
                                {selectedNode?.data.rawEvents?.map((event: HistoryEvent) => (
                                    <div key={event.eventId} className="border p-2 rounded bg-slate-50 text-xs">
                                        <div className="font-semibold">{event.eventType} ({event.eventId})</div>
                                        <div className="text-slate-500 mb-1">{new Date(event.eventTime).toLocaleTimeString()}</div>
                                        <pre className="whitespace-pre-wrap bg-white p-1 border rounded opacity-75">
                                            {JSON.stringify(event, null, 2)}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
