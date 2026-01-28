import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface SearchBarProps {
    onSearch: (query: string, namespace: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [namespace, setNamespace] = useState("default");

    return (
        <div className="flex gap-2 mb-4">
            <Input
                placeholder="Search query (e.g. WorkflowId='xyz')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
            />
            <Input
                placeholder="Namespace"
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
                className="w-32"
            />
            <Button onClick={() => onSearch(query, namespace)}>Search</Button>
        </div>
    );
}
