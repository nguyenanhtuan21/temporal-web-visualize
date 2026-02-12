import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import type { WorkflowExecutionInfo } from "../../types/schema";
import { useNavigate } from "react-router-dom";

interface WorkflowTableProps {
    workflows: WorkflowExecutionInfo[];
    namespace: string;
}

export function WorkflowTable({ workflows, namespace }: WorkflowTableProps) {
    const navigate = useNavigate();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Workflow ID</TableHead>
                        <TableHead>Run ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {workflows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                                No workflows found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        workflows.map((wf) => (
                            <TableRow
                                key={wf.execution.runId}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() =>
                                    navigate(
                                        `/workflow/${namespace}/${wf.execution.workflowId}/${wf.execution.runId}`
                                    )
                                }
                            >
                                <TableCell className="font-medium">
                                    {wf.execution.workflowId}
                                </TableCell>
                                <TableCell>{wf.execution.runId}</TableCell>
                                <TableCell>{wf.type.name}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            wf.status === "COMPLETED"
                                                ? "default"
                                                : wf.status === "FAILED"
                                                    ? "destructive"
                                                    : "secondary"
                                        }
                                    >
                                        {wf.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {wf.startTime ? new Date(wf.startTime).toLocaleString() : "N/A"}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
