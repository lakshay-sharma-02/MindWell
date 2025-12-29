import { Button } from "@/components/ui/button";
import { Wrench, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-20 pointer-events-none" />

            <div className="relative z-10 text-center space-y-6 max-w-lg mx-auto">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <Wrench className="w-10 h-10 text-primary" />
                </div>

                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                    Under Maintenance
                </h1>

                <p className="text-muted-foreground text-lg leading-relaxed">
                    We are currently performing scheduled maintenance to improve your experience.
                    Please check back shortly.
                </p>

                <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild variant="outline" className="gap-2">
                        <Link to="/auth">
                            Admin Login <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="absolute bottom-8 text-center text-sm text-muted-foreground/60 max-w-md px-4">
                &copy; {new Date().getFullYear()} MindWell. All rights reserved.
            </div>
        </div>
    );
}
