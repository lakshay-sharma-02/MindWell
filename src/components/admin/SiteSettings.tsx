import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Globe, Settings, Share2, Loader2, LayoutTemplate } from "lucide-react";
import { Json } from "@/types/database";
import { hexToHsl, hslToHex } from "@/lib/utils";

interface GlobalInfo {
    title: string;
    description: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    branding: {
        primary_color: string;
    };
}

interface LandingPage {
    hero: {
        badge_text: string;
        badge_rating: string;
        title_line_1: string;
        title_highlight: string;
        description: string;
        cta_primary: string;
        cta_secondary: string;
    }
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
        contact_phone: "",
        contact_address: "",
        branding: {
            primary_color: "170 55% 32%",
        },
    });

    const [landingPage, setLandingPage] = useState<LandingPage>({
        hero: {
            badge_text: "",
            badge_rating: "",
            title_line_1: "",
            title_highlight: "",
            description: "",
            cta_primary: "",
            cta_secondary: ""
        }
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

    const [apiKeys, setApiKeys] = useState({
        gemini_chat: "",
        gemini_editor: "",
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
                        case 'landing_page':
                            setLandingPage(value);
                            break;
                        case 'features':
                            setFeatures(value);
                            break;
                        case 'social_links':
                            setSocialLinks(value);
                            break;
                        case 'api_keys':
                            setApiKeys(value);
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
                { key: 'landing_page', value: landingPage as unknown as Json, description: 'Landing page configuration' },
                { key: 'features', value: features as unknown as Json, description: 'Feature toggles' },
                { key: 'social_links', value: socialLinks as unknown as Json, description: 'Social media links' },
                { key: 'api_keys', value: apiKeys as unknown as Json, description: 'API Keys for third-party services' },
            ];

            const { error } = await supabase
                .from('site_settings')
                .upsert(updates);

            if (error) throw error;

            toast.success("Settings saved successfully");
            // Reload to apply changes (especially colors)
            // setTimeout(() => window.location.reload(), 1000); // Optional: if we want auto reload
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
                                placeholder="Psyche Space"
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
                                placeholder="psychespaced@gmail.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contact-phone">Phone Number</Label>
                            <Input
                                id="contact-phone"
                                type="tel"
                                value={globalInfo.contact_phone}
                                onChange={(e) => setGlobalInfo(prev => ({ ...prev, contact_phone: e.target.value }))}
                                placeholder=""
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contact-address">Office Address</Label>
                            <Input
                                id="contact-address"
                                value={globalInfo.contact_address}
                                onChange={(e) => setGlobalInfo(prev => ({ ...prev, contact_address: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="primary-color">Primary Color</Label>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-20 rounded border border-input overflow-hidden relative">
                                    <Input
                                        id="primary-color"
                                        type="color"
                                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
                                        value={hslToHex(globalInfo.branding?.primary_color)}
                                        onChange={(e) => setGlobalInfo(prev => ({
                                            ...prev,
                                            branding: { ...prev.branding, primary_color: hexToHsl(e.target.value) }
                                        }))}
                                    />
                                </div>
                                <span className="text-sm text-muted-foreground font-mono">
                                    {globalInfo.branding?.primary_color || "Default Teal"}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Select a brand color. It will be applied globally.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Landing Page Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <LayoutTemplate className="w-5 h-5 text-primary" />
                            <CardTitle>Landing Page</CardTitle>
                        </div>
                        <CardDescription>
                            Customize the hero section and landing page content.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="badge-text">Badge Text</Label>
                                <Input
                                    id="badge-text"
                                    value={landingPage.hero.badge_text}
                                    onChange={(e) => setLandingPage(prev => ({ ...prev, hero: { ...prev.hero, badge_text: e.target.value } }))}
                                    placeholder="Trusted by clients"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="badge-rating">Badge Rating</Label>
                                <Input
                                    id="badge-rating"
                                    value={landingPage.hero.badge_rating}
                                    onChange={(e) => setLandingPage(prev => ({ ...prev, hero: { ...prev.hero, badge_rating: e.target.value } }))}
                                    placeholder="4.9"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="hero-title">Hero Title (Line 1)</Label>
                            <Input
                                id="hero-title"
                                value={landingPage.hero.title_line_1}
                                onChange={(e) => setLandingPage(prev => ({ ...prev, hero: { ...prev.hero, title_line_1: e.target.value } }))}
                                placeholder="You Deserve to Feel"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="hero-highlight">Hero Highlight Text</Label>
                            <Input
                                id="hero-highlight"
                                value={landingPage.hero.title_highlight}
                                onChange={(e) => setLandingPage(prev => ({ ...prev, hero: { ...prev.hero, title_highlight: e.target.value } }))}
                                placeholder="Whole Again"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="hero-desc">Hero Description</Label>
                            <Textarea
                                id="hero-desc"
                                value={landingPage.hero.description}
                                onChange={(e) => setLandingPage(prev => ({ ...prev, hero: { ...prev.hero, description: e.target.value } }))}
                                placeholder="Subtext..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cta-primary">Primary CTA</Label>
                                <Input
                                    id="cta-primary"
                                    value={landingPage.hero.cta_primary}
                                    onChange={(e) => setLandingPage(prev => ({ ...prev, hero: { ...prev.hero, cta_primary: e.target.value } }))}
                                    placeholder="Start Your Journey"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cta-secondary">Secondary CTA</Label>
                                <Input
                                    id="cta-secondary"
                                    value={landingPage.hero.cta_secondary}
                                    onChange={(e) => setLandingPage(prev => ({ ...prev, hero: { ...prev.hero, cta_secondary: e.target.value } }))}
                                    placeholder="Free Resources"
                                />
                            </div>
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

                {/* Integrations & API Keys */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            <CardTitle>Integrations</CardTitle>
                        </div>
                        <CardDescription>
                            Manage API keys for external services.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="gemini-chat-key">Chatbot API Key</Label>
                            <Input
                                id="gemini-chat-key"
                                type="password"
                                value={apiKeys.gemini_chat}
                                onChange={(e) => setApiKeys(prev => ({ ...prev, gemini_chat: e.target.value }))}
                                placeholder="AIzaSy... (for Chatbot)"
                            />
                            <p className="text-xs text-muted-foreground">Used by the MindWell Assistant.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="gemini-editor-key">Editor API Key</Label>
                            <Input
                                id="gemini-editor-key"
                                type="password"
                                value={apiKeys.gemini_editor}
                                onChange={(e) => setApiKeys(prev => ({ ...prev, gemini_editor: e.target.value }))}
                                placeholder="AIzaSy... (for Blog Tweaker)"
                            />
                            <p className="text-xs text-muted-foreground">Used for the "Magic Polish" feature in the blog editor.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
