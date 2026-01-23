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

// Lawyer Signup Schema (Individual Lawyer)
export const lawyerSignupSchema = z.object({
  // Step 1: Account Information
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
  // Step 2: Address
  province: z
    .number()
    .min(1, "Province is required"),
  district: z
    .number()
    .min(1, "District is required"),
  municipality: z
    .number()
    .min(1, "Municipality is required"),
  ward: z
    .number()
    .min(1, "Ward number is required"),
  // Step 3: Services & Verification (Lawyer specific)
  services: z
    .array(z.string().uuid())
    .min(1, "Please select at least one service"),
  fullName: z
    .string()
    .min(1, "Full name is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required"),
  barId: z
    .string()
    .min(1, "Bar ID is required"),
  gender: z
    .string()
    .min(1, "Gender is required"),
  licensePhoto: z
    .string()
    .min(1, "License photo is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LawyerSignupInput = z.infer<typeof lawyerSignupSchema>;

// Law Firm Signup Schema
export const lawFirmSignupSchema = z.object({
  // Step 1: Account Information
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
  // Step 2: Address
  province: z
    .number()
    .min(1, "Province is required"),
  district: z
    .number()
    .min(1, "District is required"),
  municipality: z
    .number()
    .min(1, "Municipality is required"),
  ward: z
    .number()
    .min(1, "Ward number is required"),
  // Step 3: Services & Verification (Firm specific)
  services: z
    .array(z.string().uuid())
    .min(1, "Please select at least one service"),
  firmName: z
    .string()
    .min(1, "Firm name is required"),
  ownerName: z
    .string()
    .min(1, "Owner/Principal name is required"),
  firmId: z
    .string()
    .min(1, "Firm/Registration ID is required"),
  firmLicense: z
    .string()
    .min(1, "License/Certificate ID is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LawFirmSignupInput = z.infer<typeof lawFirmSignupSchema>

// Old Lawyer Registration Schema (kept for backward compatibility)
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

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z.object({
  new_password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .min(1, "Password is required"),
  confirm_password: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Verify Forgot Password OTP Schema
export const verifyForgotPasswordOtpSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  otp: z
    .string()
    .min(4, "OTP must be at least 4 characters")
    .max(6, "OTP must be at most 6 characters")
    .min(1, "OTP is required"),
});

export type VerifyForgotPasswordOtpInput = z.infer<typeof verifyForgotPasswordOtpSchema>;
