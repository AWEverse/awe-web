type PartsWithGlobals = (string | false | undefined | string[])[];
type ClassNameBuilder = ((
  elementName: string,
  ...modifiers: PartsWithGlobals
) => string) &
  Record<string, string>;

type PartVarians =
  | string
  | boolean
  | undefined
  | Record<string, boolean>
  | null;

type Parts = PartVarians[];

function validateObject(obj: Record<string, boolean>): string {
  return Object.keys(obj)
    .reduce((acc, key) => (obj[key] ? `${acc} ${key}` : acc), "")
    .trim();
}

function identifyFunction(part: PartVarians): string {
  if (typeof part === "string") {
    return part;
  }

  if (typeof part === "object" && part) {
    return validateObject(part);
  }

  return "";
}

export default function buildClassName(...parts: Parts): string {
  return parts
    .reduce((classNames, part) => {
      const identified = identifyFunction(part);

      if (identified) {
        classNames.push(identified);
      }

      return classNames;
    }, [] as string[])
    .join(" ");
}

export function createClassNameBuilder(componentName: string) {
  return ((elementName: string, ...modifiers: PartsWithGlobals) => {
    const baseName =
      elementName === "&" ? componentName : `${componentName}__${elementName}`;

    return modifiers
      .reduce<string[]>(
        (acc, modifier) => {
          if (modifier) {
            // A bit hacky way to pass global class names
            if (Array.isArray(modifier)) {
              acc.push(...modifier);
            } else {
              acc.push(`${baseName}--${modifier}`);
            }
          }

          return acc;
        },
        [baseName],
      )
      .join(" ");
  }) as ClassNameBuilder;
}
