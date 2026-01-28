import { Outlet } from "react-router-dom";
import { Sidebar } from "lucide-react";

export function AppLayout() {
    return (
        <div className="flex h-screen w-full flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
                <div className="flex items-center gap-2 font-semibold">
                    <Sidebar className="h-6 w-6" />
                    <span className="">Temporal Flow</span>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Outlet />
            </main>
        </div>
    );
}
