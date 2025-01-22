import type { run } from 'mitata';

export const defaultConfig: Parameters<typeof run>[0] = {
  format: process.argv[2] as any ?? 'mitata'
};
