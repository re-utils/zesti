const DIR = import.meta.dir + '/src/'

const exe = process.argv.includes('--node') ? 'bun tsx' : 'bun run';

const commands = Array.from(
  new Bun.Glob('**/*.ts').scanSync(DIR)
).map((path) => `${exe} ${path}`);

Bun.$.cwd(DIR);
await Bun.$`hyperfine --shell=none --warmup=10 ${commands}`;
