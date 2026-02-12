# Temporal Flow

A modern web application to visualize and track Temporal workflows as Logical Graphs and detailed History Tables.

<div align="center">
  <img src="/client/public/vite.svg" alt="Logo" width="80" height="80" />
</div>

## 🌟 Key Features

-   **Modern Dashboard**: Smart search and view Workflow lists with visual statuses.
-   **Logical Graph**: 
    -   Instead of displaying hundreds of disjointed events, the app groups them into **Logical Nodes** (Workflow, Activity, Timer).
    -   Easily visualize data flow and execution order.
    -   Display important information: Duration, Status, Queue Name right on the Node.
-   **History Table**: Detailed table view for those who want to debug events in depth.
-   **Node Details**: Sidebar displaying Raw JSON of input/output/result when clicking on any node.
-   **Chrome Extension**: Integrated "Open in Flow" button right on the Temporal Cloud/Local interface.

## 🛠 System Requirements

-   **Node.js**: v18 or higher.
-   **Temporal Server**: Running (Localhost or Cloud).
-   **Temporal Web UI**: So the server can fetch API data (must be accessible via HTTP port, e.g., 8080 or 8233).

## 🚀 Installation & Running

The system consists of 2 components: **Server** (Backend Proxy) and **Client** (Frontend React). You need to run both in parallel.

### Component 1: Server (Backend)

This server acts as a Proxy to call Temporal API and handle CORS.

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure connection:
    Open `.env` file (or create new) and configure your Temporal Web UI address (Note: this is the HTTP Web port, not GRPC port 7233):
    ```env
    # Example if Temporal Web runs at localhost:8080
    TEMPORAL_ENDPOINT=localhost:8080
    ```
4.  Run Server:
    ```bash
    npm run dev
    ```
    ✅ Server will listen at `http://localhost:7531`.

### Component 2: Client (Frontend)

User interface built with React + Vite + React Flow.

1.  Open a new terminal, navigate to client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run application:
    ```bash
    npm run dev
    ```
    ✅ Access application at `http://localhost:5173`.

### Component 3: Run with Docker (Recommended)

You can run the entire application (both Client and Server) with just 1 Docker command.

1.  **Build Image:**
    ```bash
    docker build -t temporal-flow-app .
    ```

2.  **Run Container:**

    *   **Mac/Windows:**
        ```bash
        docker run -p 7531:7531 \
          -e TEMPORAL_ENDPOINT=host.docker.internal:8080 \
          -e API_BASE_URL=http://localhost:7531 \
          temporal-flow-app
        ```

    *   **Linux:** (Need `--add-host` flag)
        ```bash
        docker run -p 7531:7531 \
          --add-host=host.docker.internal:host-gateway \
          -e TEMPORAL_ENDPOINT=host.docker.internal:8080 \
          -e API_BASE_URL=http://localhost:7531 \
          temporal-flow-app
        ```

    ✅ Access application at `http://localhost:7531`.

    **Note:**
    - `TEMPORAL_ENDPOINT`: Temporal Web UI address (default `localhost:8080`).
    - `API_BASE_URL`: Backend Proxy address that Client will call (default `http://localhost:7531`). When running Docker, this value is injected into Client at startup (Runtime Configuration).

## 📖 Usage Guide

1.  **Access**: Go to `http://localhost:5173`.
2.  **Search**:
    -   Enter `WorkflowId` in the search box.
    -   Or leave empty and press **Search** to get a list of recent workflows.
3.  **View Details**:
    -   Click on a Workflow row to open detail page.
    -   Default view is **Graph View**.
    -   Use Toggle button at top right to switch to **History Table**.
4.  **Debug**:
    -   Click on a Node on the graph to view Input/Output/Result in the right Sidebar.

## 🧩 Install Chrome Extension (Optional)

Helps quickly open Workflow being viewed on Temporal Web UI in Temporal Flow.

1.  Open Chrome, go to `chrome://extensions`.
2.  Enable **Developer mode** (top right).
3.  Click **Load unpacked** and select `chrome-extension` directory in this source code.
4.  Now when visiting a workflow detail page on Temporal Web, you will see a **"Flow View"** button.

## 🏗 Technologies Used

-   **Frontend**: React, TypeScript, Vite.
-   **UI/UX**: TailwindCSS, Shadcn/UI, Lucide Icons.
-   **Visualization**: React Flow, Dagre (Auto Layout).
-   **State Management**: TanStack Query (React Query).
-   **Backend**: Express, Temporal Client SDK.
