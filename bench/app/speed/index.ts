await Bun.$`${{ raw: process.argv.includes('--node') ? 'bun tsx --expose-gc --allow-natives-syntax' : 'bun run' }} ${import.meta.dir + '/main.ts'}`;
