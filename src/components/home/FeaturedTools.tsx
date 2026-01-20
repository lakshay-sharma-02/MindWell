
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wind, PenTool, Flame, Heart, Sparkles, Lock, Zap, MessageCircleHeart } from "lucide-react";
import { motion } from "framer-motion";

const tools = [
    {
        id: "breathing",
        title: "4-7-8 Breathing",
        description: "A simple rhythmic exercise to reduce anxiety, help you sleep, and manage stress.",
        icon: Wind,
        color: "from-cyan-500/20 to-teal-500/20",
        iconColor: "text-cyan-500",
        isPrivate: false
    },
    {
        id: "worry",
        title: "Worry Jar",
        description: "A safe space to release your persistent thoughts and let them burn away.",
        icon: Flame,
        color: "from-orange-500/20 to-red-500/20",
        iconColor: "text-orange-500",
        isPrivate: false
    },
    {
        id: "mood",
        title: "Mood Tracker",
        description: "Log your daily emotions to identify patterns and understand your mental wellbeing.",
        icon: PenTool,
        color: "from-violet-500/20 to-purple-500/20",
        iconColor: "text-violet-500",
        isPrivate: true
    },
    {
        id: "gratitude",
        title: "Gratitude Journal",
        description: "Cultivate positivity by recording the things you are thankful for each day.",
        icon: Heart,
        color: "from-amber-500/20 to-yellow-500/20",
        iconColor: "text-amber-500",
        isPrivate: true
    },
    {
        id: "share-story",
        title: "Share Your Story",
        description: "Your journey matters. Share your experience to inspire and support others in the community.",
        icon: MessageCircleHeart,
        color: "from-rose-500/20 to-pink-500/20",
        iconColor: "text-rose-500",
        isPrivate: false,
        link: "/stories?action=share"
    }
];

export function FeaturedTools() {
    return (
        <section className="section-padding bg-secondary/5 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container-wide relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 shadow-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Interactive Wellness</span>
                    </motion.div>
                    <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                        Mindful Practices
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        Discover a collection of interactive exercises designed to help you ground yourself,
                        release stress, and build emotional resilience.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tools.map((tool, index) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                            className={`group relative h-full ${index === 4 ? "md:col-span-2 lg:col-span-4" : ""}`}
                        >
                            <Link to={tool.link || `/tools?tab=${tool.id}`} className="block h-full">
                                <div className="relative h-full bg-card hover:bg-card/80 rounded-3xl p-6 border border-border/50 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col overflow-hidden">

                                    {/* Background Gradient on Hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${tool.color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                                                <tool.icon className={`w-6 h-6 ${tool.iconColor}`} />
                                            </div>

                                            {tool.isPrivate ? (
                                                <div className="px-2.5 py-1 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 flex items-center gap-1.5 text-xs font-medium text-muted-foreground" title="Sign In Required">
                                                    <Lock className="w-3 h-3" />
                                                    <span>Personal</span>
                                                </div>
                                            ) : (
                                                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400" title="Try Now">
                                                    <Zap className="w-3 h-3" />
                                                    <span>Instant</span>
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold font-display mb-3 group-hover:text-primary transition-colors">
                                            {tool.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                                            {tool.description}
                                        </p>

                                        <div className="flex items-center text-primary text-sm font-medium mt-auto group/link">
                                            <span className="group-hover:mr-2 transition-all">
                                                {tool.title === "Share Your Story" ? "Share Now" : tool.isPrivate ? "Start Journaling" : "Try Tool"}
                                            </span>
                                            <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <Button variant="outline" size="lg" className="rounded-full px-8 h-12 gap-2 group border-primary/20 hover:bg-primary/5 hover:border-primary/50 text-foreground" asChild>
                        <Link to="/tools">
                            Explore Complete Toolkit
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
