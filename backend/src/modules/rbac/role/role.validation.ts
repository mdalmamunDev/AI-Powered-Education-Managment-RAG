import { z } from 'zod';

// Body schema for POST /roles — parsed by the validate() middleware
// (src/middlewares/validate.ts) before the controller runs.
export const createRoleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'A role title is required.')
    .max(100, 'Title must be at most 100 characters long.'),
});
