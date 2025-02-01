import { minify } from 'uglify-js';
import { LIB } from './utils';

const sizes: {
  entry: string,
  size: number,
  minified: number,
  minifiedGzip: number,
}[] = [];

const toByte = (num: number) =>
  num >= 1e3
    ? (num / 1e3).toFixed(2) + 'KB'
    : num + 'B';

for await (const path of new Bun.Glob('**/*.js').scan(LIB)) {
  const file = Bun.file(LIB + path);

  const stat = await file.stat();
  if (!stat.isFile()) continue;

  const code = await file.text();
  const minfiedCode = minify(code).code;

  sizes.push({
    entry: path,
    size: file.size,
    minified: Buffer.from(minfiedCode).byteLength,
    minifiedGzip: Bun.gzipSync(minfiedCode).byteLength
  });
}

sizes.sort((a, b) => a.size - b.size);

// Count total
sizes.push(sizes.reduce((a, b) => ({
  entry: 'Total',
  size: a.size + b.size,
  minified: a.minified + b.minified,
  minifiedGzip: a.minifiedGzip + b.minifiedGzip
})));

// Convert to table columns
console.table(sizes.map((val) => ({
  Entry: val.entry,
  Size: toByte(val.size),
  Minify: toByte(val.minified),
  "Minify GZIP": toByte(val.minifiedGzip)
})));
