import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Heart, Calendar, Trash2, Sun, Sparkles, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useXP, XP_AMOUNTS } from "@/hooks/useXP";
import { useOfflineSupport } from "@/utils/offlineSupport";

interface GratitudeLog {
    id: string;
    content: string;
    image_url: string | null;
    prompt_used: string | null;
    created_at: string;
}

const PROMPTS = [
    "What is a small luxury you enjoyed today?",
    "Who is someone that always makes you smile, and why?",
    "What is a hard lesson you learned that you are now grateful for?",
    "Describe a beautiful sound you heard recently.",
    "What is a memory that makes you feel warm inside?",
    "What is something you love about your local community?",
    "Name a piece of art (song, movie, painting) that changed your perspective.",
    "What made you laugh recently?",
];

export function GratitudeJournal() {
    const { awardXP } = useXP();
    const { isOffline, addToQueue } = useOfflineSupport();
    const [logs, setLogs] = useState<GratitudeLog[]>([]);
    
    // Form state
    const [newEntry, setNewEntry] = useState("");
    const [activePrompt, setActivePrompt] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        if (user) fetchLogs();
    }, [user]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('gratitude_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching gratitude logs:', error);
            toast.error("Failed to load your journal.");
        } finally {
            setLoading(false);
        }
    };

    const generatePrompt = () => {
        const random = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
        setActivePrompt(random);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image must be less than 5MB");
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEntry.trim()) return;
        if (!user) {
            toast.error("Please sign in to save your journal.");
            return;
        }

        setSubmitting(true);
        try {
            let uploadedImageUrl = null;

            if (imageFile && !isOffline) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                
                const { error: uploadError, data } = await supabase.storage
                    .from('gratitude_images')
                    .upload(fileName, imageFile);
                
                if (uploadError) {
                    toast.error("Failed to upload image. Saving text only.");
                } else if (data) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('gratitude_images')
                        .getPublicUrl(fileName);
                    uploadedImageUrl = publicUrl;
                }
            }

            const logData = {
                user_id: user.id,
                content: newEntry.trim(),
                prompt_used: activePrompt,
                image_url: uploadedImageUrl,
            };

            if (isOffline) {
                if (imageFile) {
                    toast.warning("Images cannot be uploaded while offline. Saving text only.");
                }
                
                addToQueue({
                    url: '/rest/v1/gratitude_logs',
                    method: 'POST',
                    body: logData
                });

                setLogs([{
                    id: 'temp-' + Date.now(),
                    ...logData,
                    created_at: new Date().toISOString()
                } as GratitudeLog, ...logs]);

                toast.success("Saved offline! Will sync when connected.");
            } else {
                const { data, error } = await supabase
                    .from('gratitude_logs')
                    .insert([logData])
                    .select()
                    .single();

                if (error) throw error;
                setLogs([data, ...logs]);

                await awardXP(XP_AMOUNTS.JOURNAL_ENTRY, 'journal_entry', 'Gratitude journal entry', { length: newEntry.trim().length });
                await supabase.rpc('check_badge_eligibility', { p_user_id: user.id });
                await supabase.rpc('increment_challenge_progress', { p_user_id: user.id, p_challenge_type: 'gratitude' });
                
                toast.success("Saved to your gratitude journal! +25 XP");
            }

            // Reset
            setNewEntry("");
            setActivePrompt(null);
            removeImage();
            
        } catch (error) {
            console.error('Error saving gratitude log:', error);
            toast.error("Failed to save entry.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            if (!id.startsWith('temp-')) {
                const { error } = await supabase.from('gratitude_logs').delete().eq('id', id);
                if (error) throw error;
            }
            setLogs(logs.filter(log => log.id !== id));
            toast.success("Entry deleted.");
        } catch (error) {
            console.error('Error deleting log:', error);
            toast.error("Failed to delete entry.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[400px] border border-orange-100/50 dark:border-orange-500/10">
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
                    <Heart className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-3">Practice Gratitude</h3>
                <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                    Cultivate a positive mindset by journaling your daily gratitude. Sign in to start your collection.
                </p>
                <div className="flex gap-4">
                    <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20">
                        <Link to="/auth">Sign In to Journal</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] max-w-6xl mx-auto">
            {/* Input Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
            >
                <Card className="border-none shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center justify-between text-2xl font-display text-orange-700 dark:text-orange-400">
                            <span className="flex items-center gap-2"><Sun className="w-6 h-6" /> Daily Gratitude</span>
                            <Button variant="ghost" size="sm" onClick={generatePrompt} className="text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20">
                                <Sparkles className="w-4 h-4 mr-2" /> Inspire Me
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4 relative">
                            
                            <AnimatePresence>
                                {activePrompt && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="bg-white/60 dark:bg-black/40 p-4 rounded-xl border border-orange-200/50 dark:border-orange-800/50 relative"
                                    >
                                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200 italic pr-6">"{activePrompt}"</p>
                                        <button type="button" onClick={() => setActivePrompt(null)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Textarea
                                placeholder="Today, I am grateful for..."
                                className="min-h-[160px] text-lg bg-white/50 dark:bg-black/20 border-orange-200 dark:border-orange-800 focus-visible:ring-orange-400 resize-none p-5 rounded-xl placeholder:text-muted-foreground/50 shadow-inner"
                                value={newEntry}
                                onChange={(e) => setNewEntry(e.target.value)}
                            />

                            {/* Image Attachment Preview */}
                            <AnimatePresence>
                                {imagePreview && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="relative w-full h-32 rounded-xl overflow-hidden border border-border"
                                    >
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button 
                                            type="button" 
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center gap-3">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef} 
                                    onChange={handleImageSelect} 
                                />
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 bg-white/50 dark:bg-black/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50"
                                >
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    {imageFile ? 'Change Photo' : 'Add Photo'}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting || !newEntry.trim()}
                                    className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md hover:shadow-lg disabled:opacity-70 transition-all"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    ) : (
                                        <Heart className="w-5 h-5 mr-2 fill-current" />
                                    )}
                                    Save Entry
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>

            {/* History Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <h3 className="text-xl font-semibold text-foreground/80">Your Collection</h3>
                    <span className="text-sm text-muted-foreground">{logs.length} moments</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <AnimatePresence mode="popLayout">
                        {logs.map((log) => (
                            <motion.div
                                key={log.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                <Card className="h-full bg-card/50 hover:bg-card transition-colors border-border/50 hover:border-border group relative overflow-hidden flex flex-col">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-amber-400 opacity-50" />
                                    
                                    {/* Image Display */}
                                    {log.image_url && (
                                        <div className="w-full h-32 bg-muted relative">
                                            <img src={log.image_url} alt="Gratitude" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <CardContent className="p-5 flex flex-col flex-1">
                                        {log.prompt_used && (
                                            <p className="text-[11px] font-medium uppercase tracking-wider text-orange-500/70 mb-2 line-clamp-1">
                                                {log.prompt_used}
                                            </p>
                                        )}
                                        <p className="text-[15px] leading-relaxed text-foreground/90 font-medium whitespace-pre-wrap mb-4 flex-1">
                                            "{log.content}"
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t border-border/30">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(log.created_at), "MMM d, yyyy")}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(log.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {logs.length === 0 && (
                        <div className="col-span-full py-16 text-center text-muted-foreground bg-secondary/10 rounded-2xl border border-dashed border-border">
                            <Sun className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                            <p>No gratitude logs yet.</p>
                            <p className="text-sm mt-1 opacity-70">Start by writing down one simple thing.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
