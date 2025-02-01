/// <reference types='bun-types' />
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path/posix';

import { transpileDeclaration } from 'typescript';
import tsconfig from '../tsconfig.json';
import { LIB, ROOT } from './utils';

// Constants
const SOURCEDIR = `${ROOT}/src`;

// Remove old content
if (existsSync(LIB)) rmSync(LIB, { recursive: true });

// Transpile files concurrently
const transpiler = new Bun.Transpiler({
  loader: 'ts',
  target: 'node',

  // Lighter output
  minifyWhitespace: true,
  treeShaking: true
});

for (const path of new Bun.Glob('**/*.ts').scanSync(SOURCEDIR)) {
  const srcPath = `${SOURCEDIR}/${path}`;

  const pathExtStart = path.lastIndexOf('.');
  const outPathNoExt = `${LIB}/${path.substring(0, pathExtStart >>> 0)}`;

  Bun.file(srcPath)
    .text()
    .then((buf) => {
      transpiler.transform(buf)
        .then((res) => {
          if (res.length !== 0)
            Bun.write(`${outPathNoExt}.js`, res.replace(/const /g, 'let '));
        });

      Bun.write(`${outPathNoExt}.d.ts`, transpileDeclaration(buf, tsconfig as any).outputText);
    });
}
