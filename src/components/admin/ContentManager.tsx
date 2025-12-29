import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export function ContentManager() {
    const { settings } = useSiteSettings();
    const [loading, setLoading] = useState(false);

    // Local state for the form, initialized from settings
    // Note: we can't easily sync back if settings update from remote, but for Admin it's okay
    const [hero, setHero] = useState(settings.landing_page.hero);

    const handleHeroChange = (key: keyof typeof hero, value: string) => {
        setHero(prev => ({ ...prev, [key]: value }));
    };

    const saveSettings = async () => {
        setLoading(true);
        try {
            // We must merge with existing settings to avoid losing other keys if we had them
            // But here we are just updating the 'landing_page' key in Supabase
            const updatedLandingPage = {
                hero: hero
            };

            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'landing_page',
                    value: updatedLandingPage,
                    description: 'Landing Page Content Configuration'
                });

            if (error) throw error;

            toast.success("Content updated successfully! Refresh the home page to see changes.");
        } catch (error) {
            console.error('Error saving content:', error);
            toast.error("Failed to save content");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Hero Section (Landing Page)</CardTitle>
                    <CardDescription>
                        Customize the main content visible on your homepage.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Title Line 1</Label>
                            <Input
                                value={hero.title_line_1}
                                onChange={(e) => handleHeroChange('title_line_1', e.target.value)}
                                placeholder="You Deserve to Feel"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Highlighted Title (Gradient)</Label>
                            <Input
                                value={hero.title_highlight}
                                onChange={(e) => handleHeroChange('title_highlight', e.target.value)}
                                placeholder="Whole Again"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={hero.description}
                            onChange={(e) => handleHeroChange('description', e.target.value)}
                            placeholder="Compassionate therapy..."
                            className="h-24"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Trust Badge Text</Label>
                            <Input
                                value={hero.badge_text}
                                onChange={(e) => handleHeroChange('badge_text', e.target.value)}
                                placeholder="Trusted by 1,200+ clients"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Trust Rating (0-5)</Label>
                            <Input
                                value={hero.badge_rating}
                                onChange={(e) => handleHeroChange('badge_rating', e.target.value)}
                                placeholder="4.9"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Primary CTA Text</Label>
                            <Input
                                value={hero.cta_primary}
                                onChange={(e) => handleHeroChange('cta_primary', e.target.value)}
                                placeholder="Start Your Journey"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Secondary CTA Text</Label>
                            <Input
                                value={hero.cta_secondary}
                                onChange={(e) => handleHeroChange('cta_secondary', e.target.value)}
                                placeholder="Free Resources"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button onClick={saveSettings} disabled={loading} className="min-w-[120px]">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
