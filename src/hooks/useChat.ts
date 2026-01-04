
import { useState, useCallback } from 'react';
import { Message, generateResponse } from '@/lib/gemini';
import { useSiteSettings } from './useSiteSettings';

export function useChat() {
    const { settings } = useSiteSettings();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            text: "Hi there! 👋 I'm the MindWell Assistant. How can I support your journey today?",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const sendMessage = useCallback(async (text: string) => {
        if (isLoading) return; // Prevent spamming while waiting for response

        // Add user message immediately
        const userMessage: Message = { role: 'user', text };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Get AI response
            const responseText = await generateResponse(messages, text, settings.api_keys.gemini_chat, settings.api_keys.openrouter);

            const botMessage: Message = { role: 'model', text: responseText };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            // Error handling is mostly done in the API wrapper, but just in case
            setMessages((prev) => [
                ...prev,
                { role: 'model', text: "I apologize, I'm having trouble processing that right now." }
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    const toggleOpen = () => setIsOpen((prev) => !prev);
    const closeChat = () => setIsOpen(false);

    return {
        messages,
        isLoading,
        isOpen,
        sendMessage,
        toggleOpen,
        closeChat
    };
}
