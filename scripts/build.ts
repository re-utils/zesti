/// <reference types='bun-types' />
import { existsSync, rmSync } from 'node:fs';
import { generate } from '@stacksjs/dtsx';

// Constants
const SOURCEDIR = './src';
const OUTDIR = 'lib';

// Remove old content
if (existsSync(OUTDIR)) rmSync(OUTDIR, { recursive: true });

generate({
  root: SOURCEDIR, // default: './src'
  entrypoints: ['**/*'],
  outdir: OUTDIR,
  clean: true,
  verbose: true
});

// Transpile files concurrently
const transpiler = new Bun.Transpiler({
  loader: 'tsx',
  target: 'node',

  // Lighter output
  minifyWhitespace: true,
  treeShaking: true
});

for (const path of new Bun.Glob('**/*.ts').scanSync(SOURCEDIR)) {
  Bun.file(`${SOURCEDIR}/${path}`)
    .arrayBuffer()
    .then(async (buf) => transpiler.transform(buf)
      .then((res) => {
        if (res.length !== 0) {
          const pathExtStart = path.lastIndexOf('.');
          Bun.write(`${OUTDIR}/${`${path.substring(0, pathExtStart === -1 ? path.length : pathExtStart)}.js`}`, res);
        }
      }));
}
