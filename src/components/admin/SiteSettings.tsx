import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Globe, Settings, Share2, Loader2 } from "lucide-react";
import { Json } from "@/types/database";

interface GlobalInfo {
    title: string;
    description: string;
    contact_email: string;
}

interface Features {
    registration_enabled: boolean;
    maintenance_mode: boolean;
    blog_comments: boolean;
}

interface SocialLinks {
    twitter: string;
    instagram: string;
    linkedin: string;
}

export function SiteSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [globalInfo, setGlobalInfo] = useState<GlobalInfo>({
        title: "",
        description: "",
        contact_email: "",
    });

    const [features, setFeatures] = useState<Features>({
        registration_enabled: true,
        maintenance_mode: false,
        blog_comments: true,
    });

    const [socialLinks, setSocialLinks] = useState<SocialLinks>({
        twitter: "",
        instagram: "",
        linkedin: "",
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('site_settings')
                .select('*');

            if (error) throw error;

            if (data) {
                data.forEach(setting => {
                    const value = setting.value as any;
                    switch (setting.key) {
                        case 'global_info':
                            setGlobalInfo(value);
                            break;
                        case 'features':
                            setFeatures(value);
                            break;
                        case 'social_links':
                            setSocialLinks(value);
                            break;
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const updates = [
                { key: 'global_info', value: globalInfo as unknown as Json, description: 'Global site information' },
                { key: 'features', value: features as unknown as Json, description: 'Feature toggles' },
                { key: 'social_links', value: socialLinks as unknown as Json, description: 'Social media links' },
            ];

            const { error } = await supabase
                .from('site_settings')
                .upsert(updates);

            if (error) throw error;

            toast.success("Settings saved successfully");
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold">Site Settings</h2>
                    <p className="text-muted-foreground">Manage global configuration and feature flags.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6">
                {/* Global Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" />
                            <CardTitle>Global Information</CardTitle>
                        </div>
                        <CardDescription>
                            Basic information about your platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="site-title">Site Title</Label>
                            <Input
                                id="site-title"
                                value={globalInfo.title}
                                onChange={(e) => setGlobalInfo(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="MindWell"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="site-desc">Description</Label>
                            <Textarea
                                id="site-desc"
                                value={globalInfo.description}
                                onChange={(e) => setGlobalInfo(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Mental Health & Wellness Platform"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contact-email">Contact Email</Label>
                            <Input
                                id="contact-email"
                                type="email"
                                value={globalInfo.contact_email}
                                onChange={(e) => setGlobalInfo(prev => ({ ...prev, contact_email: e.target.value }))}
                                placeholder="hello@mindwell.com"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Toggles */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            <CardTitle>Feature Toggles</CardTitle>
                        </div>
                        <CardDescription>
                            Enable or disable specific platform features.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">New User Registration</Label>
                                <div className="text-sm text-muted-foreground">
                                    Allow new users to sign up for the platform.
                                </div>
                            </div>
                            <Switch
                                checked={features.registration_enabled}
                                onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, registration_enabled: checked }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Blog Comments</Label>
                                <div className="text-sm text-muted-foreground">
                                    Allow users to comment on blog posts.
                                </div>
                            </div>
                            <Switch
                                checked={features.blog_comments}
                                onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, blog_comments: checked }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base text-destructive">Maintenance Mode</Label>
                                <div className="text-sm text-muted-foreground">
                                    Disable access to the platform for non-admin users.
                                </div>
                            </div>
                            <Switch
                                checked={features.maintenance_mode}
                                onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, maintenance_mode: checked }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Links */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-primary" />
                            <CardTitle>Social Links</CardTitle>
                        </div>
                        <CardDescription>
                            Manage social media links displayed in the footer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="twitter">Twitter / X</Label>
                            <Input
                                id="twitter"
                                value={socialLinks.twitter}
                                onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                                placeholder="https://twitter.com/..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="instagram">Instagram</Label>
                            <Input
                                id="instagram"
                                value={socialLinks.instagram}
                                onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input
                                id="linkedin"
                                value={socialLinks.linkedin}
                                onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                                placeholder="https://linkedin.com/..."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
