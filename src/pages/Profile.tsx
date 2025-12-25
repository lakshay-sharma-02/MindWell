
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/seo/SEOHead";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings, Save, Loader2, Heart, BookOpen, Package, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Tables } from "@/types/database";
import { Badge } from "@/components/ui/badge";

type Profile = Tables<"profiles">;
type LikedBlog = Tables<"blog_likes"> & { blogs: Tables<"blogs"> };
type PurchasedResource = Tables<"purchased_resources"> & { resources: Tables<"resources"> };

export default function Profile() {
    const { user, signOut, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [fullName, setFullName] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const [likedBlogs, setLikedBlogs] = useState<LikedBlog[]>([]);
    const [purchasedResources, setPurchasedResources] = useState<PurchasedResource[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/auth");
        } else if (user) {
            fetchProfileData();
        }
    }, [user, authLoading, navigate]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);

            // Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user!.id)
                .single();

            if (profileError && profileError.code !== "PGRST116") throw profileError;

            if (profileData) {
                setProfile(profileData);
                setFullName(profileData.full_name || "");
            }

            // Fetch Liked Blogs
            const { data: likesData, error: likesError } = await supabase
                .from("blog_likes")
                .select(`
          *,
          blogs (*)
        `)
                .eq("user_id", user!.id);

            if (likesError) console.error("Error fetching likes:", likesError);
            else setLikedBlogs(likesData as unknown as LikedBlog[]);

            // Fetch Purchased Resources
            const { data: resourcesData, error: resourcesError } = await supabase
                .from("purchased_resources")
                .select(`
          *,
          resources (*)
        `)
                .eq("user_id", user!.id);

            if (resourcesError) console.error("Error fetching resources:", resourcesError);
            else setPurchasedResources(resourcesData as unknown as PurchasedResource[]);

        } catch (error) {
            console.error("Error loading dashboard:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updates = {
                id: user!.id,
                full_name: fullName,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from("profiles").upsert(updates);

            if (error) throw error;
            toast.success("Profile updated successfully");
            // Update local state without refetching everything
            setProfile(prev => prev ? { ...prev, ...updates } : null);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
        toast.success("Signed out successfully");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Layout>
            <SEOHead title="Dashboard | Unheard Pages" description="Manage your profile and settings." />

            <div className="container-wide py-6 lg:py-24 min-h-[80vh]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* Sidebar / Profile Card */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-card border border-border/50 rounded-3xl p-5 lg:p-6 text-center shadow-sm sticker-card">
                            <Avatar className="w-20 h-20 lg:w-28 lg:h-28 mx-auto mb-4 border-4 border-background shadow-lg">
                                <AvatarImage src={profile?.avatar_url || ""} />
                                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                    {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="font-display font-bold text-xl truncate px-2">
                                {profile?.full_name || "User"}
                            </h2>
                            <p className="text-sm text-muted-foreground truncate px-2 text-balance">{user?.email}</p>

                            <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-2 gap-2 text-center">
                                <div>
                                    <span className="block text-2xl font-bold font-display text-primary">{likedBlogs.length}</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Loved</span>
                                </div>
                                <div>
                                    <span className="block text-2xl font-bold font-display text-primary">{purchasedResources.length}</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Owned</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border/50 rounded-2xl p-2 shadow-sm">
                            <Button
                                variant="ghost"
                                onClick={handleSignOut}
                                className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </Button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        <div className="mb-6 lg:mb-8">
                            <h1 className="text-2xl lg:text-3xl font-display font-bold mb-1 lg:mb-2">My Dashboard</h1>
                            <p className="text-sm lg:text-base text-muted-foreground">Welcome back, {profile?.full_name?.split(' ')[0] || "Friend"}.</p>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="bg-secondary/30 p-1 rounded-xl w-full justify-start overflow-x-auto">
                                <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background">Overview</TabsTrigger>
                                <TabsTrigger value="loved" className="rounded-lg data-[state=active]:bg-background">Loved Stories</TabsTrigger>
                                <TabsTrigger value="collection" className="rounded-lg data-[state=active]:bg-background">My Collection</TabsTrigger>
                                <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-background">Settings</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                                        <CardHeader className="pb-2">
                                            <CardDescription>Account Status</CardDescription>
                                            <CardTitle className="text-2xl text-primary">Active</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">Member since {formatDate(user?.created_at || "")}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardDescription>Recent Activity</CardDescription>
                                            <CardTitle className="text-lg">Reading History</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">Start discovering stories to track your journey.</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Loved Blogs Tab */}
                            <TabsContent value="loved">
                                {likedBlogs.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {likedBlogs.map((item) => (
                                            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                                <CardHeader className="p-0">
                                                    {item.blogs.image ? (
                                                        <div className="aspect-video w-full overflow-hidden">
                                                            <img src={item.blogs.image} alt={item.blogs.title} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="aspect-video w-full bg-secondary flex items-center justify-center">
                                                            <BookOpen className="w-8 h-8 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="p-4">
                                                    <Badge variant="outline" className="mb-2">{item.blogs.category}</Badge>
                                                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.blogs.title}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{item.blogs.excerpt}</p>
                                                </CardContent>
                                                <CardFooter className="p-4 pt-0">
                                                    <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                                                        <Link to={`/blog/${item.blogs.slug}`}>
                                                            Read Article <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-3xl">
                                        <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No loved stories yet</h3>
                                        <p className="text-muted-foreground mb-6">Explore our articles and save the ones that resonate with you.</p>
                                        <Button asChild variant="default" className="btn-glow">
                                            <Link to="/blog">Explore Blog</Link>
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Resources Collection Tab */}
                            <TabsContent value="collection">
                                {purchasedResources.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {purchasedResources.map((item) => (
                                            <Card key={item.id} className="overflow-hidden">
                                                <div className="flex flex-row p-4 gap-4">
                                                    <div className="w-24 h-24 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                                                        {item.resources.image ? (
                                                            <img src={item.resources.image} alt={item.resources.title} className="w-full h-full object-cover rounded-lg" />
                                                        ) : (
                                                            <Package className="w-8 h-8 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg mb-1">{item.resources.title}</h3>
                                                        <p className="text-sm text-muted-foreground mb-3">{item.resources.type}</p>
                                                        <Button size="sm" className="gap-2" asChild>
                                                            <a href={item.resources.download_url || "#"} target="_blank" rel="noopener noreferrer">
                                                                Download <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-3xl">
                                        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Your collection is empty</h3>
                                        <p className="text-muted-foreground mb-6">Purchased digital resources will appear here for easy access.</p>
                                        <Button asChild variant="default" className="btn-glow">
                                            <Link to="/resources">Browse Resources</Link>
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Settings Tab */}
                            <TabsContent value="settings">
                                <Card className="border-border/60 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Profile Settings</CardTitle>
                                        <CardDescription>Update your personal information.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input id="email" value={user?.email || ""} disabled className="bg-muted text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="fullName">Full Name</Label>
                                                <Input
                                                    id="fullName"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="Enter your full name"
                                                />
                                            </div>

                                            <Button type="submit" disabled={isSaving} className="btn-glow">
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                                Save Changes
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
