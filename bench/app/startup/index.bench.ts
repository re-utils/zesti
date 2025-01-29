const DIR = (import.meta.dir + '/src/').replace(process.cwd(), '.');

const exe = process.argv.includes('with:node') ? 'bun tsx --expose-gc --allow-natives-syntax' : 'bun run';

const commands = Array.from(
  new Bun.Glob('**/*.ts').scanSync(DIR)
).map((path) => `${exe} ${DIR + path}`);

await Bun.$`hyperfine ${commands}`;
