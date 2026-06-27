import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, AlertCircle, Sparkles, X, Settings, Heart, Mic } from "lucide-react";
import { aiService } from "@/lib/ai-services";
import { motion, AnimatePresence } from "framer-motion";
import { OpenRouterMessage } from "@/lib/openrouter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const COMPANION_AVATARS = [
  { id: 'default', emoji: '🤖', name: 'Bot', color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'luna', emoji: '🌙', name: 'Luna', color: 'from-indigo-500/20 to-purple-500/20' },
  { id: 'sunny', emoji: '☀️', name: 'Sunny', color: 'from-amber-500/20 to-orange-500/20' },
  { id: 'sage', emoji: '🧘', name: 'Sage', color: 'from-emerald-500/20 to-teal-500/20' },
  { id: 'hope', emoji: '✨', name: 'Hope', color: 'from-pink-500/20 to-rose-500/20' },
  { id: 'buddy', emoji: '🐶', name: 'Buddy', color: 'from-amber-700/20 to-yellow-600/20' },
  { id: 'zen', emoji: '🍃', name: 'Zen', color: 'from-green-500/20 to-emerald-500/20' },
];

export function AIChatCompanion() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Companion personality
  const [companionName, setCompanionName] = useState("Luna");
  const [companionAvatar, setCompanionAvatar] = useState("luna");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Memory and proactive messaging
  const [memories, setMemories] = useState<any[]>([]);
  const [hasProactiveMessage, setHasProactiveMessage] = useState(false);

  useEffect(() => {
    if (user) {
      loadCompanionSettings();
      loadMemories();
      checkProactiveMessages();
      loadChatHistory();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadCompanionSettings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('companion_name, companion_avatar')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        if (data.companion_name) setCompanionName(data.companion_name);
        if (data.companion_avatar) setCompanionAvatar(data.companion_avatar);
      }
    } catch (error) {
      console.warn('Error loading companion settings:', error);
    }
  };

  const saveCompanionSettings = async (name: string, avatar: string) => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({
        companion_name: name,
        companion_avatar: avatar,
      })
      .eq('id', user.id);

    setCompanionName(name);
    setCompanionAvatar(avatar);
  };

  const loadMemories = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('companion_memory')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(10);
    if (data) setMemories(data);
  };

  const checkProactiveMessages = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('proactive_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('delivered', false)
      .order('priority', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setHasProactiveMessage(true);
      if (messages.length === 0) {
        const proactiveMsg: Message = {
          role: 'assistant',
          content: data[0].message,
          timestamp: new Date(),
        };
        setMessages([proactiveMsg]);
        await supabase
          .from('proactive_messages')
          .update({ delivered: true, delivered_at: new Date().toISOString() })
          .eq('id', data[0].id);
      }
    }
  };

  const loadChatHistory = () => {
    const storedHistory = localStorage.getItem(`chat_history_${user?.id}`);
    if (storedHistory && messages.length === 0) {
      try {
        const parsed = JSON.parse(storedHistory);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }

    if (messages.length === 0 && !hasProactiveMessage) {
      const greeting = generatePersonalizedGreeting();
      setMessages([{
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }]);
    }
  };

  const generatePersonalizedGreeting = (): string => {
    const greetings = [
      `Hello! I'm ${companionName}, your wellness companion. How are you feeling today? 💙`,
      `Hey there! ${companionName} here. I'm always here to listen. What's on your mind?`,
      `Welcome back! It's ${companionName}. Ready to check in with yourself today?`,
    ];
    const recentMemory = memories.find(m => m.memory_type === 'concern');
    if (recentMemory) {
      return `Hi! I remember you mentioned ${recentMemory.memory_key} last time. How's that going? I'm here if you want to talk about it. 💙`;
    }
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !user) return;
    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const memoryContext = memories
        .slice(0, 3)
        .map(m => `[Memory: ${m.memory_key} - ${m.memory_value}]`)
        .join('\n');

      const systemPrompt = `You are ${companionName}, a warm and empathetic AI wellness companion. You remember past conversations and provide personalized support. ${memoryContext ? '\n\nContext from past conversations:\n' + memoryContext : ''}`;

      const chatHistory: OpenRouterMessage[] = updatedMessages
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await aiService.chatWithSupport(chatHistory, systemPrompt);

      const assistantMessage: Message = { role: 'assistant', content: response, timestamp: new Date() };
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(finalMessages.slice(-20)));
      await extractAndStoreMemory(input, response);
    } catch (error) {
      console.error('Chat failed:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting right now. If you need immediate support, please reach out to the 988 Suicide & Crisis Lifeline.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const extractAndStoreMemory = async (userInput: string, aiResponse: string) => {
    if (!user) return;
    const concerns = ['stress', 'anxiety', 'work', 'sleep', 'relationship', 'family', 'health'];
    const lowercaseInput = userInput.toLowerCase();
    for (const concern of concerns) {
      if (lowercaseInput.includes(concern)) {
        await supabase.from('companion_memory').upsert({
          user_id: user.id,
          memory_type: 'concern',
          memory_key: concern,
          memory_value: userInput.slice(0, 200),
          last_referenced_at: new Date().toISOString(),
        }, { onConflict: 'user_id,memory_key' });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentAvatar = COMPANION_AVATARS.find(a => a.id === companionAvatar) || COMPANION_AVATARS[0];

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 group"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-colors duration-500 animate-pulse" />
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="relative rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-primary/50 bg-background/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-primary/20 hover:border-primary/50 text-2xl sm:text-3xl transition-all duration-300 hover:scale-110 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center justify-center filter drop-shadow-md">{currentAvatar.emoji}</span>
              <span className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              {hasProactiveMessage && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
                >
                  !
                </motion.span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 sm:top-24 sm:right-8 sm:bottom-auto z-40 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[calc(100vw-2rem)] shadow-2xl rounded-3xl"
          >
            <Card className="flex flex-col h-[calc(100vh-2rem)] sm:h-[calc(100vh-8rem)] max-h-[750px] sm:max-h-[650px] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden bg-background/80 dark:bg-zinc-950/80 backdrop-blur-3xl rounded-3xl">
              
              {/* Premium Header */}
              <div className={cn("relative flex items-center justify-between p-4 sm:p-5 border-b border-border/50 bg-gradient-to-br", currentAvatar.color)}>
                <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />
                <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <div className="text-3xl sm:text-4xl bg-background/50 backdrop-blur-sm w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl shadow-inner border border-white/20">
                      {currentAvatar.emoji}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-display font-semibold flex items-center gap-2 tracking-wide text-foreground">
                      {companionName}
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground">Always here for you</p>
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setShowSettings(true)} className="rounded-full hover:bg-background/40">
                    <Settings className="w-4 h-4 text-foreground/70" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-background/40">
                    <X className="w-5 h-5 text-foreground/70" />
                  </Button>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-600/80">
                    Not a crisis service. Call 988 for emergencies.
                  </p>
                </div>
              </div>

              {/* Chat Area */}
              <ScrollArea className="flex-1 p-5" ref={scrollRef}>
                <div className="space-y-6 pb-2">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className={`text-xl flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-2xl shadow-sm border ${
                        message.role === 'user' ? 'bg-primary text-primary-foreground border-primary/20' : 'bg-secondary border-border/50'
                      }`}>
                        {message.role === 'user' ? '👤' : currentAvatar.emoji}
                      </div>
                      
                      <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                        <div className={`inline-block p-3.5 sm:p-4 rounded-3xl shadow-sm ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-sm border border-primary/20'
                            : 'bg-card border border-border/50 rounded-tl-sm shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]'
                        }`}>
                          <p className={`text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap font-medium ${message.role === 'user' ? 'text-white' : 'text-foreground/90'}`}>
                            {message.content}
                          </p>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground/60 mt-1.5 px-2 uppercase tracking-wider">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 flex-row">
                      <div className="text-xl flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-2xl bg-secondary border border-border/50">
                        {currentAvatar.emoji}
                      </div>
                      <div className="bg-card border border-border/50 p-4 rounded-3xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 bg-background/50 backdrop-blur-xl border-t border-border/50">
                <div className="relative flex items-end gap-2 bg-card border border-border/80 focus-within:border-primary/50 focus-within:shadow-[0_0_20px_-10px_rgbavar(--primary),0.3] transition-all rounded-3xl p-1.5">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Talk to ${companionName}...`}
                    className="min-h-[50px] max-h-[120px] resize-none border-none shadow-none focus-visible:ring-0 bg-transparent text-sm sm:text-[15px] py-3 px-3 font-medium placeholder:text-muted-foreground/60"
                    disabled={loading}
                  />
                  <div className="flex gap-1 mb-1 mr-1">
                    <Button type="button" variant="ghost" size="icon" className="rounded-full w-10 h-10 text-muted-foreground hover:text-primary">
                      <Mic className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      size="icon"
                      className="rounded-full w-10 h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform active:scale-95"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -ml-0.5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md rounded-3xl border-white/10 shadow-2xl bg-card/95 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Companion Settings</DialogTitle>
            <DialogDescription>
              Customize your AI companion's personality and appearance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="uppercase text-[11px] font-bold tracking-wider text-muted-foreground">Companion Name</Label>
              <div className="flex gap-2">
                <Input
                  value={editingName ? tempName : companionName}
                  onChange={(e) => setTempName(e.target.value)}
                  onFocus={() => {
                    setEditingName(true);
                    setTempName(companionName);
                  }}
                  className="rounded-xl bg-muted/50 border-border/50 focus-visible:ring-primary/50"
                />
                {editingName && (
                  <Button onClick={() => {
                      if (tempName.trim()) {
                        saveCompanionSettings(tempName, companionAvatar);
                        setEditingName(false);
                      }
                    }} className="rounded-xl font-medium">Save</Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="uppercase text-[11px] font-bold tracking-wider text-muted-foreground">Choose Avatar</Label>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                {COMPANION_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => saveCompanionSettings(companionName, avatar.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all hover:scale-105 ${
                      companionAvatar === avatar.id
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border/50 bg-card hover:border-primary/40'
                    }`}
                  >
                    <div className="text-3xl mb-2 filter drop-shadow-sm">{avatar.emoji}</div>
                    <p className={`text-[11px] font-bold tracking-wide ${companionAvatar === avatar.id ? 'text-primary' : 'text-muted-foreground'}`}>{avatar.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
