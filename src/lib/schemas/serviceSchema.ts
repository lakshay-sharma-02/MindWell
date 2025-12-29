import { z } from "zod";

export const serviceFormSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    duration: z.string().min(1, "Duration is required"),
    price: z.string().min(1, "Price is required"), // Could add regex for currency format if needed
    description: z.string().min(10, "Description must be at least 10 characters"),
    features: z.string().min(5, "At least one feature is required"),
    popular: z.boolean().default(false),
});

export type ServiceValues = z.infer<typeof serviceFormSchema>;
