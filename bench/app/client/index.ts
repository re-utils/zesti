const main = import.meta.dir + '/main.ts';

const content = await Bun.file(main).arrayBuffer();
await Bun.$`bun tsx ${main}`.nothrow();
Bun.write(main, content);
