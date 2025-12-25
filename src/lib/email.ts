import { supabase } from "@/integrations/supabase/client";

// No more hardcoded keys! 
// The API Key now lives securely in Supabase Secrets.

interface EmailData {
  to?: string[]; // Kept for interface compatibility, but logic is handled by backend now
  subject?: string;
  html?: string;
  type?: "contact" | "booking" | "newsletter" | "story";
  data?: Record<string, unknown>;
}

async function invokeEmailFunction(type: string, data: Record<string, unknown>) {
  console.log(`[Email Service] Initiating email request for type: '${type}'`);
  console.log(`[Email Service] Payload:`, data);

  try {
    const { data: responseData, error } = await supabase.functions.invoke('send-email', {
      body: { type, data },
    });

    if (error) {
      console.error("[Email Service] Edge Function returned error:", error);
      throw new Error(error.message || "Failed to communicate with email server.");
    }

    console.log("[Email Service] Success response:", responseData);

    // Ensure we always return a success flag, even if the function returns variable data
    return { success: true, data: responseData };

  } catch (err) {
    console.error("[Email Service] Critical Failure:", err);
    // Re-throw so the UI knows it failed
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// Newsletter subscription
export async function sendNewsletterSubscription(email: string) {
  return await invokeEmailFunction("newsletter", { email });
}

// Contact form submission
export async function sendContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  return await invokeEmailFunction("contact", data);
}

// Booking form submission
export async function sendBookingForm(data: {
  name: string;
  email: string;
  phone?: string;
  sessionType: string;
  format: string;
  date: string;
  time: string;
  notes?: string;
  paymentDetails?: {
    method: "card" | "qr";
    transactionId?: string;
  };
}) {
  return await invokeEmailFunction("booking", data);
}

// Story submission
export async function sendStorySubmission(data: {
  name: string;
  email: string;
  title: string;
  story: string;
  anonymous: boolean;
}) {
  return await invokeEmailFunction("story", data);
}
