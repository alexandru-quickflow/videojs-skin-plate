// Puts the embed build beside the deployed workbench, at /embed/, so any site can load it with a script tag.
// Module scripts from another origin need CORS, so /embed/* is served with Access-Control-Allow-Origin: *.
//
//     npm run build && npm run build:embed && node apps/preview/stage-embed.mjs
import { cp, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = (path) => fileURLToPath(new URL(`../../${path}`, import.meta.url));

await cp(root('dist-embed'), root('dist/embed'), { recursive: true });
await writeFile(
  root('dist/_headers'),
  ['/embed/*', '  Access-Control-Allow-Origin: *', '  Cache-Control: public, max-age=3600', ''].join('\n')
);
console.log('Staged dist-embed in dist/embed with CORS headers.');
