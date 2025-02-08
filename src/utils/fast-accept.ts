import type { Context } from '../types/route';

/**
 * Create a parser for other types of Accept header
 */
export default <
  T extends string[],
  D extends string | undefined = undefined
>(
  targetHeader: 'Accept-Encoding' | 'Accept-Language' | (string & {}),
  values: T,
  defaultValue?: D
): (c: Context) => T[number] | D => {
  // Check wildcard last
  values.push('*');

  return (c) => {
    const header = c.req.headers.get(targetHeader);
    if (header === null) return defaultValue as any;

    let tmpResult: string | undefined = defaultValue as any;

    parseParts: for (
      let i = 0,
        list = header.split(','),

        parts: string[],
        value: string,
        qualityStr: string,

        // Current max quality
        q = 0;
      i < list.length; i++
    ) {
      parts = list[i].split(';');
      value = parts[0].trim();

      if (values.includes(value)) {
        if (parts.length === 1)
          return value;

        qualityStr = parts[1].trim();
        if (qualityStr.startsWith('q=')) {
          // Match first number
          switch (qualityStr.charCodeAt(2)) {
            // Start with 0
            case 48:
              // Quality is valid
              if (qualityStr.length !== 3 && qualityStr.length < 8) {
                // Quality check
                const quality = value === '*' ? 0.999 * +qualityStr.slice(3) : +qualityStr.slice(3);
                if (quality > q) {
                  q = quality;
                  tmpResult = value;
                  continue parseParts;
                }
              }

              continue parseParts;

            // Start with 1
            case 49:
              return value;

            // Invalid weight
            default:
              continue parseParts;
          }
        }
      }
    }

    return tmpResult;
  };
};
