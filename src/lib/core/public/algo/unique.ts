// Define the projection function type
type ProjectionType<T> = (item: T) => any;

// Define the binary predicate function type
type BinaryPredicate<T> = (a: T, b: T) => boolean;

/**
 * The Unique function removes consecutive duplicates from the array, using an optional projection and binary predicate.
 * It returns the new logical size of the array (number of unique elements).
 */
function unique<T>(array: T[]): number;
function unique<T>(array: T[], predicate: BinaryPredicate<T>): number;
function unique<T, P>(
  array: T[],
  projection: ProjectionType<T>,
  predicate: BinaryPredicate<T>,
): number;
function unique<T>(
  array: T[],
  projectionOrPredicate?: ProjectionType<T> | BinaryPredicate<T>,
  predicate?: BinaryPredicate<T>,
): number {
  if (array.length <= 1) {
    return array.length;
  }

  let projection: ProjectionType<T> = (item: T) => item;
  if (typeof projectionOrPredicate === 'function') {
    if (predicate) {
      projection = projectionOrPredicate as ProjectionType<T>;
      predicate = predicate;
    } else {
      predicate = projectionOrPredicate as BinaryPredicate<T>;
    }
  } else {
    projection = projectionOrPredicate as unknown as ProjectionType<T>;
  }

  let result = 0;

  for (let i = 1; i < array.length; i++) {
    if (!predicate!(projection(array[result]), projection(array[i]))) {
      result++;

      if (result !== i) {
        array[result] = array[i];
      }
    }
  }

  // Return the logical size (number of unique elements)
  return result + 1;
}
