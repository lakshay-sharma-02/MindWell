import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Loader2, AlertCircle, Sparkles, X, Settings, Heart } from "lucide-react";
import { aiService } from "@/lib/ai-services";
import { motion, AnimatePresence } from "framer-motion";
import { OpenRouterMessage } from "@/lib/openrouter";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const COMPANION_AVATARS = [
  { id: 'default', emoji: '🤖', name: 'Bot' },
  { id: 'luna', emoji: '🌙', name: 'Luna' },
  { id: 'sunny', emoji: '☀️', name: 'Sunny' },
  { id: 'sage', emoji: '🧘', name: 'Sage' },
  { id: 'hope', emoji: '✨', name: 'Hope' },
  { id: 'buddy', emoji: '🐶', name: 'Buddy' },
  { id: 'zen', emoji: '🍃', name: 'Zen' },
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

      if (error) {
        // Columns might not exist yet - use defaults
        console.warn('Companion settings not loaded, using defaults:', error);
        return;
      }

      if (data) {
        setCompanionName(data.companion_name || 'Luna');
        setCompanionAvatar(data.companion_avatar || 'luna');
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

    if (data) {
      setMemories(data);
    }
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

      // Add proactive message to chat if opening for first time
      if (messages.length === 0) {
        const proactiveMsg: Message = {
          role: 'assistant',
          content: data[0].message,
          timestamp: new Date(),
        };
        setMessages([proactiveMsg]);

        // Mark as delivered
        await supabase
          .from('proactive_messages')
          .update({ delivered: true, delivered_at: new Date().toISOString() })
          .eq('id', data[0].id);
      }
    }
  };

  const loadChatHistory = () => {
    // Load last conversation from localStorage (keeps context between sessions)
    const storedHistory = localStorage.getItem(`chat_history_${user?.id}`);
    if (storedHistory && messages.length === 0) {
      try {
        const parsed = JSON.parse(storedHistory);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }

    // If no history and no proactive message, show personalized greeting
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

    // Check for memories to personalize
    const recentMemory = memories.find(m => m.memory_type === 'concern');
    if (recentMemory) {
      return `Hi! I remember you mentioned ${recentMemory.memory_key} last time. How's that going? I'm here if you want to talk about it. 💙`;
    }

    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !user) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Build context with memories
      const memoryContext = memories
        .slice(0, 3)
        .map(m => `[Memory: ${m.memory_key} - ${m.memory_value}]`)
        .join('\n');

      const systemPrompt = `You are ${companionName}, a warm and empathetic AI wellness companion. You remember past conversations and provide personalized support. ${memoryContext ? '\n\nContext from past conversations:\n' + memoryContext : ''}`;

      const chatHistory: OpenRouterMessage[] = updatedMessages
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await aiService.chatWithSupport(chatHistory, systemPrompt);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save to localStorage for persistence
      localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(finalMessages.slice(-20)));

      // Extract and store insights as memories
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

    // Simple keyword extraction for memory
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
        }, {
          onConflict: 'user_id,memory_key'
        });
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
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-6 z-50"
          >
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="rounded-full w-16 h-16 shadow-2xl hover:shadow-primary/50 bg-gradient-to-br from-primary to-primary/80 relative group text-2xl"
            >
              {currentAvatar.emoji}
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              {hasProactiveMessage && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
                >
                  !
                </motion.span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed top-20 right-6 z-40 w-[400px] max-w-[calc(100vw-3rem)]"
          >
            <Card className="flex flex-col h-[calc(100vh-6rem)] max-h-[600px] shadow-2xl border-primary/20 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{currentAvatar.emoji}</div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {companionName}
                      <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-xs text-muted-foreground">Always here for you</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowSettings(true)}
                    className="rounded-full"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-600">
                    This is not therapy. For emergencies, call 988 or local services.
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`text-xl flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary'
                        }`}
                      >
                        {message.role === 'user' ? '👤' : currentAvatar.emoji}
                      </div>
                      <div
                        className={`flex-1 ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-block p-3 rounded-2xl max-w-[85%] ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : 'bg-secondary rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-2">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="text-xl w-8 h-8 flex items-center justify-center bg-secondary rounded-full">
                        {currentAvatar.emoji}
                      </div>
                      <div className="bg-secondary p-3 rounded-2xl rounded-bl-none">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t bg-muted/30">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Talk to ${companionName}...`}
                    className="min-h-[60px] max-h-[120px] resize-none"
                    disabled={loading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    size="icon"
                    className="h-[60px] w-[60px] flex-shrink-0"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Companion Settings</DialogTitle>
            <DialogDescription>
              Customize your AI companion's name and appearance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label>Companion Name</Label>
              <div className="flex gap-2">
                <Input
                  value={editingName ? tempName : companionName}
                  onChange={(e) => setTempName(e.target.value)}
                  onFocus={() => {
                    setEditingName(true);
                    setTempName(companionName);
                  }}
                  placeholder="Give your companion a name"
                />
                {editingName && (
                  <Button
                    onClick={() => {
                      if (tempName.trim()) {
                        saveCompanionSettings(tempName, companionAvatar);
                        setEditingName(false);
                      }
                    }}
                  >
                    Save
                  </Button>
                )}
              </div>
            </div>

            {/* Avatar */}
            <div className="space-y-2">
              <Label>Choose Avatar</Label>
              <div className="grid grid-cols-4 gap-3">
                {COMPANION_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => saveCompanionSettings(companionName, avatar.id)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      companionAvatar === avatar.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-3xl mb-1">{avatar.emoji}</div>
                    <p className="text-xs font-medium">{avatar.name}</p>
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
