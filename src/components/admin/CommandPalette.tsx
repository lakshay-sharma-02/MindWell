
import * as React from "react";
import {
    Settings,
    User,
    LayoutDashboard,
    FileText,
    MessageSquare,
    ShieldCheck,
    Download
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";

interface CommandPaletteProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CommandPalette({ open, setOpen }: CommandPaletteProps) {
    const navigate = useNavigate();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [setOpen]);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, [setOpen]);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem onSelect={() => runCommand(() => navigate("/admin?tab=overview"))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/admin?tab=blogs"))}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Blogs</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/admin?tab=settings"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => navigate("/admin?tab=users"))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Users</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/admin?tab=stories"))}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Stories</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/admin?tab=community"))}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Community</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/admin?tab=resources"))}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Resources</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
