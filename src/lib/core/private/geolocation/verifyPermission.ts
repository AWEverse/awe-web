// Check if geolocation is supported by the browser
export const IS_GEOLOCATION_SUPPORTED = "geolocation" in navigator;

const getCurrentPosition = () => {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true, // Prioritize accuracy
      timeout: 5000, // 5-second timeout
      maximumAge: 0, // No cached position
    });
  });
};

const fetchPosition = async () => {
  try {
    const position = await getCurrentPosition();
    return { success: true, coords: position.coords };
  } catch (error) {
    const _error = error as GeolocationPositionError;
    return { success: false, code: _error.code, message: _error.message };
  }
};

/**
 * Get geolocation status and coordinates with advanced handling
 * @returns Status object containing support, permission, and location data
 */
const verifyPermissionStatus = async () => {
  if (!IS_GEOLOCATION_SUPPORTED) {
    return {
      supported: false,
      accessRequested: false,
      accessGranted: false,
      message: "Geolocation is not supported by this browser.",
    };
  }

  if (!('permissions' in navigator)) {
    const result = await fetchPosition();
    return {
      supported: true,
      accessRequested: true,
      accessGranted: result.success,
      ...(result.success && { geolocation: result.coords }),
      ...(!result.success && {
        message: result.code === 1 ? "User denied geolocation permission" : `Error: ${result.message}`,
      }),
    };
  }

  try {
    const permissionStatus = await navigator.permissions.query({ name: "geolocation" });

    switch (permissionStatus.state) {
      case "granted":
      case "prompt": {
        const result = await fetchPosition();
        if (result.success) {
          return {
            supported: true,
            accessRequested: true,
            accessGranted: true,
            geolocation: result.coords,
          };
        } else {
          return {
            supported: true,
            accessRequested: true,
            accessGranted: false,
            message: result.code === 1 ? "User denied geolocation permission" : `Error: ${result.message}`,
          };
        }
      }
      case "denied":
        return {
          supported: true,
          accessRequested: true,
          accessGranted: false,
          message: "Geolocation permission is denied. Please enable it in browser settings.",
        };
      default:
        return {
          supported: true,
          accessRequested: false,
          accessGranted: false,
          message: "Unknown permission state",
        };
    }
  } catch (error) {
    const _error = error as GeolocationPositionError;

    return {
      supported: true,
      accessRequested: false,
      accessGranted: false,
      error: `Permission query failed: ${_error.message}`,
    };
  }
};

export default verifyPermissionStatus;
