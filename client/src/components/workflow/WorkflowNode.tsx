import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import { Badge } from "../ui/badge";
import { Activity, Play, Clock, AlertCircle } from "lucide-react";
import type { HistoryEvent } from "../../types/schema";

// Helper to format duration
const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s ${ms % 1000}ms`;
};

// Define data structure for Logical Node
export interface LogicalNodeData {
    label: string;
    type: "workflow" | "activity" | "timer" | "signal" | "other";
    status: "completed" | "failed" | "running" | "canceled" | "scheduled";
    duration?: number;
    startTime: string;
    queueName?: string;
    id: string; // Logical ID (e.g., ActivityID)
    rawEvents: HistoryEvent[]; // Keep all related events here
}

const getIcon = (type: string) => {
    switch (type) {
        case "workflow": return <Play className="w-5 h-5" />;
        case "activity": return <Activity className="w-5 h-5" />;
        case "timer": return <Clock className="w-5 h-5" />;
        case "signal": return <AlertCircle className="w-5 h-5" />;
        default: return <Activity className="w-5 h-5" />;
    }
};

export function WorkflowNode({ data }: NodeProps<LogicalNodeData>) {
    const { label, type, status, duration, queueName } = data;

    return (
        <div className="min-w-[280px] group">
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white" />

            <div className={`relative bg-white rounded-lg border shadow-sm transition-all hover:shadow-md ${status === 'running' ? 'ring-2 ring-blue-100' : ''}`}>

                {/* Top Badges Bar */}
                <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-semibold border-b bg-slate-50/50 rounded-t-lg">
                    <span className={`uppercase tracking-wider ${type === 'workflow' ? 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded' : type === 'timer' ? 'text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded' : 'text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded'}`}>
                        {type}
                    </span>
                    <span className={`uppercase tracking-wider flex items-center gap-1 ${status === 'completed' ? 'text-emerald-600' : status === 'failed' ? 'text-red-600' : 'text-blue-600'}`}>
                        {status}
                    </span>
                    {duration !== undefined && (
                        <span className="ml-auto text-slate-500 font-mono">
                            {formatDuration(duration)}
                        </span>
                    )}
                </div>

                {/* Main Content */}
                <div className="p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${status === 'failed' ? 'bg-red-100 text-red-600' : type === 'workflow' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                        {getIcon(type)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="font-semibold text-sm truncate text-slate-900" title={label}>
                            {label}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                            {data.id}
                        </div>
                    </div>
                </div>

                {/* Footer info (Queue) */}
                {queueName && (
                    <div className="absolute -bottom-3 right-2">
                        <Badge variant="secondary" className="text-[9px] px-2 h-5 bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200">
                            {queueName}
                        </Badge>
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white" />
        </div>
    );
}
