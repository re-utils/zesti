import { Glob } from 'bun';
import { exec } from './utils';

Bun.$.cwd(process.cwd() + '/bench');

const exactBench = process.argv[2];
if (exactBench != null) {
  const path = `${exactBench}.bench.ts`;
  console.log('Running benchmark:', path);
  await exec`bun tsx --expose-gc --allow-natives-syntax ${path}`;
} else for (const path of new Glob('**/*.bench.ts').scanSync('./bench')) {
  console.log('Running benchmark:', path);
  await exec`bun tsx --expose-gc --allow-natives-syntax ${path}`;
}
