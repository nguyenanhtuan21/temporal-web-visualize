
const events = [
    {
        "eventId": "1",
        "eventTime": "2026-01-28T09:47:58.112068769Z",
        "eventType": "EVENT_TYPE_WORKFLOW_EXECUTION_STARTED",
        "taskId": "2097154",
        "workflowExecutionStartedEventAttributes": {
            "workflowType": {
                "name": "OneClickBuy"
            },
            "taskQueue": {
                "name": "ecommerce-oneclick",
                "kind": "TASK_QUEUE_KIND_NORMAL"
            },
            "workflowId": "3d146791-11e1-42ab-93d4-6ab5986eb33a"
        }
    },
    {
        "eventId": "5",
        "eventTime": "2026-01-28T09:47:58.168818350Z",
        "eventType": "EVENT_TYPE_TIMER_STARTED",
        "taskId": "2097165",
        "timerStartedEventAttributes": {
            "timerId": "1",
            "startToFireTimeout": "5s",
            "workflowTaskCompletedEventId": "4"
        }
    },
    {
        "eventId": "6",
        "eventTime": "2026-01-28T09:48:03.171964737Z",
        "eventType": "EVENT_TYPE_TIMER_FIRED",
        "taskId": "2097169",
        "timerFiredEventAttributes": {
            "timerId": "1",
            "startedEventId": "5"
        }
    },
    {
        "eventId": "10",
        "eventTime": "2026-01-28T09:48:03.222544562Z",
        "eventType": "EVENT_TYPE_ACTIVITY_TASK_SCHEDULED",
        "taskId": "2097179",
        "activityTaskScheduledEventAttributes": {
            "activityId": "1",
            "activityType": {
                "name": "checkoutItem"
            }
        }
    },
    {
        "eventId": "11",
        "eventTime": "2026-01-28T09:48:03.235169449Z",
        "eventType": "EVENT_TYPE_ACTIVITY_TASK_STARTED",
        "taskId": "2097184",
        "activityTaskStartedEventAttributes": {
            "scheduledEventId": "10"
        }
    },
    {
        "eventId": "12",
        "eventTime": "2026-01-28T09:48:03.255473831Z",
        "eventType": "EVENT_TYPE_ACTIVITY_TASK_COMPLETED",
        "taskId": "2097185",
        "activityTaskCompletedEventAttributes": {
            "scheduledEventId": "10",
            "startedEventId": "11"
        }
    },
    {
        "eventId": "16",
        "eventTime": "2026-01-28T09:48:03.294214861Z",
        "eventType": "EVENT_TYPE_WORKFLOW_EXECUTION_COMPLETED",
        "taskId": "2097195",
        "workflowExecutionCompletedEventAttributes": {
            "workflowTaskCompletedEventId": "15"
        }
    }
];

// Mock Dagre
const dagre = {
    graphlib: {
        Graph: class {
            setGraph() { }
            setDefaultEdgeLabel() { }
            setNode() { }
            setEdge() { }
            node() { return { x: 0, y: 0 }; }
        }
    },
    layout: () => { }
};

function getDuration(start, end) {
    if (!end) return 0;
    return new Date(end).getTime() - new Date(start).getTime();
}

function transformEventsToGraph(events) {
    const nodes = [];
    const edges = [];
    const logicalMap = new Map();

    // 1. Group Events into Logical Steps

    // -- Workflow Execution --
    const workflowStart = events.find(e => e.eventType === "EVENT_TYPE_WORKFLOW_EXECUTION_STARTED");
    const workflowEnd = events.find(e => e.eventType.includes("WORKFLOW_EXECUTION") && (e.eventType.includes("COMPLETED") || e.eventType.includes("FAILED") || e.eventType.includes("CANCELED")));

    if (workflowStart) {
        console.log("Found Workflow Start");
        logicalMap.set("workflow", {
            id: workflowStart.workflowExecutionStartedEventAttributes?.workflowId || "root",
            label: workflowStart.workflowExecutionStartedEventAttributes?.workflowType?.name || "Workflow",
            type: "workflow",
        });
    } else {
        console.log("Workflow Start NOT found");
    }

    // -- Activities --
    const activityScheduledEvents = events.filter(e => e.eventType === "EVENT_TYPE_ACTIVITY_TASK_SCHEDULED");
    console.log(`Found ${activityScheduledEvents.length} activities`);

    activityScheduledEvents.forEach(scheduled => {
        const id = scheduled.activityTaskScheduledEventAttributes?.activityId || `${scheduled.eventId}`;
        console.log("Activity ID:", id);
        logicalMap.set(`activity-${scheduled.eventId}`, {
            id: id,
            label: scheduled.activityTaskScheduledEventAttributes?.activityType?.name || "Activity",
            type: "activity",
        });
    });

    // -- Timers --
    const timerStartedEvents = events.filter(e => e.eventType === "EVENT_TYPE_TIMER_STARTED");
    console.log(`Found ${timerStartedEvents.length} timers`);
    timerStartedEvents.forEach(started => {
        const timerId = started.timerStartedEventAttributes?.timerId || `${started.eventId}`;
        console.log("Timer ID:", timerId);
        logicalMap.set(`timer-${started.eventId}`, {
            id: timerId,
            type: "timer",
        });
    });

    console.log("Logical Map Size:", logicalMap.size);
    return Array.from(logicalMap.values());
}

const result = transformEventsToGraph(events);
console.log("Result Nodes:", result);
