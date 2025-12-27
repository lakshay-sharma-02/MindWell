
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export function RecommendedWidget() {
    const [blog, setBlog] = useState<any>(null);

    useEffect(() => {
        const fetchRecommendation = async () => {
            // Simple logic: fetch one random latest blog
            const { data } = await supabase
                .from("blogs")
                .select("*")
                .eq("published", true)
                .limit(1)
                .order("created_at", { ascending: false }); // ideally random, but latest is fine for v1

            if (data && data.length > 0) {
                setBlog(data[0]);
            }
        };

        fetchRecommendation();
    }, []);

    if (!blog) return null;

    return (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background to-primary/5">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Daily Read
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    {blog.image && (
                        <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden bg-muted">
                            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="flex-1 space-y-3 text-center md:text-left">
                        <h3 className="text-xl font-bold leading-tight">{blog.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 md:line-clamp-3">
                            {blog.excerpt}
                        </p>
                        <Button asChild size="sm" className="mt-2">
                            <Link to={`/blog/${blog.slug}`}>
                                Read Article <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
