const withTest = <T>(value: T): T | null => {
  const isValid = value !== null && value !== undefined;

  if (!isValid) {
    return null;
  }

  return value;
};

export default withTest;
