import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, User, Loader2 } from "lucide-react";

export function AdminProfile() {
    const { user, updatePassword } = useAuth();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsUpdating(true);
        try {
            const { error } = await updatePassword(password);
            if (error) throw error;
            toast.success("Password updated successfully");
            setPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error("Error updating password:", error);
            toast.error(error instanceof Error ? error.message : "Failed to update password");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-display font-bold">Admin Profile</h2>
                <p className="text-muted-foreground">Manage your account settings and security.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        <CardTitle>Account Information</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Label>Email Address</Label>
                        <Input value={user?.email || ""} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">
                            This email is used for signing in and receiving system notifications.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        <CardTitle>Change Password</CardTitle>
                    </div>
                    <CardDescription>
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
