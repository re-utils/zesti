import { BENCH, cpToLib, LIB, ROOT } from "./utils";

const targetFile = Bun.file(`${LIB}/README.md`);
const args = process.argv.slice(2);

const writer = targetFile.writer();

writer.write(await Bun.file(`${ROOT}/README.md`).arrayBuffer());

Bun.$.cwd(BENCH);
const BENCH_APP = BENCH + '/app/';

for (let name of new Bun.Glob('*').scanSync({
  onlyFiles: false,
  cwd: BENCH_APP
})) {
  const dir = BENCH_APP + name;
  if (await Bun.file(dir).exists()) continue;

  const info = (await import(dir + '/info.json')).default as {
    name: string,
    description: string,
    details: string[]
  };

  console.log('Running', name);

  writer.write(`\n## ${info.name}\n${info.description}\n\n### Details\n${info.details.map((detail) => `- ${detail}\n`).join('')}\n### Results\n\`\`\`\n`);
  writer.write((await Bun.$`bun run ./app/${name}/index.ts ${args}`).stdout);
  writer.write('```\n');
}
