import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getContext, listContext, writeContext } from './store.js';

const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const writeHints = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false };

async function toolResult(action: () => Promise<unknown>) {
  try {
    return { content: [{ type: 'text' as const, text: JSON.stringify(await action()) }] };
  } catch (error) {
    return { isError: true, content: [{ type: 'text' as const, text: error instanceof Error ? error.message : 'Unexpected tool error.' }] };
  }
}

const server = new McpServer({ name: 'context-mcp', version: '0.1.0' });

server.registerTool('list_context', {
  description: 'List the business context documents available in context/ with their title, last revision date and size. Call this first to discover what exists before loading anything.',
  inputSchema: {}, annotations: readOnly,
}, () => toolResult(() => listContext()));

server.registerTool('get_context', {
  description: 'Read the markdown content of one or more context documents by file name (e.g. ["directive.md","icp.md"]). Load only what the task needs.',
  inputSchema: { names: z.array(z.string()).min(1).describe('Context file names to read, e.g. ["directive.md","funnel-kpis.md"].') },
  annotations: readOnly,
}, ({ names }) => toolResult(() => getContext(names)));

server.registerTool('write_context', {
  description: 'Write to any context markdown file. Choose the target file and the mode: "append" (default, safe) adds to the end; "overwrite" replaces the whole file. Creates the file if it does not exist. Follow the update rules in directive.md (keep history, bump the revision date, rely on real signals).',
  inputSchema: {
    name: z.string().describe('Target markdown file inside context/, e.g. "hypotheses.md". Simple *.md name, no path.'),
    content: z.string().describe('Markdown content to write.'),
    mode: z.enum(['append', 'overwrite']).default('append').describe('append = add to the end (safe); overwrite = replace the file.'),
  }, annotations: writeHints,
}, ({ name, content, mode }) => toolResult(() => writeContext(name, content, mode)));

await server.connect(new StdioServerTransport());
