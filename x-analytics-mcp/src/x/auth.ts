import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { config } from '../config.js';

export const redirectUri = 'http://localhost:8080/callback';
export const scopes = 'tweet.read users.read dm.read offline.access';
let refreshInFlight: Promise<string> | undefined;

export async function requestTokens(params: Record<string, string>) {
  if (!config.clientId) throw new Error('Renseigner X_CLIENT_ID avant de lancer npm run auth.');
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const body = new URLSearchParams(params);
  if (config.clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`;
  } else body.set('client_id', config.clientId);
  let response: Response;
  try {
    response = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST', headers, body, signal: AbortSignal.timeout(30_000), redirect: 'error',
    });
  } catch { throw new Error('Connexion OAuth X impossible ou delai de 30 secondes depasse.'); }
  if (!response.ok) throw new Error(`OAuth X HTTP ${response.status}. Verifier la configuration ou relancer npm run auth.`);
  let data: unknown;
  try { data = await response.json(); } catch { throw new Error('Reponse OAuth X non JSON.'); }
  if (!data || typeof data !== 'object') throw new Error('Reponse OAuth X invalide.');
  const token = data as Record<string, unknown>;
  if (typeof token.access_token !== 'string' || !token.access_token ||
      typeof token.expires_in !== 'number' || !Number.isFinite(token.expires_in) || token.expires_in <= 0 ||
      (token.refresh_token !== undefined && (typeof token.refresh_token !== 'string' || !token.refresh_token)) ||
      typeof token.token_type !== 'string' || token.token_type.toLowerCase() !== 'bearer') {
    throw new Error('Reponse OAuth X incomplete ou invalide.');
  }
  return { accessToken: token.access_token, refreshToken: token.refresh_token as string | undefined,
    expiresAt: Date.now() + token.expires_in * 1000 };
}

export async function saveTokens(tokens: { accessToken: string; refreshToken?: string; expiresAt: number }) {
  const refresh = tokens.refreshToken ?? config.refreshToken;
  const updates: Record<string, string> = { X_ACCESS_TOKEN: tokens.accessToken,
    X_REFRESH_TOKEN: refresh ?? '', X_TOKEN_EXPIRES_AT: String(tokens.expiresAt) };
  let source = '';
  try { source = await readFile(config.envPath, 'utf8'); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw new Error('Lecture du .env impossible.'); }
  const remaining = new Set(Object.keys(updates));
  const lines = source.split(/\r?\n/).map(line => {
    const key = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/)?.[1];
    if (!key || !(key in updates)) return line;
    remaining.delete(key);
    return `${key}=${JSON.stringify(updates[key])}`;
  });
  for (const key of remaining) lines.push(`${key}=${JSON.stringify(updates[key])}`);
  const temporary = `${config.envPath}.${randomBytes(8).toString('hex')}.tmp`;
  try {
    await writeFile(temporary, lines.join('\n') + '\n', { mode: 0o600, flag: 'wx' });
    await rename(temporary, config.envPath);
  } catch { throw new Error('Sauvegarde OAuth impossible. Corriger les droits du .env puis relancer npm run auth.'); }
  finally { await unlink(temporary).catch(() => {}); }
  config.accessToken = tokens.accessToken;
  config.refreshToken = refresh;
  config.expiresAt = tokens.expiresAt;
}

export async function refreshAccessToken(rejectedToken?: string): Promise<string> {
  if (rejectedToken && config.accessToken && rejectedToken !== config.accessToken) return config.accessToken;
  if (refreshInFlight) return refreshInFlight;
  if (!config.refreshToken) throw new Error('Refresh token absent. Lancer npm run auth.');
  refreshInFlight = (async () => {
    const tokens = await requestTokens({ grant_type: 'refresh_token', refresh_token: config.refreshToken! });
    await saveTokens(tokens);
    return tokens.accessToken;
  })();
  try { return await refreshInFlight; } finally { refreshInFlight = undefined; }
}

export async function getAccessToken(): Promise<string> {
  if (!config.accessToken || (config.expiresAt && Date.now() >= config.expiresAt - 60_000)) return refreshAccessToken();
  return config.accessToken;
}
