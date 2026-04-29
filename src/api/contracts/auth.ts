import type { ProfileAccount } from "@/services/auth/types";

export type SessionUserAccount = ProfileAccount;

export interface GetSessionRequest {
  /** Например cookie session id, если backend потребует явно. */
  sessionId?: string;
}

export interface GetSessionResponse {
  authenticated: boolean;
  account: SessionUserAccount | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  /** Токены / session — формат на согласовании с backend. */
  accessToken?: string;
  refreshToken?: string;
  expiresAtIso?: string;
  account: SessionUserAccount;
}

export interface LogoutRequest {
  /** refresh или session id */
  refreshToken?: string;
}

export type LogoutResponse = void;
