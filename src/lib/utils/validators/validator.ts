type Validator<T> = (value: T) => T | undefined;

export const validateProp = <T>(value: T | undefined, validator: Validator<T>, fallback: T, warningMessage: string): T => {
  if (value === undefined) return fallback;

  const isValid = validator(value);
  if (isValid !== undefined) {
    return isValid;
  }

  console.warn(warningMessage);
  return fallback;
};

// // Validate position prop with allowed values
// const validatedPosition = validateProp(
//   positionX,
//   (pos) => positionValidator(pos, ["left", "right"]),
//   "left",
//   `Invalid position value "${positionX}". Falling back to "left".`,
// );

// // Validate className prop
// const validatedClassName = validateProp(
//   className,
//   classNameValidator,
//   "", // Default fallback for className
//   "Invalid className prop. Expected a string.",
// );

// // Validate trigger component
// const validatedTrigger = validateProp(
//   trigger,
//   triggerValidator,
//   undefined, // Default fallback for trigger
//   "Trigger should be a valid React component.",
// );
