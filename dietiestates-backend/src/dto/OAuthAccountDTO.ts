// src/dto/OAuthAccountDTO.ts
export interface OAuthAccountDTO {
  idOAuth: number;
  idUtente: number;
  provider: "Google" | "Facebook" | "GitHub";
  providerUserId: string;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  dataCollegamento: Date;
}
