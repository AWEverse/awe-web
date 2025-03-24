/**
 * A function that handles a request and returns a value of type T
 */
type RequestHandler<T> = (request: Record<string, string>) => T;

/**
 * Configuration for branching logic based on request values
 * @template T The return type of the handlers
 * @template K The type of keys used in the branching (defaults to string)
 */
type BranchConfig<T> = {
  [key: string]: {
    [value: string]: RequestHandler<T> | BranchConfig<T> | undefined;
  };
};

/**
 * Error types for better error handling
 */
class BranchConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BranchConfigError';
  }
}

class BranchRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BranchRequestError';
  }
}

/**
 * Creates a request handler that branches based on the values in the request.
 *
 * @template T The return type of the handlers
 * @param cases Configuration for branching logic
 * @returns A function that handles requests according to the branching logic
 * @throws {BranchConfigError} If the configuration is invalid
 * @throws {BranchRequestError} If the request doesn't match any branch
 *
 * @example
 * const handler = branch<string>({
 *   role: {
 *     admin: req => "Admin page",
 *     user: req => "User page",
 *     default: req => "Login page"
 *   }
 * });
 *
 * // Returns "Admin page"
 * handler({ role: "admin", userId: "123" });
 */
const branch = <T>(cases: BranchConfig<T>): RequestHandler<T> => {
  const keys = Object.keys(cases);

  if (keys.length !== 1) {
    throw new BranchConfigError(
      "A branching configuration must consist of a single key at the peer level"
    );
  }

  const key = keys[0];

  return (request: Record<string, string>): T => {
    // Validate request
    if (!(key in request)) {
      throw new BranchRequestError(`Key "${key}" not found in request.`);
    }

    const value = request[key];
    const branchOptions = cases[key];
    const chosen = value in branchOptions
      ? branchOptions[value]
      : branchOptions.default;

    if (!chosen) {
      throw new BranchRequestError(
        `No handler for key "${key}" with value "${value}" and no default handler provided`
      );
    }

    // Process the chosen branch
    return typeof chosen === "function"
      ? chosen(request)
      : branch(chosen as BranchConfig<T>)(request);
  };
};

export default branch;
