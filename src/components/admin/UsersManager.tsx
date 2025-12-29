import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Mail, Calendar, User as UserIcon, MoreVertical, Ban, Trash2, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserData {
    id: string;
    email: string;
    full_name: string | null;
    created_at: string;
    banned_until: string | null;
}

export function UsersManager() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // console.log("Fetching users list...");
            // Use the secure RPC function to get users with emails
            const { data, error } = await supabase.rpc('get_admin_users_list');

            if (error) {
                console.error("RPC Error:", error);
                throw error;
            }

            // console.log("Users fetched successfully:", data);
            setUsers(data as UserData[]);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBanToggle = async (userId: string, currentBan: boolean) => {
        try {
            const { data: isNowBanned, error } = await supabase.rpc('admin_toggle_ban_user', { target_user_id: userId });
            if (error) throw error;

            toast.success(isNowBanned ? "User has been banned" : "User has been unbanned");
            // Refresh list
            fetchUsers();
        } catch (error) {
            console.error("Error toggling ban:", error);
            toast.error("Failed to update ban status");
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteId) return;
        try {
            const { error } = await supabase.rpc('admin_delete_user', { target_user_id: deleteId });
            if (error) throw error;

            toast.success("User deleted permanently");
            setDeleteId(null);
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold">User Management</h2>
                    <p className="text-muted-foreground">View and manage registered users.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src="" />
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{user.full_name || "Unknown"}</span>
                                                            <span className="text-xs text-muted-foreground md:hidden">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3 h-3 text-muted-foreground" />
                                                        {user.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {user.banned_until ? (
                                                        <Badge variant="destructive" className="bg-red-500/10 text-destructive border-destructive/20">
                                                            Banned
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                                                            Active
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                                                                Copy Email
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleBanToggle(user.id, !!user.banned_until)}>
                                                                <Ban className="mr-2 h-4 w-4" />
                                                                {user.banned_until ? "Unban Account" : "Ban Account"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(user.id)}>
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Account
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="text-xs text-muted-foreground text-center">
                Showing {filteredUsers.length} of {users.length} users
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
