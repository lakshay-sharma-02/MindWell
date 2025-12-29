import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
    global_info: {
        title: string;
        description: string;
        contact_email: string;
        contact_phone: string;
        contact_address: string;
        branding: {
            primary_color: string;
        };
    };
    landing_page: {
        hero: {
            badge_text: string;
            badge_rating: string;
            title_line_1: string;
            title_highlight: string;
            description: string;
            cta_primary: string;
            cta_secondary: string;
        }
    };
    features: {
        registration_enabled: boolean;
        maintenance_mode: boolean;
        blog_comments: boolean;
    };
    social_links: {
        twitter: string;
        instagram: string;
        linkedin: string;
    };
}

const defaultSettings: SiteSettings = {
    global_info: {
        title: "MindWell",
        description: "Mental Health & Wellness Platform",
        contact_email: "hello@mindwell.com",
        contact_phone: "(123) 456-7890",
        contact_address: "San Francisco, CA",
        branding: {
            primary_color: "170 55% 32%",
        }
    },
    landing_page: {
        hero: {
            badge_text: "Trusted by 1,200+ clients",
            badge_rating: "4.9",
            title_line_1: "You Deserve to Feel",
            title_highlight: "Whole Again",
            description: "Compassionate therapy, thoughtful resources, and genuine support for wherever you are on your journey. You're not alone in this.",
            cta_primary: "Start Your Journey",
            cta_secondary: "Free Resources"
        }
    },
    features: {
        registration_enabled: true,
        maintenance_mode: false,
        blog_comments: true,
    },
    social_links: {
        twitter: "https://twitter.com/mindwell",
        instagram: "https://instagram.com/mindwell",
        linkedin: "https://linkedin.com/company/mindwell",
    },
};

export const useSiteSettings = () => {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*');

            if (error) throw error;

            if (data) {
                const newSettings = { ...defaultSettings };
                data.forEach(setting => {
                    // branding is part of global_info in my interface change above, 
                    // BUT in DB it might be a separate key if I want it to be. 
                    // However, my interface put it INSIDE global_info. 
                    // Let's re-read the interface.
                    // Interface: global_info: { ..., branding: { ... } }
                    // Implementation below expects 'global_info' key from DB to contain entire object.
                    // So if I update global_info in DB, it will automatically include branding if I save it there.
                    // But wait, if I want to manage it separately?
                    // Let's stick to putting it inside global_info for simplicity IF global_info is a JSONB.
                    // If global_info is a row with key='global_info', value={...}, then adding branding to defaultSettings works, 
                    // provided the MERGE logic works.
                    // Currently fetchSettings does: newSettings.global_info = setting.value as any; 
                    // This OVERWRITES everything.
                    // So if DB global_info doesn't have branding, it will be lost?
                    // Yes. So I should merge it.
                    if (setting.key === 'global_info') {
                        newSettings.global_info = { ...newSettings.global_info, ...setting.value };
                    }
                    if (setting.key === 'features') newSettings.features = { ...newSettings.features, ...setting.value };
                    if (setting.key === 'social_links') newSettings.social_links = { ...newSettings.social_links, ...setting.value };
                    if (setting.key === 'landing_page') newSettings.landing_page = { ...newSettings.landing_page, ...setting.value };
                });
                setSettings(newSettings);
            }
        } catch (error) {
            console.error('Error fetching site settings:', error);
        } finally {
            setLoading(false);
        }
    };

    return { settings, loading };
};
