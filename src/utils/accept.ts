import type { Context } from '../types/route';

export type Accept = string | [string, Record<string, string>];

// 0: Ignore
// 1: Return immediately
// Otherwise: Continue parsing
const parseQualityPart = (requiredQuality: number, part: string): number => {
  // Match first number
  switch (part.charCodeAt(2)) {
    // Start with 0
    case 48: {
      // Quality is 0
      if (part.length !== 3) {
        // Quality check
        const quality = +part.slice(3);
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

const REJECT = [0, ['', null]] as const;

// An Accept header parser for a value
const createParser = (value: Accept) => {
  if (typeof value === 'string') {
    const returnVal = [value, null] as const;

    return (requiredQuality: number, parts: string[]) => {
      if (parts.length > 1) {
        for (let i = 0, tmp; i < parts.length; i++) {
          tmp = parts[i].trim();
          // Select depend on the quality
          if (tmp.startsWith('q='))
            return [parseQualityPart(requiredQuality, tmp), returnVal] as const;
        }
      }

      // Select for sure
      return [1, returnVal] as const;
    };
  }

  // Handle string and quoted string
  const kvMap = new Map<string, [string, string]>();
  for (const key in value[1]) kvMap.set(key, [value[1][key], JSON.stringify(value[1][key])]);

  return (requiredQuality: number, parts: string[]) => {
    if (parts.length < 2) return REJECT;

    let q = 1;
    let valid = kvMap.size;

    for (let i = 0, partKV: string[], expectedValue: [string, string] | undefined, tmp; i < parts.length; i++) {
      tmp = parts[i].trim();

      // Select depend on the quality
      if (tmp.startsWith('q='))
        q = parseQualityPart(requiredQuality, tmp);
      else {
        partKV = tmp.split('=');
        if (partKV.length !== 2) continue;

        // Not in the required keys
        expectedValue = kvMap.get(partKV[0]);
        if (typeof expectedValue === 'undefined') continue;

        // Check part value with string and quoted string
        if (partKV[1] !== expectedValue[0] && partKV[1] !== expectedValue[1])
          return REJECT;
        --valid;
      }
    }

    // Part must have all properies
    return valid === 0 ? [q, value] as const : REJECT;
  };
};

type Result = ReturnType<ReturnType<typeof createParser>>;

type InferAccept<T extends Accept> = T extends string ? [T, null] : T;
type InferAccepts<T extends Accept[]> = T extends [infer A extends Accept, ...infer Rest extends Accept[]]
  ? InferAccept<A> | InferAccepts<Rest>
  : never;

/**
 * Create a parser for the Accept header
 */
export const acceptContent = <
  T extends Accept[],
  D extends Accept | undefined = undefined
>(
  accepts: T,
  defaultAccept?: D
): (c: Context) => InferAccepts<T> | (
  D extends undefined
    ? undefined
    : InferAccept<D & {}>
) => {
  const parsers = accepts.map(createParser);
  const acceptValues = accepts.map((value) => typeof value === 'string' ? value : value[0]);

  if (defaultAccept != null && typeof defaultAccept === 'string')
    defaultAccept = [defaultAccept, null] as any;

  return (c) => {
    const header = c.req.headers.get('Accept');
    if (header === null) return defaultAccept as any;

    // Save previous results for quality check
    let tmpResult: Result[1] | undefined = defaultAccept as any;

    parseParts: for (
      let i = 0,
        list = header.split(','),

        values: string[],
        tmpStr: string,
        result: Result,
        selectedIndex: number,

        // Current max quality
        q = 0;
      i < list.length; i++
    ) {
      values = list[i].split(';');
      tmpStr = values[0].trim();

      // Start pattern matching when no exact match is found
      selectedIndex = acceptValues.indexOf(tmpStr);
      if (selectedIndex === -1) {
        if (tmpStr.endsWith('/*')) {
          const isNotWildcard = tmpStr !== '*/*';

          // Now this is the prefix
          if (isNotWildcard)
            tmpStr = tmpStr.substring(0, tmpStr.length - 2);

          matchItems: for (let j = 0; j < accepts.length; j++) {
            // Does not match pattern
            if (isNotWildcard && (!acceptValues[j].startsWith(tmpStr) || accepts[j].length === tmpStr.length))
              continue;

            // Check index j
            result = parsers[j](q, values);

            switch (result[0]) {
              // Does not satisfy quality constraint
              // Or props can be invalid so continue matching items
              case 0:
                continue matchItems;

              // Always valid
              case 1:
                return result[1];

              // Need to check other values
              default:
                // Save this result
                q = result[0];
                tmpResult = result[1];

                continue parseParts;
            }
          }
        }
      }

      // Match exact
      result = parsers[selectedIndex](q, values);

      switch (result[0]) {
        // Does not satisfy quality constraint
        case 0:
          continue parseParts;

        // Always valid
        case 1:
          return result[1];

        // Need to check other values
        default:
          // Save this result
          q = result[0];
          tmpResult = result[1];

          continue parseParts;
      }
    }

    // If a value get selected way later
    return tmpResult;
  };
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
          q = parseQualityPart(q, qualityStr);

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
