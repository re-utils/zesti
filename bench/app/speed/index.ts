const SRC = import.meta.dir + '/src/';

let str = 'export default async () => <[name: string, { fetch: (r: any) => any }][]>[\n';
for (const name of new Bun.Glob('*.ts').scanSync(SRC))
  if (name !== 'index.ts')
    str += `  [${JSON.stringify(name.substring(0, name.lastIndexOf('.')))}, (await import(${JSON.stringify(SRC + name)})).serve],\n`;
str += ']';

await Bun.write(SRC + 'index.ts', str);
await Bun.$`${{ raw: process.argv.includes('--node') ? 'bun tsx --expose-gc --allow-natives-syntax' : 'bun run' }} ${import.meta.dir + '/main.ts'}`;
