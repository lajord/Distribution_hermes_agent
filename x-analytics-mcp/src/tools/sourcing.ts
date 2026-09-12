import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { collectPages, datesShape, idSchema, readOnly, toolResult, validateDates, type XUser } from '../x/client.js';
import { accountShape, getUser, profile, userFields, type User } from './account.js';

interface Tweet {
  id: string; text: string; created_at?: string; author_id?: string;
  public_metrics?: Record<string, number>; note_tweet?: { text: string };
}

// Expansion users carry the requested user.fields at runtime; profile() needs them.
const asProfile = (user: XUser) => profile(user as unknown as User);

export function registerSourcing(server: McpServer) {
  server.registerTool('search_tweets', {
    description: 'Search recent X posts (last ~7 days) by content to discover people expressing relevant topics or pain points. Returns matching tweets and the deduplicated list of their authors (sourcing candidates). Supports recent-search operators in the query. Qualify candidates with get_user_context before scoring.',
    inputSchema: {
      query: z.string().min(1).max(512).describe('Recent-search query: keywords + operators, e.g. "(onboarding OR churn) email saas -is:retweet lang:en". Max 512 chars.'),
      max_results: z.number().int().min(1).max(1000).default(50).describe('Total tweets across pages, not page size.'),
      ...datesShape,
      exclude_retweets: z.boolean().default(true),
      lang: z.string().regex(/^[a-z]{2}$/).optional().describe('Two-letter language filter, e.g. "en".'),
    }, annotations: readOnly,
  }, input => toolResult(async () => {
    validateDates(input);
    let query = input.query.trim();
    if (input.exclude_retweets && !/-is:retweet/.test(query)) query += ' -is:retweet';
    if (input.lang && !/\blang:/.test(query)) query += ` lang:${input.lang}`;
    const result = await collectPages<Tweet>('/2/tweets/search/recent', {
      query, start_time: input.start_date, end_time: input.end_date,
      'tweet.fields': 'created_at,author_id,public_metrics,note_tweet',
      expansions: 'author_id', 'user.fields': userFields,
    }, input.max_results, { minPage: 10, maxPage: 100, tokenParam: 'next_token' });
    const handle = (id?: string) => (id ? result.users.get(id)?.username : undefined);
    return {
      query, observed_at: new Date().toISOString(),
      tweets: result.data.map(tweet => ({
        id: tweet.id, text: tweet.note_tweet?.text ?? tweet.text, created_at: tweet.created_at ?? null,
        author_id: tweet.author_id ?? null, author_username: handle(tweet.author_id) ?? null,
        url: `https://x.com/${handle(tweet.author_id) ?? 'i'}/status/${tweet.id}`,
        public_metrics: tweet.public_metrics ?? null,
      })),
      candidates: [...result.users.values()].map(asProfile),
      meta: result.meta, errors: result.errors,
      warnings: [
        'Recent search only covers roughly the last 7 days.',
        'Candidates are the authors of matching tweets; qualify each with get_user_context before scoring, and check prospects.md to skip already-sourced accounts.',
      ],
    };
  }));

  server.registerTool('get_followers', {
    description: 'List the followers of an X account (e.g. a competitor) as sourcing candidates. Provide username OR user_id. Paginated up to max_results.',
    inputSchema: { ...accountShape, max_results: z.number().int().min(1).max(1000).default(100).describe('Total followers returned across pages.') },
    annotations: readOnly,
  }, input => toolResult(async () => {
    const user = await getUser(input);
    const result = await collectPages<User>(`/2/users/${user.id}/followers`, { 'user.fields': userFields }, input.max_results, { maxPage: 1000 });
    return {
      of: { id: user.id, username: user.username }, observed_at: new Date().toISOString(),
      followers: result.data.map(profile), meta: result.meta, errors: result.errors,
      warnings: ['Followers are limited by X access and rate limits; check meta.truncated. Qualify with get_user_context and skip accounts already in prospects.md.'],
    };
  }));

  server.registerTool('get_tweet_engagers', {
    description: 'List users who liked and/or reposted a given tweet, as sourcing candidates showing demonstrated interest. Repliers are not included (use search_tweets with a conversation_id: operator for those).',
    inputSchema: {
      tweet_id: idSchema,
      type: z.enum(['likers', 'reposters', 'all']).default('all'),
      max_results: z.number().int().min(1).max(1000).default(100).describe('Total users per engagement type across pages.'),
    }, annotations: readOnly,
  }, input => toolResult(async () => {
    const fetchEngagers = (kind: 'liking_users' | 'retweeted_by') =>
      collectPages<User>(`/2/tweets/${input.tweet_id}/${kind}`, { 'user.fields': userFields }, input.max_results, { maxPage: 100 });
    const likers = input.type === 'reposters' ? null : await fetchEngagers('liking_users');
    const reposters = input.type === 'likers' ? null : await fetchEngagers('retweeted_by');
    const merged = new Map<string, User>();
    for (const user of likers?.data ?? []) merged.set(user.id, user);
    for (const user of reposters?.data ?? []) merged.set(user.id, user);
    return {
      tweet_id: input.tweet_id, observed_at: new Date().toISOString(),
      engagers: [...merged.values()].map(profile),
      meta: { likers: likers?.meta ?? null, reposters: reposters?.meta ?? null, unique: merged.size },
      errors: [...(likers?.errors ?? []), ...(reposters?.errors ?? [])],
      warnings: ['Engagement lists are limited by X access and privacy; check meta.truncated. Repliers are not included.'],
    };
  }));
}
