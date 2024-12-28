const withTest = <T>(value: T): T | null => {
  console.log('Received value:', value);

  // Validation: You can add specific validation based on your use case
  const isValid = value !== null && value !== undefined;
  if (!isValid) {
    console.warn('Invalid value provided:', value);
    return null; // Return null if the value is invalid
  }

  // If validation passes, return the value
  console.log('Returning valid value:', value);
  return value;
};

export default withTest;
