import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerPosts } from './tools/posts.js';
import { registerAccount } from './tools/account.js';
import { registerDMs } from './tools/dms.js';
import { registerUsers } from './tools/users.js';

const server = new McpServer({ name: 'x-analytics-mcp', version: '0.1.0' });
registerPosts(server);
registerAccount(server);
registerDMs(server);
registerUsers(server);
await server.connect(new StdioServerTransport());
