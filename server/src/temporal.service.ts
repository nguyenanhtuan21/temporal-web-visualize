import { InternalServerError, NotFoundException } from "./excpetions";

export default class TemporalService {
  apiKey: string;
  endpoint: string;
  headers: Record<string, string>;
  constructor() {
    this.apiKey = process.env.TEMPORAL_API_KEY ?? "";
    // Default to localhost:8080 (Temporal UI/HTTP API) as seen in docker ps
    const temporalEndpoint = process.env.TEMPORAL_ENDPOINT ?? "localhost:8080";
    const temporalOverrideEndpoint =
      process.env.TEMPORAL_OVERRIDE_ENDPOINT ?? "";

    if (temporalOverrideEndpoint) {
      this.endpoint = temporalOverrideEndpoint;
    } else {
      if (!temporalEndpoint) {
        throw new Error(
          "Temporal Endpoint is required - set TEMPORAL_ENDPOINT envvar"
        );
      }
      // Check if it's localhost, host.docker.internal, or an IP address
      if (
        temporalEndpoint.includes("localhost") ||
        temporalEndpoint.includes("host.docker.internal") ||
        temporalEndpoint.includes("127.0.0.1") ||
        /^\d/.test(temporalEndpoint) // Basic check for IP address start
      ) {
        this.endpoint = `http://${temporalEndpoint}`;
      } else {
        this.endpoint = `https://${temporalEndpoint}.web.tmprl.cloud`;
      }
    }

    if (this.apiKey) {
      this.headers = {
        Authorization: `Bearer ${this.apiKey}`,
      };
    } else {
      this.headers = {};
    }
  }

  async searchWorkflows(query: string, namespace: string) {
    const url = `${this.endpoint
      }/api/v1/namespaces/${namespace}/workflows?query=${encodeURIComponent(
        query
      )}`;
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new InternalServerError(
        `Failed to search workflows. Status: ${response.status}`
      );
    }
    return await response.json();
  }

  async getWorkflowData(namespace: string, workflowId: string, runId: string) {
    const url = `${this.endpoint}/api/v1/namespaces/${namespace}/workflows/${workflowId}?execution.runId=${runId}`;
    const response = await fetch(url, { headers: this.headers });
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
      const response = await fetch(url, { headers: this.headers });

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
