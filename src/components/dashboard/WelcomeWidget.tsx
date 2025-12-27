
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Moon, Sunrise, Sunset, Quote } from "lucide-react";

interface WelcomeWidgetProps {
    userName?: string;
}

const QUOTES = [
    "The only journey is the one within.",
    "Breathe. You are exactly where you need to be.",
    "Your mental health is a priority. Your happiness is essential.",
    "Small steps every day add up to big results.",
    "You are stronger than you know.",
    "Peace comes from within. Do not seek it without.",
];

export function WelcomeWidget({ userName = "Friend" }: WelcomeWidgetProps) {
    const [greeting, setGreeting] = useState("");
    const [quote, setQuote] = useState("");
    const [Icon, setIcon] = useState(Sun);

    useEffect(() => {
        const hour = new Date().getHours();
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        setQuote(randomQuote);

        if (hour < 12) {
            setGreeting("Good Morning");
            setIcon(Sunrise);
        } else if (hour < 18) {
            setGreeting("Good Afternoon");
            setIcon(Sun);
        } else {
            setGreeting("Good Evening");
            setIcon(Moon);
        }
    }, []);

    const firstName = userName.split(" ")[0];

    return (
        <Card className="border-none bg-gradient-to-r from-primary/10 to-secondary/20 shadow-sm overflow-hidden relative">
            <div className="absolute right-0 top-0 opacity-5 -translate-y-1/2 translate-x-1/4">
                <Icon className="w-64 h-64 text-primary" />
            </div>
            
            <CardContent className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium uppercase tracking-wider">{greeting}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                            Hello, {firstName}
                        </h2>
                    </div>

                    <div className="bg-background/40 backdrop-blur-sm p-4 rounded-xl border border-white/10 max-w-md">
                        <div className="flex gap-3">
                            <Quote className="w-5 h-5 text-primary/60 flex-shrink-0 mt-1" />
                            <p className="text-muted-foreground italic font-medium">
                                "{quote}"
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
