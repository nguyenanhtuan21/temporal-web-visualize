export interface WorkflowExecutionInfo {
    execution: {
        workflowId: string;
        runId: string;
    };
    type: {
        name: string;
    };
    startTime: string;
    closeTime?: string;
    status: string; // "RUNNING" | "COMPLETED" | "FAILED" ...
    historyLength: string;
    parentExecution?: {
        workflowId: string;
        runId: string;
    };
    executionTime: string;
}

export interface ListWorkflowExecutionsResponse {
    executions: WorkflowExecutionInfo[];
    nextPageToken?: string;
}

export interface HistoryEvent {
    eventId: string;
    eventTime: string;
    eventType: string;
    version: string;
    taskId: string;
    [key: string]: any; // Allow dynamic fields for attributes
}

export interface WorkflowFullData {
    // This depends on what GET /workflow/data returns
    // Assuming it returns similar info to WorkflowExecutionInfo + detailed status
    executionInfo: WorkflowExecutionInfo;
    // ...
    [key: string]: any;
}
