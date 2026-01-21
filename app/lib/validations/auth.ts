import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// User Registration Schema
export const userRegisterSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .min(1, "Password is required"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;

// Lawyer Registration Schema
export const lawyerRegisterSchema = z.object({
  // Step 1: General Information
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(3, "Full name must be at least 3 characters"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d{10}$/, "Phone number must be 10 digits"),
  gender: z
    .enum(["male", "female", "other"], {
      errorMap: () => ({ message: "Please select a gender" }),
    }),
  // Step 2: Official Documents
  documentType: z
    .string()
    .min(1, "Document type is required"),
  citizenshipNumber: z
    .string()
    .min(1, "Citizenship number is required")
    .regex(/^[A-Z0-9]+$/, "Citizenship number must be alphanumeric"),
  citizenshipPhotoFront: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Front citizenship photo is required")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
      "Front photo must be JPEG or PNG"
    ),
  citizenshipPhotoBack: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Back citizenship photo is required")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
      "Back photo must be JPEG or PNG"
    ),
});

export type LawyerRegisterInput = z.infer<typeof lawyerRegisterSchema>;
