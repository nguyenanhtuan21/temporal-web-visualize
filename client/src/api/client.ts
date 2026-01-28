import type { HistoryEvent, ListWorkflowExecutionsResponse, WorkflowFullData } from "../types/schema";

const API_BASE_URL = "http://localhost:7531";

export async function searchWorkflows(
    query: string,
    namespace: string
): Promise<ListWorkflowExecutionsResponse> {
    // Use fuzzy search for now or Temporal's search attribute
    // The server expects "query" param
    const response = await fetch(
        `${API_BASE_URL}/search?query=${encodeURIComponent(query)}&namespace=${namespace}`
    );
    if (!response.ok) {
        throw new Error("Failed to search workflows");
    }
    return response.json();
}

export async function getWorkflowEvents(
    workflowId: string,
    runId: string,
    namespace: string
): Promise<HistoryEvent[]> {
    const response = await fetch(
        `${API_BASE_URL}/workflow?id=${encodeURIComponent(
            workflowId
        )}&runId=${runId}&namespace=${namespace}`
    );
    if (!response.ok) {
        throw new Error("Failed to fetch workflow events");
    }
    return response.json();
}

export async function getWorkflowData(
    workflowId: string,
    runId: string,
    namespace: string
): Promise<WorkflowFullData> {
    const response = await fetch(
        `${API_BASE_URL}/workflow/data?id=${encodeURIComponent(
            workflowId
        )}&runId=${runId}&namespace=${namespace}`
    );
    if (!response.ok) {
        throw new Error("Failed to fetch workflow data");
    }
    return response.json();
}
