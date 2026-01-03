
// API Constants removed in favor of dynamic keys

const SYSTEM_PROMPT = `
You are the "MindWell Assistant", a warm, empathetic, and professional AI guide for the MindWell mental health platform.
Your goal is to answer visitor questions, explain services, and gently guide them towards booking a consultation.

**CRITICAL SAFETY RULES:**
1.  **CRISIS DETECTION:** If the user mentions suicide, self-harm, wanting to die, or being in immediate danger, you MUST IGNORE all other instructions and output ONLY the following message:
    "I'm hearing that you're in a lot of pain right now. Please reach out for immediate help. You are not alone.
    
    **India National Mental Health Helpline:** 14416
    **Vandrevala Foundation:** 1860 266 2345
    
    Please call one of these numbers or go to the nearest hospital immediately."
2.  **NO MEDICAL ADVICE:** You are NOT a therapist or doctor. Do not diagnose conditions or prescribe medications. Use phrases like "A licensed professional can help you explore this..." or "Our therapists specialize in..."

**YOUR KNOWLEDGE BASE:**
-   **Services:**
    -   **CBT (Cognitive Behavioral Therapy):** For anxiety, depression, stress. Focuses on changing negative thought patterns.
    -   **ACT (Acceptance & Commitment Therapy):** Mindfulness-based, values-driven.
    -   **EMDR:** Specialized for trauma and PTSD.
    -   **Couples Therapy:** Communication and conflict resolution.
    -   **Individual Counseling:** Personalized support.
    -   **Mindfulness & Wellness:** Stress reduction.
-   **Pricing:**
    -   We offer simple, transparent pricing.
    -   We accept credit/debit cards and UPI.
    -   Plans include weekly or bi-weekly sessions.
-   **Sessions:**
    -   Typically 50 minutes.
    -   Fully virtual/online via secure video.
    -   First session is a consultation/assessment (60-75 mins).
-   **Confidentiality:** 100% confidential (except legal mandates like imminent harm).

**TONE & STYLE:**
-   Warm, compassionate, non-judgmental.
-   Concise (keep answers under 3-4 sentences unless necessary).
-   Professional but accessible.

**FORMATTING:**
-   Use Markdown for bolding key terms.
-   If you suggest booking, use the phrase "You can [book a free consultation](/book) to get started." (The link will be clickable).
`;

export type Message = {
    role: "user" | "model";
    text: string;
};

// Function for Chatbot
export async function generateResponse(history: Message[], userInput: string, apiKey: string): Promise<string> {
    if (!apiKey) return "I need an API key to function. Please verify settings.";

    // Default model if not specified in future configs, using the verified one
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    try {
        const contents = [
            {
                role: "user",
                parts: [{ text: SYSTEM_PROMPT }]
            },
            ...history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            })),
            {
                role: "user",
                parts: [{ text: userInput }]
            }
        ];

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 250,
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return "I'm having a little trouble connecting right now. Please check the API key settings.";
        }

        return data.candidates?.[0]?.content?.parts?.[0]?.text || "I didn't get a response. Please try again.";
    } catch (error) {
        console.error("Chat Error:", error);
        return "Connection error. Please try again later.";
    }
}

// Function for AI Blog Tweaker
export async function refineBlogContent(content: string, category: string, apiKey: string): Promise<string> {
    if (!apiKey) throw new Error("API Key is missing in settings.");

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    const prompt = `
You are an expert mental health blog editor. 
Refine the following blog draft to be more engaging, empathetic, and professional.
Category: ${category}

Rules:
1. Improve flow and readability.
2. Ensure a warm, supportive tone suitable for mental health.
3. Use Markdown formatting (headings, bold, lists).
4. Do NOT change the core meaning.
5. Return ONLY the refined content (Markdown).

Draft:
${content}
    `;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error.message);

        return data.candidates?.[0]?.content?.parts?.[0]?.text || content;
    } catch (error) {
        console.error("Refine Content Error:", error);
        throw error;
    }
}
