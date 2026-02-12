import { InternalServerError, NotFoundException } from "./excpetions";

export default class TemporalService {
  endpoint: string;

  constructor() {
    let temporalEndpoint = process.env.TEMPORAL_ENDPOINT ?? "http://localhost:8080";

    // Ensure protocol is present, default to http
    if (
      !temporalEndpoint.startsWith("http://") &&
      !temporalEndpoint.startsWith("https://")
    ) {
      temporalEndpoint = `http://${temporalEndpoint}`;
    }

    this.endpoint = temporalEndpoint;
  }

  async searchWorkflows(query: string, namespace: string) {
    const url = `${this.endpoint
      }/api/v1/namespaces/${namespace}/workflows?query=${encodeURIComponent(
        query
      )}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new InternalServerError(
        `Failed to search workflows. Status: ${response.status}`
      );
    }
    return await response.json();
  }

  async getWorkflowData(namespace: string, workflowId: string, runId: string) {
    const url = `${this.endpoint}/api/v1/namespaces/${namespace}/workflows/${workflowId}?execution.runId=${runId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new InternalServerError(
        `Failed to get workflow data. Status: ${response.status}`
      );
    }
    return await response.json();
  }

  async getWorkflowEvents(
    namespace: string,
    workflowId: string,
    runId: string
  ) {
    const allEvents = [];
    let nextPageToken = "";

    do {
      const url = `${this.endpoint
        }/api/v1/namespaces/${namespace}/workflows/${workflowId}/history?execution.runId=${runId}&next_page_token=${encodeURIComponent(
          nextPageToken
        )}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new InternalServerError(
          `Failed to get workflow events. Status: ${response.status
          }, ${JSON.stringify(await response.json())}`
        );
      }

      const data = await response.json();
      if (data.history && data.history.events) {
        allEvents.push(...data.history.events);
      }
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    return allEvents;
  }
}
