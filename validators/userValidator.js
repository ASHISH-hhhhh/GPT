import { z } from "zod";
export const userSignUpValidator = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase()),
  age: z.number().min(12),
  name: z.string().trim().min(2).max(30),
  password: z
    .string()
    .min(8)
    .max(30)
    .regex(/[A-Z]/, "Password must contain atleast 1 Capital letter")
    .regex(/[a-z]/, "Password must contain atleast one small case letter")
    .regex(/[0-9]/, "Password must contain atleast one number")
    .regex(/[~@$!%*?&]/, "Password must contain atleast one special character"),
});

export const userLogInValidator = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(2)
    .max(30)
    .regex(/[A-Z]/, "Password must contain atleast 1 Capital case letter")
    .regex(/[a-z]/, "Password must contain atleast 1 Small case letter")
    .regex(/[0-9]/, "Password must contain atleast 1 Number type")
    .regex(/[~@$!%*?&]/, "Password must contain atleast 1 speical character"),
});
