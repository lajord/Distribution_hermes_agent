import { fileURLToPath } from 'node:url';

// The context directory is the `context/` folder inside this package.
// Resolve relative to this module so the launch working directory never matters.
// Override with CONTEXT_DIR if the folder ever moves.
export const contextDir = process.env.CONTEXT_DIR?.trim()
  || fileURLToPath(new URL('../context/', import.meta.url));
