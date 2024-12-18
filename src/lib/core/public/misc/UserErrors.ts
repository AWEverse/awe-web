export const UserErrors = {
  // General Errors
  INVALID_ARGUMENT: 'InvalidArgument',
  INVALID_STATE: 'InvalidState',
  INVALID_OPERATION: 'InvalidOperation',
  INVALID_DATA: 'InvalidData',
  INVALID_VALUE: 'InvalidValue',
  INVALID_FORMAT: 'InvalidFormat',
  INVALID_INPUT: 'InvalidInput',
  INVALID_OUTPUT: 'InvalidOutput',
  INVALID_CONTEXT: 'InvalidContext',
  INVALID_RESPONSE: 'InvalidResponse',

  // Authentication Errors
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  EXPIRED_SESSION: 'ExpiredSession',
  INVALID_CREDENTIALS: 'InvalidCredentials',
  ACCOUNT_LOCKED: 'AccountLocked',
  PASSWORD_TOO_WEAK: 'PasswordTooWeak',

  // Validation Errors
  REQUIRED_FIELD_MISSING: 'RequiredFieldMissing',
  FIELD_TOO_SHORT: 'FieldTooShort',
  FIELD_TOO_LONG: 'FieldTooLong',
  EMAIL_INVALID: 'EmailInvalid',
  USERNAME_TAKEN: 'UsernameTaken',
  PHONE_NUMBER_INVALID: 'PhoneNumberInvalid',

  // Network and Server Errors
  NETWORK_ERROR: 'NetworkError',
  SERVER_UNAVAILABLE: 'ServerUnavailable',
  TIMEOUT: 'Timeout',
  SERVICE_UNAVAILABLE: 'ServiceUnavailable',

  // Permission Errors
  ACCESS_DENIED: 'AccessDenied',
  INSUFFICIENT_PRIVILEGES: 'InsufficientPrivileges',
  NO_PERMISSION: 'NoPermission',

  // Other Errors
  UNKNOWN_ERROR: 'UnknownError',
  OPERATION_FAILED: 'OperationFailed',
  RESOURCE_NOT_FOUND: 'ResourceNotFound',
  CONFLICT: 'Conflict',
  DUPLICATE_ENTRY: 'DuplicateEntry',
} as const;
