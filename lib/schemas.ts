import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().trim().min(10, "Enter a valid phone number."),
  whatsappNumber: z.string().trim().min(10, "Enter a valid WhatsApp number."),
  role: z.enum(["customer", "business_owner"]),
  townId: z.string().min(1, "Select a town."),
  province: z.string().min(1, "Select a province."),
  createBusinessLater: z.boolean(),
  referredByCode: z.string().trim().optional()
});

export const searchSchema = z.object({
  keyword: z.string().trim().optional(),
  townSlug: z.string().optional(),
  categorySlug: z.string().optional()
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(10, "Enter a phone number."),
  subject: z.string().trim().min(3, "Enter a subject."),
  message: z.string().trim().min(10, "Tell us a little more.")
});

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.union([z.string().trim().email("Enter a valid email."), z.literal("")]),
  phone: z.string().trim().min(10, "Enter a phone number."),
  subject: z.string().trim().min(3, "Enter a subject."),
  message: z.string().trim().min(10, "Tell us a little more."),
  relatedType: z.enum(["general", "service", "product"]),
  relatedId: z.string()
});

export const bookingSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your name."),
  customerEmail: z.union([z.string().trim().email("Enter a valid email."), z.literal("")]),
  customerPhone: z.string().trim().min(10, "Enter a phone number."),
  requestedDate: z.string().min(1, "Select a date."),
  requestedTime: z.string().min(1, "Select a time."),
  notes: z.string().trim().optional()
});
