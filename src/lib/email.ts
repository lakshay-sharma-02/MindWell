// Resend Email Service
const RESEND_API_KEY = "re_aMfZN2Yj_KfdBAKateFtMYgy6MU5GPx4Q";
const ADMIN_EMAIL = "sharmalakshay0208@gmail.com";

interface EmailData {
  to: string[];
  subject: string;
  html: string;
}

async function sendEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
  const trySend = async (url: string, useProxy: boolean) => {
    console.log(`Attempting to send email via ${useProxy ? 'proxy' : 'direct API'}...`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MindWell <onboarding@resend.dev>",
        to: data.to,
        subject: data.subject,
        html: data.html,
      }),
    });

    if (!response.ok) {
      // Try to parse error as JSON, fallback to text if fails (common with 404/500 html pages)
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorData.name || errorMsg;
      } catch (e) {
        // failed to parse json, likely an html error page (proxy 404)
        console.warn("Could not parse error response JSON", e);
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  };

  try {
    // 1. Try via Proxy first (good for avoiding CORS in dev if configured)
    try {
      await trySend("/api/resend/emails", true);
      console.log("Email sent successfully via Proxy");
      return { success: true };
    } catch (proxyError) {
      console.warn("Proxy attempt failed, trying direct API...", proxyError);

      // 2. Fallback to Direct API
      await trySend("https://api.resend.com/emails", false);
      console.log("Email sent successfully via Direct API");
      return { success: true };
    }
  } catch (error) {
    console.error("All email sending attempts failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred while sending email"
    };
  }
}

// Newsletter subscription - sends notification to admin only
export async function sendNewsletterSubscription(email: string) {
  return await sendEmail({
    to: [ADMIN_EMAIL],
    subject: "[MindWell] New Newsletter Subscription",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #5d7a5d;">New Newsletter Subscription</h2>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 16px;">
          <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">Subscribed at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `,
  });
}

// Contact form submission - sends notification to admin only
export async function sendContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  return await sendEmail({
    to: [ADMIN_EMAIL],
    subject: `[MindWell] Contact Form: ${data.subject || "General Inquiry"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #5d7a5d;">New Contact Form Submission</h2>
        <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9; width: 120px;"><strong>Name:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Email:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Phone:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;">${data.phone || "Not provided"}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Subject:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;">${data.subject}</td>
          </tr>
        </table>
        <h3 style="color: #5d7a5d; margin-top: 24px;">Message:</h3>
        <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${data.message}</div>
        <p style="color: #666; font-size: 12px; margin-top: 16px;">Received at: ${new Date().toLocaleString()}</p>
      </div>
    `,
  });
}

// Booking form submission - sends notification to admin only
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
    transactionId?: string; // For QR
  };
}) {
  return await sendEmail({
    to: [ADMIN_EMAIL],
    subject: `[MindWell] New Booking: ${data.sessionType} (${data.paymentDetails?.method === 'qr' ? 'QR Payment' : 'Card Payment'})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #5d7a5d;">New Booking Request</h2>
        <div style="background: #e8f5e8; padding: 12px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #5d7a5d;">
          <strong>Payment Method:</strong> <span style="text-transform: uppercase;">${data.paymentDetails?.method || 'N/A'}</span>
          ${data.paymentDetails?.transactionId ? `<br><strong>Transaction ID:</strong> ${data.paymentDetails.transactionId}` : ''}
        </div>
        <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9; width: 140px;"><strong>Client Name:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Email:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Phone:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;">${data.phone || "Not provided"}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #5d7a5d; color: white;"><strong>Session Type:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd; background: #e8f5e8; font-weight: bold;">${data.sessionType}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Format:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;">${data.format}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Date:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Time:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;">${data.time}</td>
          </tr>
        </table>
        ${data.notes ? `
          <h3 style="color: #5d7a5d; margin-top: 24px;">Additional Notes:</h3>
          <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${data.notes}</div>
        ` : ''}
        <p style="color: #666; font-size: 12px; margin-top: 16px;">Received at: ${new Date().toLocaleString()}</p>
      </div>
    `,
  });
}

// Story submission - sends notification to admin only with all details
export async function sendStorySubmission(data: {
  name: string;
  email: string;
  title: string;
  story: string;
  anonymous: boolean;
}) {
  return await sendEmail({
    to: [ADMIN_EMAIL],
    subject: `[MindWell] Story Submission: ${data.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #5d7a5d;">New Story Submission</h2>
        <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9; width: 140px;"><strong>Anonymous:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;">${data.anonymous ? "Yes" : "No"}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Name:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;">${data.anonymous ? "Anonymous" : data.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Email:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #5d7a5d; color: white;"><strong>Title:</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd; background: #e8f5e8; font-weight: bold;">${data.title}</td>
          </tr>
        </table>
        <h3 style="color: #5d7a5d; margin-top: 24px;">Full Story:</h3>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #5d7a5d; white-space: pre-wrap; line-height: 1.6;">
          ${data.story.replace(/\n/g, "<br>")}
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 16px;">Submitted at: ${new Date().toLocaleString()}</p>
      </div>
    `,
  });
}
