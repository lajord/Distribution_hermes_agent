import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { collectPages, datesShape, idSchema, readOnly, toolResult, validateDates, type XUser } from '../x/client.js';
import { getUser } from './account.js';

interface DM {
  id: string; text?: string; sender_id?: string; created_at?: string;
  dm_conversation_id?: string; participant_ids?: string[]; event_type?: string;
}
export function registerDMs(server: McpServer) {
  server.registerTool('get_dms', {
    description: 'Read recent DM messages (X retains up to 30 days), grouped by conversation, with senders resolved to usernames. participant_id is a numeric X user ID. max_results caps matching messages across pages. Participants are observed IDs, not a guaranteed complete membership list.',
    inputSchema: {
      ...datesShape, conversation_id: z.string().regex(/^[0-9-]{1,100}$/).optional(),
      participant_id: idSchema.optional(), direction: z.enum(['all', 'sent', 'received']).default('all'),
      max_results: z.number().int().min(1).max(5000).default(100),
    }, annotations: readOnly,
  }, input => toolResult(async () => {
    validateDates(input);
    const me = await getUser({});
    const path = input.participant_id ? `/2/dm_conversations/with/${input.participant_id}/dm_events`
      : input.conversation_id ? `/2/dm_conversations/${input.conversation_id}/dm_events` : '/2/dm_events';
    const result = await collectPages<DM>(path, {
      event_types: 'MessageCreate', 'dm_event.fields': 'id,text,sender_id,created_at,dm_conversation_id,participant_ids,event_type',
      // Without the expansion X returns numeric sender IDs only; user.fields applies to the expanded users.
      expansions: 'sender_id', 'user.fields': 'id,username,name',
    }, input.max_results, { maxPage: 100, accept: event => {
      if (event.event_type !== 'MessageCreate') return false;
      const date = event.created_at ? Date.parse(event.created_at) : NaN;
      if ((input.start_date || input.end_date) && !Number.isFinite(date)) return false;
      if (input.start_date && date < Date.parse(input.start_date)) return false;
      if (input.end_date && date >= Date.parse(input.end_date)) return false;
      if (input.direction === 'sent' && event.sender_id !== me.id) return false;
      if (input.direction === 'received' && (!event.sender_id || event.sender_id === me.id)) return false;
      // The endpoint is already conversation-scoped here, so only reject a contradicting ID, never a missing one.
      if (input.conversation_id && event.dm_conversation_id && event.dm_conversation_id !== input.conversation_id) return false;
      return true;
    } });
    const users = new Map<string, XUser>(result.users);
    if (!users.has(me.id)) users.set(me.id, me);
    const describe = (id: string) => ({ id, username: users.get(id)?.username ?? null, name: users.get(id)?.name ?? null });
    const groups = new Map<string, { conversation_id: string; participants: Set<string>; messages: Array<{ id: string; text: string | null; created_at: string | null; sender: ReturnType<typeof describe> | null }> }>();
    let unresolved = false;
    for (const event of result.data) {
      const id = event.dm_conversation_id ?? input.conversation_id;
      if (!id) throw new Error('X returned a DM without a conversation ID.');
      const group = groups.get(id) ?? { conversation_id: id, participants: new Set([me.id, ...(input.participant_id ? [input.participant_id] : [])]), messages: [] };
      for (const participant of [...(event.participant_ids ?? []), ...(event.sender_id ? [event.sender_id] : [])]) group.participants.add(participant);
      if (event.sender_id && !users.has(event.sender_id)) unresolved = true;
      group.messages.push({ id: event.id, text: event.text ?? null, created_at: event.created_at ?? null,
        sender: event.sender_id ? describe(event.sender_id) : null });
      groups.set(id, group);
    }
    const warnings = ['X only exposes recent DM history (up to 30 days). Pagination is capped at 50 pages; check meta.truncated.',
      'Participants are observed IDs. Group membership and older conversation context may be incomplete.'];
    if (unresolved) warnings.push('Some senders were not returned by the sender_id expansion; their username and name are null.');
    return { authenticated_user: describe(me.id), meta: result.meta, errors: result.errors, warnings,
      conversations: [...groups.values()].map(group => ({
        conversation_id: group.conversation_id, participants: [...group.participants].map(describe), messages: group.messages })) };
  }));
}
