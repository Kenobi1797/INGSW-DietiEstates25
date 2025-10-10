import { z } from "zod";

export const OAuthAccountSchema = z.object({
  idOAuth: z.number().int().optional(),
  idUtente: z.number().int(),
  provider: z.enum(["Google", "Facebook", "GitHub"]),
  providerUserId: z.string().min(1),
  email: z.string().email().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  dataCollegamento: z.date().optional(),
});

export type OAuthAccountDTO = z.infer<typeof OAuthAccountSchema>;
