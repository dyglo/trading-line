import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters.").max(30),
  email: z.string().trim().email("A valid email address is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password cannot be longer than 128 characters.")
});

export const loginSchema = z.object({
  emailOrUsername: z.string().trim().min(3, "Provide your email or username."),
  password: z.string().min(1, "Password is required.")
});

const numericField = z
  .preprocess(
    (value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      const parsed = Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    },
    z
      .number()
      .positive("Value must be greater than zero.")
      .max(1_000_000, "Value cannot exceed $1,000,000.")
  )
  .optional();

export const updatePreferencesSchema = z.object({
  startingBalance: numericField,
  currentBalance: numericField,
  baseCurrency: z
    .string()
    .trim()
    .length(3, "Base currency must be a 3-letter ISO code.")
    .optional(),
  autoResetOnStopOut: z.coerce.boolean().optional(),
  notificationsEnabled: z.coerce.boolean().optional()
});

export const onboardingSubmissionSchema = z.object({
  responses: z
    .array(
      z.object({
        questionId: z.string().cuid("Invalid question identifier."),
        optionIds: z.array(z.string().cuid("Invalid option identifier.")).optional(),
        freeText: z.string().trim().optional()
      })
    )
    .min(1, "At least one response is required.")
});

export const updateProfileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(30, "Username cannot exceed 30 characters.")
      .optional(),
    email: z
      .string()
      .trim()
      .email("Provide a valid email address.")
      .optional()
  })
  .refine((data) => data.username || data.email, {
    message: "Provide at least one field to update.",
    path: ["username"]
  });
