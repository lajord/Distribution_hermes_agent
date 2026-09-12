import { z } from 'zod';
import { getAccessToken, refreshAccessToken } from './auth.js';

export type Params = Record<string, string | number | boolean | undefined>;
export interface XUser { id: string; username?: string; name?: string }
export interface XResponse<T> {
  data?: T;
  includes?: { users?: XUser[] };
  errors?: Array<{ title?: string; detail?: string; type?: string; resource_id?: string }>;
  meta?: { next_token?: string; result_count?: number };
}
export class XHttpError extends Error {
  constructor(public status: number, public reset: string | null) {
    super(`X API HTTP ${status}. ${status === 401 ? 'User token invalid or expired; replace X_ACCESS_TOKEN.' : status === 403 ? 'Check user scopes, ownership and API access.' : status === 429 ? 'Rate limit reached; retry after reset.' : 'Request failed.'}${reset ? ` Rate-limit reset: ${reset}.` : ''}`);
  }
}

export async function xRequest<T>(path: string, params: Params = {}): Promise<XResponse<T>> {
  if (!path.startsWith('/2/') || path.includes('..') || path.includes('?') || path.includes('#')) {
    throw new Error('Invalid X API path.');
  }
  const url = new URL(path, 'https://api.x.com');
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  const token = await getAccessToken();
  const send = async (accessToken: string) => {
    try {
      return await fetch(url, {
        method: 'GET', headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(30_000), redirect: 'error',
      });
    } catch { throw new Error('X API network error or 30-second timeout.'); }
  };
  let response = await send(token);
  if (response.status === 401) {
    await response.body?.cancel();
    response = await send(await refreshAccessToken(token));
  }
  if (!response.ok) throw new XHttpError(response.status, response.headers.get('x-rate-limit-reset'));
  let body: XResponse<T>;
  try { body = await response.json() as XResponse<T>; }
  catch { throw new Error('X API returned invalid JSON.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Unexpected X API response.');
  if (body.errors?.length && body.data === undefined) throw new Error('X API returned errors without data. Check access, identifiers and requested fields.');
  return body;
}

// Keep page mechanics here; tools supply endpoint parameters and optional filters.
export async function collectPages<T extends { id: string }>(
  path: string, params: Params, limit: number,
  options: { minPage?: number; maxPage?: number; accept?: (item: T) => boolean; tokenParam?: string } = {},
) {
  const tokenParam = options.tokenParam ?? 'pagination_token';
  const data: T[] = [];
  const errors: NonNullable<XResponse<T>['errors']> = [];
  const users = new Map<string, XUser>();
  const seen = new Set<string>();
  const tokens = new Set<string>();
  let next: string | undefined;
  let truncated = false;
  let pages = 0;
  do {
    const result = await xRequest<T[]>(path, {
      ...params, max_results: Math.max(options.minPage ?? 1, Math.min(options.maxPage ?? 100, limit - data.length)),
      [tokenParam]: next,
    });
    pages++;
    errors.push(...(result.errors ?? []));
    // Expansion users are page-scoped: collect before filtering, or a later page loses earlier senders.
    for (const user of result.includes?.users ?? []) users.set(user.id, user);
    for (const item of result.data ?? []) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      if (options.accept && !options.accept(item)) continue;
      if (data.length < limit) data.push(item);
      else truncated = true;
    }
    next = result.meta?.next_token;
    if (next && tokens.has(next)) throw new Error('X API repeated a pagination token.');
    if (next) tokens.add(next);
  } while (next && data.length < limit && pages < 50);
  return { data, errors, users, meta: { count: data.length, pages, truncated: truncated || Boolean(next), next_token: next ?? null } };
}

export const usernameSchema = z.string().regex(/^@?[A-Za-z0-9_]{1,15}$/).transform(v => v.replace(/^@/, ''));
export const idSchema = z.string().regex(/^\d{1,19}$/);
export const datesShape = {
  start_date: z.string().datetime({ offset: true }).optional().describe('Inclusive ISO 8601 timestamp with timezone.'),
  end_date: z.string().datetime({ offset: true }).optional().describe('Exclusive ISO 8601 timestamp with timezone.'),
};
export function validateDates(input: { start_date?: string; end_date?: string }) {
  if (input.start_date && input.end_date && Date.parse(input.start_date) >= Date.parse(input.end_date)) {
    throw new Error('start_date must be earlier than end_date.');
  }
}
export const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };
export async function toolResult(action: () => Promise<unknown>) {
  try {
    const result = await action();
    return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
  } catch (error) {
    return { isError: true, content: [{ type: 'text' as const, text: error instanceof Error ? error.message : 'Unexpected tool error.' }] };
  }
}
