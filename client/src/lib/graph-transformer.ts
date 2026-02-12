import type { Node, Edge } from "reactflow";
import type { HistoryEvent } from "../types/schema";
import type { LogicalNodeData } from "../components/workflow/WorkflowNode";
import dagre from 'dagre';

function getDuration(start: string, end?: string): number {
    if (!end) return 0;
    return new Date(end).getTime() - new Date(start).getTime();
}

export function transformEventsToGraph(events: HistoryEvent[]): {
    nodes: Node<LogicalNodeData>[];
    edges: Edge[];
} {
    const nodes: Node<LogicalNodeData>[] = [];
    const edges: Edge[] = [];
    const logicalMap = new Map<string, LogicalNodeData>();

    // 1. Group Events into Logical Steps
    // Note: Event types from SDK might be "WorkflowExecutionStarted" or "EVENT_TYPE_WORKFLOW_EXECUTION_STARTED"
    // We use .includes to be safe, or normalize.

    // -- Workflow Execution --
    const workflowStart = events.find(e => e.eventType.includes("WORKFLOW_EXECUTION_STARTED"));
    const workflowEnd = events.find(e => e.eventType.includes("WORKFLOW_EXECUTION") && (e.eventType.includes("COMPLETED") || e.eventType.includes("FAILED") || e.eventType.includes("CANCELED") || e.eventType.includes("TIMED_OUT")));

    if (workflowStart) {
        logicalMap.set("workflow", {
            id: workflowStart.workflowExecutionStartedEventAttributes?.originalExecutionRunId || "root",
            label: workflowStart.workflowExecutionStartedEventAttributes?.workflowType?.name || "Workflow",
            type: "workflow",
            status: workflowEnd ? (workflowEnd.eventType.includes("COMPLETED") || workflowEnd.eventType.includes("Completed") ? "completed" : "failed") : "running",
            startTime: workflowStart.eventTime,
            duration: workflowEnd ? getDuration(workflowStart.eventTime, workflowEnd.eventTime) : undefined,
            queueName: workflowStart.workflowExecutionStartedEventAttributes?.taskQueue?.name,
            rawEvents: [workflowStart, workflowEnd].filter(Boolean) as HistoryEvent[]
        });
    }

    // -- Activities --
    // ActivityTaskScheduled -> ActivityTaskStarted -> ActivityTaskCompleted/Failed
    // Key: ActivityID (ScheduledEventId is usually the reference)
    const activityScheduledEvents = events.filter(e => e.eventType.includes("ACTIVITY_TASK_SCHEDULED"));

    activityScheduledEvents.forEach(scheduled => {
        // Find corresponding events
        const id = scheduled.activityTaskScheduledEventAttributes?.activityId || `${scheduled.eventId}`;
        const started = events.find(e => e.eventType.includes("ACTIVITY_TASK_STARTED") && e.activityTaskStartedEventAttributes?.scheduledEventId === scheduled.eventId);
        const completed = events.find(e => (e.eventType.includes("ACTIVITY_TASK_COMPLETED") || e.eventType.includes("ACTIVITY_TASK_FAILED") || e.eventType.includes("ACTIVITY_TASK_TIMED_OUT")) && (e.activityTaskCompletedEventAttributes?.scheduledEventId === scheduled.eventId || e.activityTaskFailedEventAttributes?.scheduledEventId === scheduled.eventId));

        let status: LogicalNodeData['status'] = "scheduled";
        if (completed) {
            status = (completed.eventType.includes("COMPLETED") || completed.eventType.includes("Completed")) ? "completed" : "failed";
        } else if (started) {
            status = "running";
        }

        logicalMap.set(`activity-${scheduled.eventId}`, {
            id: id,
            label: scheduled.activityTaskScheduledEventAttributes?.activityType?.name || "Activity",
            type: "activity",
            status: status,
            startTime: scheduled.eventTime,
            duration: completed ? getDuration(started?.eventTime || scheduled.eventTime, completed.eventTime) : undefined,
            queueName: scheduled.activityTaskScheduledEventAttributes?.taskQueue?.name,
            rawEvents: [scheduled, started, completed].filter(Boolean) as HistoryEvent[]
        });
    });

    // -- Timers --
    // TimerStarted -> TimerFired
    const timerStartedEvents = events.filter(e => e.eventType.includes("TIMER_STARTED"));
    timerStartedEvents.forEach(started => {
        const timerId = started.timerStartedEventAttributes?.timerId || `${started.eventId}`;
        const fired = events.find(e => e.eventType.includes("TIMER_FIRED") && e.timerFiredEventAttributes?.timerId === timerId);

        logicalMap.set(`timer-${started.eventId}`, {
            id: timerId,
            label: `Timer (${started.timerStartedEventAttributes?.startToFireTimeout})`,
            type: "timer",
            status: fired ? "completed" : "running",
            startTime: started.eventTime,
            duration: fired ? getDuration(started.eventTime, fired.eventTime) : undefined,
            rawEvents: [started, fired].filter(Boolean) as HistoryEvent[]
        });
    });

    // 2. Build Nodes List
    // Convert Map to Node Array and sort by startTime to help with sequential linking
    const logicalNodes = Array.from(logicalMap.entries()).map(([key, data]) => ({ key, data }));
    // Sort by start time
    logicalNodes.sort((a, b) => new Date(a.data.startTime).getTime() - new Date(b.data.startTime).getTime());

    logicalNodes.forEach(({ key, data }) => {
        nodes.push({
            id: key,
            type: "workflowNode",
            data: data,
            position: { x: 0, y: 0 }, // Layout will fix this
        });
    });

    // 3. Create Edges
    // Naive strategy: Workflow -> First Item -> Second Item ...
    // A better strategy would be to check the command sequence, but purely based on time/grouping:
    // Connect Root to the first event
    // Connect subsequent events to each other
    if (nodes.length > 0) {
        const root = nodes.find(n => n.data.type === "workflow");
        const others = nodes.filter(n => n.data.type !== "workflow");

        if (root && others.length > 0) {
            // Edge from Root to First
            edges.push({
                id: `e-${root.id}-${others[0].id}`,
                source: root.id,
                target: others[0].id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#94a3b8', strokeWidth: 2 },
            });

            // Chain others
            for (let i = 0; i < others.length - 1; i++) {
                edges.push({
                    id: `e-${others[i].id}-${others[i + 1].id}`,
                    source: others[i].id,
                    target: others[i + 1].id,
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#94a3b8', strokeWidth: 2 },
                });
            }
        }
    }

    // 4. Auto Layout using Dagre
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setGraph({ rankdir: 'LR', align: 'UL', ranksep: 80, nodesep: 20 });
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 300;
    const nodeHeight = 100;

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
}
