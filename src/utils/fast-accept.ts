import type { Context } from '../types/route';

export type Accept = string | [string, Record<string, string>];

// 0: Ignore
// 1: Return immediately
// Otherwise: Continue parsing
const parseQualityPart = (requiredQuality: number, part: string, priority: number): number => {
  // Match first number
  switch (part.charCodeAt(2)) {
    // Start with 0
    case 48: {
      // Quality is 0
      if (part.length !== 3) {
        // Quality check
        const quality = +part.slice(3) * priority;
        if (quality > requiredQuality)
          return quality;
      }

      return 0;
    }

    // Start with 1
    case 49:
      return 1;

    // Invalid weight
    default:
      return 0;
  }
};

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
          q = parseQualityPart(q, qualityStr, value === '*' ? 0.999 : 1);

          switch (q) {
            // Does not satisfy quality constraint
            case 0:
              continue parseParts;

            // Always valid
            case 1:
              return value;

            // Need to check other values
            default:
              // Save this result
              tmpResult = value;
              continue parseParts;
          }
        }
      }
    }

    return tmpResult;
  };
};
