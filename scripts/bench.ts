import { Glob } from 'bun';
import fs from 'fs';
import { exec } from './utils';

const DIR = import.meta.dir + '/../bench/';
const OUTDIR = DIR + '.out/';

const args = process.argv;
const exe = { raw: 'bun run' };

let doOutput = false;

const run = async (path: string) => {
  console.log('Running benchmark:', path);

  if (doOutput) {
    const target = OUTDIR + path.slice(0, path.indexOf('.bench.ts')) + '.out';
    await Bun.write(target, '\0');
    await Bun.write(target, '');
    await exec`${exe} ${path} > ${Bun.file(target)}`
  } else
    await exec`${exe} ${path}`;
}

{
  let idx = args.indexOf('--node');
  if (idx !== -1) {
    exe.raw = 'bun tsx --expose-gc --allow-natives-syntax';
    args.splice(idx, 1);
  }

  idx = args.indexOf('--emit');
  if (idx !== -1) {
    // Load output directory
    if (fs.existsSync(OUTDIR))
      fs.rmdirSync(OUTDIR, { recursive: true });
    fs.mkdirSync(OUTDIR);

    doOutput = true;
    args.splice(idx, 1);
  }
}

Bun.$.cwd(DIR);
const exactBench = args[2];

if (exactBench != null)
  await run(`${exactBench}.bench.ts`);
else for (const path of new Glob('**/*.bench.ts').scanSync(DIR))
  await run(path);
