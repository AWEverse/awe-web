export const UserErrors = {
  // General Errors
  UNKNOWN_ERROR: "UnknownError",
  INVALID_ARGUMENT: "InvalidArgument",
  INVALID_STATE: "InvalidState",
  INVALID_OPERATION: "InvalidOperation",
  OPERATION_FAILED: "OperationFailed",
  RESOURCE_NOT_FOUND: "ResourceNotFound",
  CONFLICT: "Conflict",
  DUPLICATE_ENTRY: "DuplicateEntry",

  // Data / Input Errors
  INVALID_DATA: "InvalidData",
  INVALID_VALUE: "InvalidValue",
  INVALID_FORMAT: "InvalidFormat",
  INVALID_INPUT: "InvalidInput",
  INVALID_OUTPUT: "InvalidOutput",
  INVALID_CONTEXT: "InvalidContext",
  INVALID_RESPONSE: "InvalidResponse",

  // Validation Errors
  REQUIRED_FIELD_MISSING: "RequiredFieldMissing",
  FIELD_TOO_SHORT: "FieldTooShort",
  FIELD_TOO_LONG: "FieldTooLong",
  EMAIL_INVALID: "EmailInvalid",
  USERNAME_TAKEN: "UsernameTaken",
  PHONE_NUMBER_INVALID: "PhoneNumberInvalid",

  // Authentication Errors
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  EXPIRED_SESSION: "ExpiredSession",
  INVALID_CREDENTIALS: "InvalidCredentials",
  ACCOUNT_LOCKED: "AccountLocked",
  PASSWORD_TOO_WEAK: "PasswordTooWeak",

  // Network / Server Errors
  NETWORK_ERROR: "NetworkError",
  SERVER_UNAVAILABLE: "ServerUnavailable",
  TIMEOUT: "Timeout",
  SERVICE_UNAVAILABLE: "ServiceUnavailable",
  RATE_LIMIT_EXCEEDED: "RateLimitExceeded",

  // Permission Errors
  ACCESS_DENIED: "AccessDenied",
  INSUFFICIENT_PRIVILEGES: "InsufficientPrivileges",
  NO_PERMISSION: "NoPermission",

  // Payment Errors
  PAYMENT_REQUIRED: "PaymentRequired",
  CARD_DECLINED: "CardDeclined",
  INVALID_PAYMENT_METHOD: "InvalidPaymentMethod",
  INSUFFICIENT_FUNDS: "InsufficientFunds",

  // Dependency / Service Integration Errors
  SERVICE_ERROR: "ServiceError",
  DEPENDENCY_FAILURE: "DependencyFailure",
} as const;
