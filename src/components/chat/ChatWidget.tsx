
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, User, Bot } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import { Link } from "react-router-dom";

export function ChatWidget() {
    const { messages, isLoading, isOpen, sendMessage, toggleOpen } = useChat();
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        sendMessage(inputValue);
        setInputValue("");
    };

    const suggestions = [
        "How much does therapy cost?",
        "What services do you offer?",
        "How do I book a session?",
        "Is this confidential?"
    ];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-20 right-4 md:right-8 z-50 w-[90vw] md:w-[400px] h-[600px] max-h-[70vh] flex flex-col shadow-2xl rounded-2xl border border-white/20 bg-background/80 backdrop-blur-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-border/50 bg-primary/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">MindWell Assistant</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={toggleOpen} className="h-8 w-8 hover:bg-primary/10">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                                        }`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-secondary/50 border border-border/50 rounded-tl-none'
                                        }`}>
                                        <ReactMarkdown
                                            components={{
                                                a: ({ node, ...props }) => <Link to={props.href || "#"} className="underline font-medium hover:text-primary/80" {...props} />
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-secondary/50 border border-border/50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-border/50 bg-background/50">
                            {messages.length === 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                                    {suggestions.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => sendMessage(s)}
                                            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary border border-border text-xs text-muted-foreground transition-colors"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="flex-1 bg-secondary/50 border-0 focus:ring-0 rounded-full pl-4 pr-12 py-3 text-sm placeholder:text-muted-foreground focus:bg-secondary transition-all"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="absolute right-1 top-1 bottom-1 h-auto w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                onClick={toggleOpen}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-5 right-5 z-[9999] p-4 rounded-full bg-primary text-primary-foreground shadow-2xl hover:shadow-xl transition-all"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>
        </>
    );
}
