
import * as React from "react";
import {
    Calendar,
    CreditCard,
    Settings,
    User,
    LayoutDashboard,
    FileText,
    MessageSquare,
    ShieldCheck,
    Headphones,
    Briefcase,
    HelpCircle,
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
    setOpen: (open: boolean) => void;
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
                    <CommandItem onSelect={() => runCommand(() => { })}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => { })}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Blogs</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => { })}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => { })}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Users</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => { })}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Stories</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => { })}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Community</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => { })}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Resources</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
