
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { BreathingExercise } from "@/components/tools/BreathingExercise";
import { MoodTracker } from "@/components/tools/MoodTracker";
import { motion } from "framer-motion";
import { WaveDivider } from "@/components/shared/WaveDivider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wind, PenTool, Sparkles, Heart, Flame } from "lucide-react";
import { GratitudeJournal } from "@/components/tools/GratitudeJournal";
import { WorryJar } from "@/components/tools/WorryJar";

export default function Tools() {
    return (
        <Layout>
            <SEOHead
                title="Wellness Tools - Unheard Pages"
                description="Interactive tools for your mental well-being. Track your mood and practice guided breathing."
            />

            {/* Hero */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-primary/5">
                <div className="container-wide relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Self-Care Toolkit</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold font-display mb-6"
                    >
                        Your Space to Breathe
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        Simple, effective tools designed to help you ground yourself and track your emotional journey.
                    </motion.p>
                </div>
                <WaveDivider variant="wave" color="hsl(var(--background))" className="-mb-1" />
            </section>

            {/* Tools Section */}
            <section className="py-20 bg-background min-h-[60vh]">
                <div className="container-wide">
                    <Tabs defaultValue="breathing" className="max-w-4xl mx-auto">
                        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-12 p-1 bg-secondary/30 rounded-2xl h-auto relative">
                            <TabsTrigger value="breathing" className="w-full flex items-center justify-center text-base md:text-lg py-3 md:py-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                                <Wind className="w-5 h-5 mr-2" />
                                Breathing
                            </TabsTrigger>
                            <TabsTrigger value="mood" className="w-full flex items-center justify-center text-base md:text-lg py-3 md:py-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                                <PenTool className="w-5 h-5 mr-2" />
                                Mood Journal
                            </TabsTrigger>
                            <TabsTrigger value="gratitude" className="w-full flex items-center justify-center text-base md:text-lg py-3 md:py-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                                <Heart className="w-5 h-5 mr-2" />
                                Gratitude
                            </TabsTrigger>
                            <TabsTrigger value="worry" className="w-full flex items-center justify-center text-base md:text-lg py-3 md:py-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                                <Flame className="w-5 h-5 mr-2" />
                                Worry Jar
                            </TabsTrigger>
                        </TabsList>


                        <TabsContent value="breathing" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="max-w-2xl mx-auto">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-display font-bold mb-2">4-7-8 Breathing Technique</h2>
                                    <p className="text-muted-foreground">A simple rhythmic breathing exercise to reduce anxiety and help you sleep.</p>
                                </div>
                                <BreathingExercise />
                            </div>
                        </TabsContent>

                        <TabsContent value="mood" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <MoodTracker />
                        </TabsContent>

                        <TabsContent value="gratitude" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <GratitudeJournal />
                        </TabsContent>

                        <TabsContent value="worry" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <WorryJar />
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </Layout>
    );
}
