import { Glob } from 'bun';
import fs from 'fs';
import { exec } from './utils';

const DIR = import.meta.dir + '/../bench/';
const OUTDIR = DIR + '.out/';

const args = process.argv;
const config = {
  emit: false,
  runtime: 'bun'
}

const getExec = () => {
  switch (config.runtime) {
    case 'bun': return { raw: 'bun run' };
    case 'node': return { raw: 'bun tsx --expose-gc --allow-natives-syntax' };
  }
}

const run = async (path: string) => {
  console.log('Running benchmark:', path);

  if (config.emit) {
    const target = OUTDIR + path.slice(0, path.indexOf('.bench.ts')) + '.' + config.runtime + '.out';

    // Create the file recursively
    await Bun.write(target, '\0');
    await Bun.write(target, '');

    await exec`${getExec()} ${path} > ${Bun.file(target)}`;
  } else
    await exec`${getExec()} ${path}`;
}

{
  let idx = args.indexOf('--node');
  if (idx !== -1) {
    config.runtime = 'node';
    args.splice(idx, 1);
  }

  idx = args.indexOf('--emit');
  if (idx !== -1) {
    // Load output directory
    if (fs.existsSync(OUTDIR))
      fs.rmdirSync(OUTDIR, { recursive: true });
    fs.mkdirSync(OUTDIR);

    config.emit = true;
    args.splice(idx, 1);
  }
}

Bun.$.cwd(DIR);

const exactBench = args[2];

if (exactBench != null)
  await run(`${exactBench}.bench.ts`);
else for (const path of new Glob('**/*.bench.ts').scanSync(DIR))
  await run(path);
