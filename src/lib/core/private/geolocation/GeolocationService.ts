import { IDisposable } from "../../public/misc";
import SmartError from "../debug/SmartError";

interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

interface GeolocationResult {
  supported: boolean;
  accessRequested: boolean;
  accessGranted: boolean;
  geolocation?: GeolocationCoords;
  message?: string;
  error?: string;
}

interface GeolocationConfig {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  retryAttempts?: number;
  cacheTTL?: number; // Cache TTL in milliseconds
}

/**
 * Sanitizes geolocation coordinates to prevent data leaks.
 */
const sanitizeCoords = (coords: GeolocationCoordinates) => ({
  latitude: coords.latitude,
  longitude: coords.longitude,
  accuracy: coords.accuracy,
  altitude: coords.altitude ?? null,
  altitudeAccuracy: coords.altitudeAccuracy ?? null,
  heading: coords.heading ?? null,
  speed: coords.speed ?? null,
});

/**
 * Securely checks if a feature is supported by the navigator.
 */
const isFeatureSupported = (feature: keyof Navigator): boolean => {
  try {
    return feature in navigator;
  } catch {
    return false;
  }
};

class GeolocationService implements IDisposable {
  private readonly config: GeolocationConfig;
  private cache: { coords?: GeolocationCoords; timestamp: number } | null =
    null;
  private static readonly DEFAULT_CONFIG: GeolocationConfig = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
    retryAttempts: 2,
    cacheTTL: 60000,
  };

  constructor(config: Partial<GeolocationConfig> = {}) {
    this.config = { ...GeolocationService.DEFAULT_CONFIG, ...config };
  }

  public destroy(): void {
    this.clearCache();
  }

  public isSupported(): boolean {
    return isFeatureSupported("geolocation");
  }

  private async getCurrentPosition(attempt = 1): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          if (attempt < this.config.retryAttempts!) {
            setTimeout(
              () => this.getCurrentPosition(attempt + 1).then(resolve, reject),
              1000,
            );
          } else {
            new SmartError(
              `Geolocation error: ${error.message}`,
              "getCurrentPosition",
            )
              .addCall("navigator.geolocation.getCurrentPosition")
              .addStep(`Attempt ${attempt} failed`)
              .log();
            reject(error);
          }
        },
        {
          enableHighAccuracy: this.config.enableHighAccuracy,
          timeout: this.config.timeout,
          maximumAge: this.config.maximumAge,
        },
      );
    });
  }

  private async fetchPosition(): Promise<
    | { success: true; coords: GeolocationCoords }
    | { success: false; code: number; message: string }
  > {
    if (
      this.cache &&
      Date.now() - this.cache.timestamp < this.config.cacheTTL!
    ) {
      return { success: true, coords: this.cache.coords! };
    }

    try {
      const position = await this.getCurrentPosition();
      const coords = sanitizeCoords(position.coords);
      this.cache = { coords, timestamp: Date.now() };
      return { success: true, coords };
    } catch (error) {
      const _error = error as GeolocationPositionError;
      new SmartError(
        `Fetch position failed: ${_error.message}`,
        "fetchPosition",
      )
        .addCall("getCurrentPosition")
        .addStep("Attempting to fetch geolocation")
        .log();
      return { success: false, code: _error.code, message: _error.message };
    }
  }

  public async verifyPermissionStatus(): Promise<GeolocationResult> {
    if (!this.isSupported()) {
      new SmartError("Geolocation not supported", "verifyPermissionStatus")
        .addStep("Checking browser support")
        .log();

      return {
        supported: false,
        accessRequested: false,
        accessGranted: false,
        message: "Geolocation is not supported by this browser.",
      };
    }

    if (!isFeatureSupported("permissions")) {
      const result = await this.fetchPosition();
      if (!result.success) {
        new SmartError(
          `Permission check failed: ${result.message}`,
          "verifyPermissionStatus",
        )
          .addCall("fetchPosition")
          .addStep("Checking permissions without API")
          .log();
      }
      return {
        supported: true,
        accessRequested: true,
        accessGranted: result.success,
        ...(result.success && { geolocation: result.coords }),
        ...(!result.success && {
          message:
            result.code === 1
              ? "User denied geolocation permission"
              : `Error: ${result.message}`,
        }),
      };
    }

    try {
      const permissionStatus = await navigator.permissions.query({
        name: "geolocation",
      });

      switch (permissionStatus.state) {
        case "granted":
        case "prompt": {
          const result = await this.fetchPosition();
          if (!result.success) {
            new SmartError(
              `Position fetch failed: ${result.message}`,
              "verifyPermissionStatus",
            )
              .addCall("fetchPosition")
              .addStep(`Permission state: ${permissionStatus.state}`)
              .log();
          }
          return {
            supported: true,
            accessRequested: true,
            accessGranted: result.success,
            ...(result.success && { geolocation: result.coords }),
            ...(!result.success && {
              message:
                result.code === 1
                  ? "User denied geolocation permission"
                  : `Error: ${result.message}`,
            }),
          };
        }
        case "denied":
          new SmartError(
            "Geolocation permission denied",
            "verifyPermissionStatus",
          )
            .addStep("Checking permission status")
            .log();
          return {
            supported: true,
            accessRequested: true,
            accessGranted: false,
            message:
              "Geolocation permission is denied. Please enable it in browser settings.",
          };
        default:
          new SmartError("Unknown permission state", "verifyPermissionStatus")
            .addStep("Checking permission status")
            .log();
          return {
            supported: true,
            accessRequested: false,
            accessGranted: false,
            message: "Unknown permission state",
          };
      }
    } catch (error) {
      new SmartError(
        `Permission query failed: ${(error as Error).message}`,
        "verifyPermissionStatus",
      )
        .addCall("navigator.permissions.query")
        .addStep("Querying geolocation permission")
        .log();
      return {
        supported: true,
        accessRequested: false,
        accessGranted: false,
        error: `Permission query failed: ${(error as Error).message}`,
      };
    }
  }

  private clearCache(): void {
    this.cache = null;
  }

  public watchPosition(
    callback: (result: GeolocationResult) => void,
    signal?: AbortSignal,
  ): number | null {
    if (!this.isSupported()) {
      new SmartError("Geolocation not supported", "watchPosition")
        .addStep("Checking browser support")
        .log();
      callback({
        supported: false,
        accessRequested: false,
        accessGranted: false,
        message: "Geolocation is not supported by this browser.",
      });
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = sanitizeCoords(position.coords);
        this.cache = { coords, timestamp: Date.now() };
        callback({
          supported: true,
          accessRequested: true,
          accessGranted: true,
          geolocation: coords,
        });
      },
      (error) => {
        new SmartError(
          `Watch position failed: ${error.message}`,
          "watchPosition",
        )
          .addCall("navigator.geolocation.watchPosition")
          .addStep("Monitoring position changes")
          .log();
        callback({
          supported: true,
          accessRequested: true,
          accessGranted: false,
          message:
            error.code === 1
              ? "User denied geolocation permission"
              : `Error: ${error.message}`,
        });
      },
      {
        enableHighAccuracy: this.config.enableHighAccuracy,
        timeout: this.config.timeout,
        maximumAge: this.config.maximumAge,
      },
    );

    signal?.addEventListener("abort", () => {
      navigator.geolocation.clearWatch(watchId);
    });

    return watchId;
  }
}

export default GeolocationService;
