import type { components } from "./schema";

export type AdminOut = components["schemas"]["AdminOut"] & {
  id: number;
  tg_id: number;
  username: string | null;
  full_name: string | null;
  role: "owner" | "admin" | "support" | "viewer" | string;
  is_active: boolean;
  last_login_at: string | null;
};

export type TokenPairOut = components["schemas"]["TokenPairOut"] & {
  access_token: string;
  access_expires_at: string;
  refresh_token: string;
  admin: AdminOut;
};

export type MeOut = components["schemas"]["MeOut"] & {
  admin: AdminOut;
  permissions: string[];
};

export type TelegramLoginRequest = components["schemas"]["TelegramLoginRequest"];
export type RefreshRequest = components["schemas"]["RefreshRequest"];
export type ValidationError = components["schemas"]["ValidationError"];
