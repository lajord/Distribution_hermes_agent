import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { collectPages, datesShape, readOnly, toolResult, validateDates, xRequest } from '../x/client.js';
import { accountShape, getUser } from './account.js';

interface Post {
  id: string; text: string; created_at?: string; author_id?: string;
  note_tweet?: { text: string }; note_post?: { text: string };
  public_metrics?: Record<string, number>; non_public_metrics?: Record<string, number>;
  entities?: unknown; referenced_tweets?: unknown;
}
export const postsShape = {
  ...accountShape, ...datesShape,
  max_results: z.number().int().min(1).max(3200).default(100).describe('Total posts returned across pages, not page size.'),
  include_replies: z.boolean().default(true),
  include_metrics: z.boolean().default(true),
};
export type PostsInput = z.infer<z.ZodObject<typeof postsShape>>;
export async function getPosts(input: PostsInput) {
  validateDates(input);
  const user = await getUser(input);
  const result = await collectPages<Post>(`/2/users/${user.id}/tweets`, {
    start_time: input.start_date, end_time: input.end_date,
    exclude: input.include_replies ? undefined : 'replies',
    'tweet.fields': 'created_at,author_id,entities,referenced_tweets,note_tweet' + (input.include_metrics ? ',public_metrics' : ''),
  }, input.max_results, { minPage: 5 });
  const warnings: string[] = ['Timeline coverage is limited by X; metrics are cumulative at observed_at, not activity during the requested period.'];
  const privateMetrics = new Map<string, Record<string, number>>();
  if (input.include_metrics && result.data.length) {
    const me = await getUser({}).catch(error => {
      warnings.push(`Private metrics ownership check failed: ${error instanceof Error ? error.message : 'request failed'}`);
      return null;
    });
    if (me?.id === user.id) {
      // Enrich recent owned posts separately so older posts cannot disappear from the timeline.
      const recent = result.data.filter(p => p.author_id === me.id && p.created_at && Date.parse(p.created_at) > Date.now() - 30 * 86400000);
      for (let i = 0; i < recent.length; i += 100) {
        try {
          const extra = await xRequest<Post[]>('/2/tweets', {
            ids: recent.slice(i, i + 100).map(p => p.id).join(','), 'tweet.fields': 'non_public_metrics',
          });
          result.errors.push(...(extra.errors ?? []));
          for (const post of extra.data ?? []) if (post.non_public_metrics) privateMetrics.set(post.id, post.non_public_metrics);
        } catch (error) {
          warnings.push(`Private metrics unavailable: ${error instanceof Error ? error.message : 'request failed'}`);
          break;
        }
      }
    }
    warnings.push('Private metrics are only available for recent posts owned by the authenticated user. Missing metrics are null, never zero.');
  }
  return {
    user_id: user.id, username: user.username, observed_at: new Date().toISOString(),
    posts: result.data.map(post => ({
      id: post.id, text: post.note_tweet?.text ?? post.note_post?.text ?? post.text,
      created_at: post.created_at ?? null, url: `https://x.com/${user.username}/status/${post.id}`,
      public_metrics: input.include_metrics ? post.public_metrics ?? null : null,
      private_metrics: privateMetrics.get(post.id) ?? null,
      entities: post.entities ?? null, referenced_tweets: post.referenced_tweets ?? null,
    })), meta: result.meta, errors: result.errors, warnings,
  };
}
export function registerPosts(server: McpServer) {
  server.registerTool('get_posts', {
    description: 'Read X posts over a date interval, automatically paginated up to max_results. Defaults to authenticated user. Metrics are cumulative snapshots; inspect warnings and meta.truncated.',
    inputSchema: postsShape, annotations: readOnly,
  }, input => toolResult(() => getPosts(input)));
}
