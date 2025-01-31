import { minify } from "uglify-js";

const ROOT = import.meta.dir;
const DIR = ROOT + '/src/';
const TMP = ROOT + '/.out/'

const entries = Array.from(new Bun.Glob('**/*.ts').scanSync(DIR))
  .map((file) => DIR + file);

const { outputs } = await Bun.build({
  entrypoints: entries,
  outdir: TMP
});

const results = await Promise.all(
  outputs.map(async (val) => {
    const str = await val.text();
    const minified = minify(str).code;

    const name = val.path.replace(TMP, '');
    return {
      Entry: name.substring(0, name.lastIndexOf('.')),
      Minified: Buffer.from(minified).byteLength,
      "Minified GZIP": Bun.gzipSync(minified).byteLength,
      Size: val.size,
    }
  })
);

results.sort((a, b) => a.Minified - b.Minified);
console.table(results);
