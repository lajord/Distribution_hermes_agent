import { parse, populate } from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Resolve relative to this module, never the host application's working directory.
for (const relative of ['../.env', '../../.env']) {
  const path = fileURLToPath(new URL(relative, import.meta.url));
  if (existsSync(path)) {
    const values = Object.fromEntries(Object.entries(parse(readFileSync(path))).filter(([, value]) => value.trim()));
    populate(process.env, values, { override: false });
  }
}

export const config = {
  envPath: fileURLToPath(new URL('../.env', import.meta.url)),
  expiresAt: Number(process.env.X_TOKEN_EXPIRES_AT) || 0,
  accessToken: process.env.X_ACCESS_TOKEN?.trim(),
  clientId: process.env.X_CLIENT_ID || process.env.ID_CLIENT_OAUTH,
  clientSecret: process.env.X_CLIENT_SECRET || process.env.SECRET_CLIENT_OAUTH,
  refreshToken: process.env.X_REFRESH_TOKEN,
};
