/**
 * Only validate objects. Check whether target extends source
 */
const f = (target: {}, source: {}): boolean => {
  if (target === source) return true;
  if (typeof target !== typeof source) return false;

  for (const key in source) {
    // @ts-expect-error Key should exists
    if (!f(target[key], source[key]))
      return false;
  }

  return true;
};

export default f;
