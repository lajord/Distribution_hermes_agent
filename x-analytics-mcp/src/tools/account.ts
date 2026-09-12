import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { idSchema, usernameSchema, xRequest, readOnly, toolResult } from '../x/client.js';

export interface User {
  id: string; username: string; name: string; description?: string; created_at?: string;
  url?: string; location?: string;
  entities?: { url?: { urls?: Array<{ expanded_url?: string }> } };
  public_metrics?: { followers_count?: number; following_count?: number; tweet_count?: number; post_count?: number; listed_count?: number };
}
export const userFields = 'created_at,description,public_metrics,url,location,entities';
export const accountShape = { username: usernameSchema.optional(), user_id: idSchema.optional() };
export async function getUser(input: { username?: string; user_id?: string }): Promise<User> {
  if (input.username && input.user_id) throw new Error('Provide username OR user_id, not both.');
  const path = input.user_id ? `/2/users/${input.user_id}` : input.username ? `/2/users/by/username/${encodeURIComponent(input.username)}` : '/2/users/me';
  const result = await xRequest<User>(path, { 'user.fields': userFields });
  if (!result.data?.id) throw new Error('X user not found or inaccessible.');
  return result.data;
}
export function profile(user: User) {
  return {
    id: user.id, username: user.username, name: user.name,
    description: user.description ?? null, created_at: user.created_at ?? null,
    followers_count: user.public_metrics?.followers_count ?? null,
    following_count: user.public_metrics?.following_count ?? null,
    tweet_count: user.public_metrics?.tweet_count ?? user.public_metrics?.post_count ?? null,
    listed_count: user.public_metrics?.listed_count ?? null,
    url: `https://x.com/${user.username}`,
    website: user.entities?.url?.urls?.[0]?.expanded_url ?? user.url ?? null,
    location: user.location ?? null,
  };
}
export function registerAccount(server: McpServer) {
  server.registerTool('get_account_stats', {
    description: 'Current X profile and counts only, no historical follower statistics. Omit both identifiers for the authenticated user.',
    inputSchema: accountShape, annotations: readOnly,
  }, input => toolResult(async () => ({ ...profile(await getUser(input)), observed_at: new Date().toISOString() })));
}
