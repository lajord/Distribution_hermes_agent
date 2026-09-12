import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'dotenv';
import { config } from '../dist/config.js';
import { authorize, createAuthorization } from '../dist/auth.js';
import { getAccessToken, refreshAccessToken, requestTokens } from '../dist/x/auth.js';
import { xRequest } from '../dist/x/client.js';

test('OAuth PKCE, callback validation, persistence, refresh and bounded retry', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'x-mcp-auth-test-'));
  const originalFetch = globalThis.fetch;
  const originalConfig = { ...config };
  const originalLog = console.error;
  try {
    Object.assign(config, { clientId: 'test-client', clientSecret: 'test-secret',
      envPath: join(directory, '.env'), accessToken: undefined, refreshToken: undefined, expiresAt: 0 });
    await writeFile(config.envPath, '# preserved\nOTHER=value\nX_ACCESS_TOKEN=old\n');
    const auth = createAuthorization();
    const url = new URL(auth.url);
    assert.equal(url.searchParams.get('code_challenge'), createHash('sha256').update(auth.verifier).digest('base64url'));
    assert.equal(auth.verifier.length, 43);
    assert.notEqual(createAuthorization().state, auth.state);
    assert.equal(url.searchParams.get('redirect_uri'), 'http://localhost:8080/callback');
    assert.ok(url.searchParams.get('scope').includes('offline.access'));
    let tokenCalls = 0;
    let accessCalls = 0;
    globalThis.fetch = async (input, options) => {
      const endpoint = new URL(input);
      if (endpoint.hostname === 'localhost') return originalFetch(input, options);
      assert.equal(endpoint.origin, 'https://api.x.com');
      if (endpoint.pathname === '/2/oauth2/token') {
        tokenCalls++;
        assert.equal(options.method, 'POST');
        assert.equal(options.headers.Authorization, `Basic ${Buffer.from('test-client:test-secret').toString('base64')}`);
        if (tokenCalls === 1) {
          assert.equal(options.body.get('code'), 'test-code');
          assert.equal(options.body.get('grant_type'), 'authorization_code');
          assert.ok(options.body.get('code_verifier'));
        } else assert.equal(options.body.get('refresh_token'), `refresh-${tokenCalls - 1}`);
        return Response.json({ access_token: `access-${tokenCalls}`, refresh_token: `refresh-${tokenCalls}`, expires_in: 7200, token_type: 'bearer' });
      }
      accessCalls++;
      return accessCalls % 2 ? new Response('', { status: 401 }) : Response.json({ data: { id: '1' } });
    };
    console.error = () => {};
    let callbackResult;
    const flow = authorize(link => {
      callbackResult = (async () => {
        const state = new URL(link).searchParams.get('state');
        const invalid = await fetch('http://localhost:8080/callback?state=wrong&code=test-code');
        assert.equal(invalid.status, 400);
        assert.equal(tokenCalls, 0);
        const valid = await fetch(`http://localhost:8080/callback?state=${state}&code=test-code`);
        assert.equal(valid.status, 200);
        await valid.text();
      })();
    }, 5000);
    await flow;
    await callbackResult;
    const saved = await readFile(config.envPath, 'utf8');
    assert.ok(saved.includes('# preserved'));
    assert.equal(parse(saved).OTHER, 'value');
    assert.equal(parse(saved).X_REFRESH_TOKEN, 'refresh-1');
    config.expiresAt = Date.now() - 1;
    assert.deepEqual(await Promise.all([getAccessToken(), getAccessToken()]), ['access-2', 'access-2']);
    assert.equal(tokenCalls, 2);
    assert.equal(parse(await readFile(config.envPath, 'utf8')).X_REFRESH_TOKEN, 'refresh-2');
    assert.equal((await xRequest('/2/users/me')).data.id, '1');
    assert.equal(accessCalls, 2);
    assert.equal(tokenCalls, 3);
    assert.equal(await refreshAccessToken('access-2'), 'access-3');
    assert.equal(tokenCalls, 3);
    globalThis.fetch = async () => new Response('secret-should-not-leak', { status: 400 });
    await assert.rejects(() => refreshAccessToken(), e => e.message.includes('400') && !e.message.includes('secret-should-not-leak'));
    assert.equal(config.accessToken, 'access-3');
    config.clientSecret = undefined;
    globalThis.fetch = async (_, options) => {
      assert.equal(options.headers.Authorization, undefined);
      assert.equal(options.body.get('client_id'), 'test-client');
      return Response.json({ access_token: 'public', expires_in: 7200, token_type: 'bearer' });
    };
    assert.equal((await requestTokens({ grant_type: 'refresh_token', refresh_token: 'fake' })).accessToken, 'public');
    globalThis.fetch = async () => Response.json({ access_token: 'broken' });
    await assert.rejects(() => requestTokens({}), /incomplete/);
    globalThis.fetch = originalFetch;
    let denial;
    await assert.rejects(() => authorize(link => {
      denial = fetch(`http://localhost:8080/callback?state=${new URL(link).searchParams.get('state')}&error=access_denied`);
    }, 5000), /refusee/);
    await (await denial).text();
    await assert.rejects(() => authorize(() => {}, 30), /expiree/);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalLog;
    Object.assign(config, originalConfig);
    assert.equal(dirname(resolve(directory)), resolve(tmpdir()));
    assert.ok(basename(directory).startsWith('x-mcp-auth-test-'));
    await rm(directory, { recursive: true, force: true });
  }
});
