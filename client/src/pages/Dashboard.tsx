import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchWorkflows } from "../api/client";
import { SearchBar } from "../components/workflow/SearchBar";
import { WorkflowTable } from "../components/workflow/WorkflowTable";
import type { ListWorkflowExecutionsResponse } from "../types/schema";

export default function Dashboard() {
    const [searchParams, setSearchParams] = useState({
        query: "",
        namespace: "default",
    });

    const { data, isLoading, error } = useQuery<ListWorkflowExecutionsResponse>({
        queryKey: ["workflows", searchParams],
        queryFn: () =>
            searchWorkflows(searchParams.query, searchParams.namespace),
    });

    const handleSearch = (query: string, namespace: string) => {
        setSearchParams({ query, namespace });
    };

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <SearchBar onSearch={handleSearch} />
            {isLoading && <div>Loading...</div>}
            {error && <div className="text-red-500">Error: {(error as Error).message}</div>}
            {data && (
                <WorkflowTable
                    workflows={data.executions || []}
                    namespace={searchParams.namespace}
                />
            )}
        </div>
    );
}
