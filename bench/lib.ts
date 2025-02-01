import type { run } from 'mitata';

export const defaultConfig: Parameters<typeof run>[0] = {
  format: {
    mitata: {
      name: 0
    }
  },
  colors: false
};
