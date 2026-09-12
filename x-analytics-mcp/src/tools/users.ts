import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { datesShape, readOnly, toolResult, usernameSchema, validateDates, xRequest } from '../x/client.js';
import { getUser, profile, userFields, type User } from './account.js';
import { getPosts } from './posts.js';

export function registerUsers(server: McpServer) {
  server.registerTool('search_users', {
    description: 'Search X profiles by keywords; returns raw profiles without scoring. Pass next_cursor back as cursor for another page.',
    inputSchema: {
      query: z.string().regex(/^[A-Za-z0-9_' ]{1,50}$/),
      max_results: z.number().int().min(1).max(1000).default(30),
      cursor: z.string().min(1).optional(),
    }, annotations: readOnly,
  }, input => toolResult(async () => {
    const result = await xRequest<User[]>('/2/users/search', {
      query: input.query, max_results: input.max_results, next_token: input.cursor, 'user.fields': userFields,
    });
    return { users: (result.data ?? []).map(profile), next_cursor: result.meta?.next_token ?? null, errors: result.errors ?? [] };
  }));
  server.registerTool('get_user_context', {
    description: 'Read a profile and its recent posts for deeper analysis by Hermes. No scoring or business logic.',
    inputSchema: { username: usernameSchema, posts_limit: z.number().int().min(1).max(3200).default(20), ...datesShape },
    annotations: readOnly,
  }, input => toolResult(async () => {
    validateDates(input);
    const user = await getUser({ username: input.username });
    const posts = await getPosts({ user_id: user.id, start_date: input.start_date, end_date: input.end_date,
      max_results: input.posts_limit, include_replies: true, include_metrics: true });
    return { profile: profile(user), recent_posts: posts.posts, observed_at: posts.observed_at, meta: posts.meta, errors: posts.errors, warnings: posts.warnings };
  }));
}
