export function getErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";

  // Supabase/PostgREST errors are often plain objects
  if (typeof error === "object") {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage;

    const maybeError = (error as { error?: unknown }).error;
    if (typeof maybeError === "string" && maybeError.trim()) return maybeError;

    const maybeDetails = (error as { details?: unknown }).details;
    if (typeof maybeDetails === "string" && maybeDetails.trim()) return maybeDetails;
  }

  if (typeof error === "string" && error.trim()) return error;
  if (error instanceof Error && error.message) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}
