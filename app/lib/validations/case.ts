import { z } from "zod";

// Client schema
export const clientSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  citizenship_number: z.string().min(1, "Citizenship number is required"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
});

// Waris schema
export const warisSchema = z.object({
  full_name: z.string().optional(),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  citizenship_number: z.string().optional(),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }).optional(),
});

// Document schema
export const documentSchema = z.object({
  title: z.string().min(1, "Document title is required"),
  description: z.string().optional(),
  file: z.string().min(1, "File is required"),
  file_type: z.enum(["image", "pdf", "document"]),
  document_scope: z.enum(["internal", "client"]),
});

// Date schema
export const caseDateSchema = z.object({
  date_type: z.literal("tarik"),
  date: z.string().min(1, "Date is required"),
  remark: z.string().optional(),
  assigned_to_name: z.string().optional(),
});

// Case creation schema
export const createCaseSchema = z.object({
  // General Information
  title: z.string().min(1, "Case title is required"),
  case_category: z.string().min(1, "Case category is required"),
  court_type: z.enum(["district", "high", "supreme"], {
    errorMap: () => ({ message: "Please select a court type" }),
  }),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["draft", "registered", "ongoing", "completed"]).default("draft"),
  
  // Client information (required)
  client_details: clientSchema,
  client: z.string().optional(),
  
  // Waris information
  waris: warisSchema.optional(),
  
  // Documents
  documents: z.array(documentSchema).optional(),
  
  // Dates
  dates: z.array(caseDateSchema).optional(),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type WarisInput = z.infer<typeof warisSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
export type CaseDateInput = z.infer<typeof caseDateSchema>;
