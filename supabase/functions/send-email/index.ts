import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string[], subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "MindWell <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });
  return response.json();
}
const ADMIN_EMAIL = "sharmalakshay0208@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "contact" | "booking" | "newsletter" | "story";
  data: Record<string, unknown>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: EmailRequest = await req.json();
    console.log(`Processing ${type} form submission:`, data);

    let subject = "";
    let htmlContent = "";
    let userEmail = "";

    switch (type) {
      case "contact":
        subject = `New Contact Form: ${data.subject || "General Inquiry"}`;
        userEmail = data.email as string;
        htmlContent = `
          <h2>New Contact Form Submission</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.phone || "Not provided"}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Subject:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.subject}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Message:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.message}</td></tr>
          </table>
        `;
        break;

      case "booking":
        subject = `New Booking Request: ${data.sessionType}`;
        userEmail = data.email as string;
        htmlContent = `
          <h2>New Booking Request</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.phone || "Not provided"}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Session Type:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.sessionType}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Format:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.format}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.date}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Time:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.time}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Notes:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.notes || "None"}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Method:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${(data.paymentDetails as any)?.method?.toUpperCase() || "N/A"}</td></tr>
            ${(data.paymentDetails as any)?.transactionId ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Transaction ID:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${(data.paymentDetails as any).transactionId}</td></tr>` : ""}
          </table>
        `;
        break;

      case "newsletter":
        subject = "New Newsletter Subscription";
        userEmail = data.email as string;
        htmlContent = `
          <h2>New Newsletter Subscription</h2>
          <p><strong>Email:</strong> ${data.email}</p>
        `;
        break;

      case "story":
        subject = `Story Submission: ${data.title}`;
        userEmail = data.email as string;
        htmlContent = `
          <h2>New Story Submission</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.anonymous ? "Anonymous" : data.name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Title:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.title}</td></tr>
          </table>
          <h3>Story:</h3>
          <div style="background: #f9f9f9; padding: 16px; border-radius: 8px;">
            ${(data.story as string).replace(/\n/g, "<br>")}
          </div>
        `;
        break;

      default:
        throw new Error("Invalid form type");
    }

    // Send notification email to admin
    const adminEmailResponse = await sendEmail(
      [ADMIN_EMAIL],
      `[MindWell] ${subject}`,
      htmlContent
    );

    console.log("Admin email sent successfully:", adminEmailResponse);

    // Send confirmation email to user (if applicable)
    if (userEmail && type !== "newsletter") {
      const confirmationResponse = await sendEmail(
        [userEmail],
        getConfirmationSubject(type),
        getConfirmationHtml(type, data)
      );
      console.log("Confirmation email sent:", confirmationResponse);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-email function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function getConfirmationSubject(type: string): string {
  switch (type) {
    case "contact":
      return "We received your message - MindWell";
    case "booking":
      return "Booking Request Received - MindWell";
    case "story":
      return "Thank you for sharing your story - MindWell";
    default:
      return "Thank you for contacting MindWell";
  }
}

function getConfirmationHtml(type: string, data: Record<string, unknown>): string {
  const name = (data.name as string) || "there";

  switch (type) {
    case "contact":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #5d7a5d;">Thank you for reaching out, ${name}!</h1>
          <p>We've received your message and will get back to you within 24-48 hours.</p>
          <p>If you have any urgent concerns, please call us at (123) 456-7890.</p>
          <p>Warm regards,<br>The MindWell Team</p>
        </div>
      `;
    case "booking":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #5d7a5d;">Booking Request Received!</h1>
          <p>Hi ${name},</p>
          <p>We've received your booking request for a ${data.sessionType} session on ${data.date} at ${data.time}.</p>
          <p>We'll confirm your appointment within 24 hours. Please check your email for confirmation.</p>
          <p>Warm regards,<br>The MindWell Team</p>
        </div>
      `;
    case "story":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #5d7a5d;">Thank you for sharing your story!</h1>
          <p>Hi ${data.anonymous ? "there" : name},</p>
          <p>Your courage in sharing your mental health journey is inspiring. We've received your story titled "${data.title}".</p>
          <p>If we'd like to feature your story, we'll reach out to you first for permission.</p>
          <p>Warm regards,<br>The MindWell Team</p>
        </div>
      `;
    default:
      return `<p>Thank you for contacting MindWell!</p>`;
  }
}

serve(handler);
