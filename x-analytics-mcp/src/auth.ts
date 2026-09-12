import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { config } from './config.js';
import { redirectUri, requestTokens, saveTokens, scopes } from './x/auth.js';

export function createAuthorization() {
  if (!config.clientId) throw new Error('Renseigner X_CLIENT_ID dans le .env.');
  const verifier = randomBytes(32).toString('base64url');
  const state = randomBytes(32).toString('base64url');
  const url = new URL('https://x.com/i/oauth2/authorize');
  url.search = new URLSearchParams({ response_type: 'code', client_id: config.clientId,
    redirect_uri: redirectUri, scope: scopes, state, code_challenge_method: 'S256',
    code_challenge: createHash('sha256').update(verifier).digest('base64url'),
  }).toString();
  return { verifier, state, url: url.toString() };
}

function openBrowser(url: string) {
  const command = process.platform === 'win32' ? 'rundll32.exe' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['url.dll,FileProtocolHandler', url] : [url];
  const child = spawn(command, args, { stdio: 'ignore', detached: true, windowsHide: true });
  child.on('error', () => console.error('Ouverture automatique impossible. Utiliser le lien affiche.'));
  child.unref();
}

export async function authorize(launch: (url: string) => void = openBrowser, timeoutMs = 300_000) {
  const auth = createAuthorization();
  await new Promise<void>((resolve, reject) => {
    let processing = false;
    let finished = false;
    const finish = (error?: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      server.close();
      server.closeIdleConnections();
      process.removeListener('SIGINT', cancel);
      error ? reject(error) : resolve();
    };
    const cancel = () => finish(new Error('Autorisation annulee.'));
    const server = createServer(async (req, res) => {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Referrer-Policy', 'no-referrer');
      let url: URL;
      try { url = new URL(req.url ?? '/', redirectUri); }
      catch { res.writeHead(400).end('Requete invalide.'); return; }
      if (req.method !== 'GET' || url.pathname !== '/callback') { res.writeHead(404).end('Not found'); return; }
      const received = Buffer.from(url.searchParams.get('state') ?? '');
      const expected = Buffer.from(auth.state);
      if (url.searchParams.getAll('state').length !== 1 || received.length !== expected.length || !timingSafeEqual(received, expected)) {
        res.writeHead(400).end('State invalide. Utiliser la demande originale.'); return;
      }
      if (processing || finished) { res.writeHead(409).end('Autorisation deja en cours ou terminee.'); return; }
      if (url.searchParams.has('error')) {
        res.writeHead(400).end('Autorisation refusee. Vous pouvez fermer cet onglet.');
        finish(new Error('Autorisation X refusee. Relancer npm run auth.')); return;
      }
      const code = url.searchParams.get('code');
      if (!code || url.searchParams.getAll('code').length !== 1) { res.writeHead(400).end('Code manquant ou invalide.'); return; }
      processing = true;
      clearTimeout(timer);
      try {
        const tokens = await requestTokens({ grant_type: 'authorization_code', code, redirect_uri: redirectUri, code_verifier: auth.verifier });
        if (finished) { res.end('Autorisation annulee.'); return; }
        if (!tokens.refreshToken) throw new Error('Refresh token absent. Verifier offline.access et recommencer.');
        await saveTokens(tokens);
        res.end('Compte X connecte. Vous pouvez fermer cet onglet.');
        finish();
      } catch (error) {
        res.writeHead(500).end('Connexion impossible. Consultez le terminal puis recommencez.');
        finish(error instanceof Error ? error : new Error('Echec OAuth.'));
      }
    });
    server.requestTimeout = 10_000;
    const timer = setTimeout(() => finish(new Error('Autorisation expiree. Relancer npm run auth.')), timeoutMs);
    process.once('SIGINT', cancel);
    server.once('error', () => finish(new Error('Callback local indisponible. Verifier que localhost:8080 est libre.')));
    server.listen(8080, 'localhost', () => {
      console.error('Autorisez l’application dans votre navigateur. Si necessaire, ouvrez ce lien :\n' + auth.url);
      try { launch(auth.url); } catch { console.error('Utiliser le lien ci-dessus pour ouvrir le navigateur.'); }
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  authorize().then(() => console.error('Tokens enregistres localement. Vous pouvez lancer Hermes (ou redemarrer son MCP).'))
    .catch(error => { console.error(error instanceof Error ? error.message : 'Echec OAuth.'); process.exitCode = 1; });
}
