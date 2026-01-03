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
    api_keys: {
        gemini_chat: string;
        gemini_editor: string;
    };
}

const defaultSettings: SiteSettings = {
    global_info: {
        title: "Psyche Space",
        description: "A Space to Pause, Reflect, Heal",
        contact_email: "psychespaced@gmail.com",
        contact_phone: "",
        contact_address: "Gurugram, India",
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
        twitter: "https://twitter.com/psychespace",
        instagram: "https://instagram.com/psychespace",
        linkedin: "https://linkedin.com/company/psychespace",
    },
    api_keys: {
        gemini_chat: "",
        gemini_editor: "",
    },
};

const CACHE_KEY = 'site_settings_cache';

export const useSiteSettings = () => {
    const [settings, setSettings] = useState<SiteSettings>(() => {
        // Try to load from cache first
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (e) {
            console.error('Error parsing site settings cache:', e);
        }
        return defaultSettings;
    });

    // If we loaded from cache, we're not technically "loading" in a UI blocking sense,
    // but we still want to fetch fresh data.
    // However, for the purpose of "should I show a spinner", if we have cache, we don't need a spinner.
    const [loading, setLoading] = useState(!localStorage.getItem(CACHE_KEY));

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
                    const value = setting.value as any;
                    if (setting.key === 'global_info') {
                        newSettings.global_info = { ...newSettings.global_info, ...value };
                    }
                    if (setting.key === 'features') newSettings.features = { ...newSettings.features, ...value };
                    if (setting.key === 'social_links') newSettings.social_links = { ...newSettings.social_links, ...value };
                    if (setting.key === 'landing_page') newSettings.landing_page = { ...newSettings.landing_page, ...value };
                    if (setting.key === 'api_keys') newSettings.api_keys = { ...newSettings.api_keys, ...value };
                });

                setSettings(newSettings);
                // Update cache
                localStorage.setItem(CACHE_KEY, JSON.stringify(newSettings));
            }
        } catch (error) {
            console.error('Error fetching site settings:', error);
        } finally {
            setLoading(false);
        }
    };

    return { settings, loading };
};
