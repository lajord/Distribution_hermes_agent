import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { contextDir } from './config.js';

// Only simple "*.md" file names, no path separators, no traversal.
const NAME = /^[A-Za-z0-9._-]+\.md$/;

// Resolve a caller-supplied name to an absolute path that provably stays inside
// contextDir. Rejects anything with separators, "..", or that escapes the root.
export function resolveName(name: string): string {
  if (!NAME.test(name) || name.includes('..')) {
    throw new Error('Invalid name. Use a simple "*.md" file name, no path separators.');
  }
  const root = resolve(contextDir);
  const full = resolve(root, name);
  if (full !== root + sep + name) {
    throw new Error('Refused: path escapes the context directory.');
  }
  return full;
}

function firstHeading(text: string): string | null {
  return text.split(/\r?\n/).find(line => line.startsWith('# '))?.slice(2).trim() ?? null;
}

function lastRevised(text: string): string | null {
  return text.match(/Derni[eè]re r[eé]vision\s*:\s*(.+)/i)?.[1]?.trim() ?? null;
}

export async function listContext() {
  let entries: string[];
  try { entries = await readdir(contextDir); }
  catch { return { context_dir: contextDir, documents: [] as unknown[] }; }
  const files = entries.filter(name => NAME.test(name)).sort();
  const documents = [];
  for (const name of files) {
    const text = await readFile(resolve(contextDir, name), 'utf8').catch(() => '');
    documents.push({
      name, title: firstHeading(text), last_revised: lastRevised(text),
      bytes: Buffer.byteLength(text), lines: text ? text.split(/\r?\n/).length : 0,
    });
  }
  return { context_dir: contextDir, documents };
}

export async function getContext(names: string[]) {
  const documents = [];
  for (const name of names) {
    try {
      const full = resolveName(name);
      documents.push({ name, content: await readFile(full, 'utf8') });
    } catch (error) {
      documents.push({ name, error: error instanceof Error ? error.message : 'Read failed.' });
    }
  }
  return { documents };
}

export async function writeContext(name: string, content: string, mode: 'append' | 'overwrite') {
  const full = resolveName(name);
  await mkdir(contextDir, { recursive: true });
  let existing = '';
  try { existing = await readFile(full, 'utf8'); } catch { /* new file */ }
  const created = existing === '';
  let next: string;
  if (mode === 'append') {
    const separator = existing && !existing.endsWith('\n') ? '\n' : '';
    next = existing + separator + content + (content.endsWith('\n') ? '' : '\n');
  } else {
    next = content + (content.endsWith('\n') ? '' : '\n');
  }
  await writeFile(full, next, 'utf8');
  return { name, mode, created, bytes_written: Buffer.byteLength(next) };
}
