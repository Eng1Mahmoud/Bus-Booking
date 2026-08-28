import { z } from "zod";
import { emailSchema, passwordSchema } from "./authSchemas.js";

export const updateProfileSchema = z.object({
  FName: z.string().trim().min(1).max(60),
  LName: z.string().trim().min(1).max(60),
  email: emailSchema,
});

export const changePasswordSchema = z.object({
  password: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

/**
 * Avatars are stored as base64 data URLs on the user document.
 *
 * The cap is the fix for a 50 MB body limit paired with an unchecked write:
 * ~1.4 MB of base64 is roughly a 1 MB image, which is ample for an avatar and
 * keeps the document well inside MongoDB's 16 MB ceiling.
 *
 * TODO(Phase 3): move avatars to object storage and keep only a URL here.
 */
export const uploadAvatarSchema = z.object({
  image: z
    .string()
    .regex(
      /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/]+=*$/,
      "Image must be a base64-encoded PNG, JPEG, WebP or GIF data URL",
    )
    .max(1_400_000, "Image must be smaller than 1MB"),
});

export const emailParamSchema = z.object({
  email: emailSchema,
});

/**
 * Pagination for the admin user list. Unbounded `User.find()` returned the
 * whole collection in one response; `limit` is capped so a caller cannot ask
 * for all of it in a single page.
 */
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>;
