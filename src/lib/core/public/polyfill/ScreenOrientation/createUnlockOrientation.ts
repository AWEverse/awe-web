
export function createUnlockOrientation(): () => void {
  const screen = window.screen;

  if (screen.orientation && typeof screen.orientation.unlock === "function") {
    return screen.orientation.unlock.bind(screen.orientation);
  } else if (typeof (screen as any).msUnlockOrientation === "function") {
    return (screen as any).msUnlockOrientation.bind(screen);
  } else if (typeof (screen as any).mozUnlockOrientation === "function") {
    return (screen as any).mozUnlockOrientation.bind(screen);
  } else {
    return () => { };
  }
}
