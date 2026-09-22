import { z } from 'zod';

// Body schemas for the /users routes — parsed by the validate() middleware
// (src/middlewares/validate.ts) before the controllers run. All values arrive
// trimmed and any unknown key is stripped from req.body.

const name = z
  .string()
  .trim()
  .min(1, 'A name is required.')
  .max(100, 'Name must be at most 100 characters long.');

const email = z
  .string()
  .trim()
  .min(1, 'An email is required.')
  .max(255, 'Email must be at most 255 characters long.')
  .email('A valid email is required.');

const role = z
  .string()
  .trim()
  .min(1, 'A role title is required.')
  .max(100, 'Role title must be at most 100 characters long.');

// Minimum password length matches the seed/demo accounts (e.g. "Staff@123").
const password = z
  .string()
  .min(6, 'Password must be at least 6 characters long.')
  .max(100, 'Password must be at most 100 characters long.');

// POST /users — creates an admin/staff account. `role` is optional and
// defaults to "staff"; it is validated against the Role table by the controller.
export const createUserSchema = z.object({
  name,
  email,
  password,
  role: role.optional(),
});

// PUT /users/:id — every field is optional, so the same route serves the edit
// modal and a single-field role assignment from the list row.
export const updateUserSchema = z
  .object({
    name: name.optional(),
    email: email.optional(),
    // Blank means "keep the current password" (the modal sends "" when untouched)
    password: z.union([z.literal(''), password]).optional(),
    role: role.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Provide at least one field to update.',
  });
