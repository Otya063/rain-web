import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const r = Math.floor(Math.random() * 4) + 1;

  return {
    r,
  };
};
