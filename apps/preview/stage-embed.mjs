// Puts the embed build beside the deployed workbench, at /embed/, so any site can load it with a script tag.
// Module scripts from another origin need CORS, so /embed/* is served with Access-Control-Allow-Origin: *.
//
//     npm run build && npm run build:embed && node apps/preview/stage-embed.mjs
import { copyFile, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = (path) => fileURLToPath(new URL(`../../${path}`, import.meta.url));

await cp(root('dist-embed'), root('dist/embed'), { recursive: true });

// Plate's own faces, served from here, so a site that pastes the guide's code sends no visitor to Google Fonts.
// The same files skin.ts uses, as @fontsource ships them; only their folder changes.
const FACES = ['newsreader/300', 'newsreader/400', 'newsreader/300-italic', 'newsreader/400-italic', 'jetbrains-mono/400', 'jetbrains-mono/500'];
await mkdir(root('dist/embed/fonts'), { recursive: true });
let fontsCss = '';
for (const face of FACES) {
  const [family] = face.split('/');
  const css = await readFile(root(`node_modules/@fontsource/${face}.css`), 'utf8');
  for (const [, file] of css.matchAll(/url\(\.\/files\/([^)]+)\)/g)) {
    await copyFile(root(`node_modules/@fontsource/${family}/files/${file}`), root(`dist/embed/fonts/${file}`));
  }
  fontsCss += css.replaceAll('./files/', './fonts/') + '\n';
}
await writeFile(root('dist/embed/plate-fonts.css'), fontsCss);
await writeFile(
  root('dist/_headers'),
  ['/embed/*', '  Access-Control-Allow-Origin: *', '  Cache-Control: public, max-age=3600', ''].join('\n')
);
// Without a 404 page, Pages answers any missing path with the workbench (200, text/html), which turns a
// missing chunk into a confusing MIME error. A real 404 says what happened.
await writeFile(root('dist/404.html'), '<!doctype html><meta charset="utf-8"><title>Not found</title><p>Not found.</p>\n');
console.log('Staged dist-embed in dist/embed with CORS headers and a 404 page.');
