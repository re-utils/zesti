import { cpToLib, exec } from './utils';

// Write required files
await cpToLib('package.json');

await exec`cd lib && bun publish --access=public`;
