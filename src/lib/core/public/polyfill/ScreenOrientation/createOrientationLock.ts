
export function createOrientationLock(): (lockType: string) => Promise<void> {
  const errorMessage = "lockOrientation() is not available on this device.";
  const screen = window.screen;
  let lockOrientationFunction: ((lockType: string) => boolean) | undefined;

  if (typeof (screen as any).msLockOrientation === "function") {
    lockOrientationFunction = (screen as any).msLockOrientation.bind(screen);
  } else if (typeof (screen as any).mozLockOrientation === "function") {
    lockOrientationFunction = (screen as any).mozLockOrientation.bind(screen);
  } else {
    lockOrientationFunction = () => false;
  }

  return (lockType: string): Promise<void> => {
    if (lockOrientationFunction && lockOrientationFunction(lockType)) {
      return Promise.resolve();
    } else {
      return Promise.reject(new Error(errorMessage));
    }
  };
}
