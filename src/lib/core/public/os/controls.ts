export enum EMouseButton {
  Main = 0, // Primary button (usually left)
  Auxiliary = 1, // Middle button (usually scroll wheel press)
  Secondary = 2, // Secondary button (usually right)
  Touchpad = 5, // For touchpad gestures or taps
  Trackball = 6, // Trackball input (if applicable)
}

export enum EKeyboardKey {
  // Modifier keys (physical positions)
  ShiftLeft = "ShiftLeft",
  ShiftRight = "ShiftRight",
  ControlLeft = "ControlLeft",
  ControlRight = "ControlRight",
  AltLeft = "AltLeft",
  AltRight = "AltRight",
  MetaLeft = "MetaLeft",
  MetaRight = "MetaRight",

  // Special keys
  Enter = "Enter",
  Escape = "Escape",
  Space = "Space",
  Backspace = "Backspace",
  Tab = "Tab",
  CapsLock = "CapsLock",
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",

  // Function keys
  F1 = "F1",
  F2 = "F2",
  F3 = "F3",
  F4 = "F4",
  F5 = "F5",
  F6 = "F6",
  F7 = "F7",
  F8 = "F8",
  F9 = "F9",
  F10 = "F10",
  F11 = "F11",
  F12 = "F12",

  // Alphanumeric keys (physical key codes)
  KeyA = "KeyA",
  KeyB = "KeyB",
  KeyC = "KeyC",
  KeyD = "KeyD",
  KeyE = "KeyE",
  KeyF = "KeyF",
  KeyG = "KeyG",
  KeyH = "KeyH",
  KeyI = "KeyI",
  KeyJ = "KeyJ",
  KeyK = "KeyK",
  KeyL = "KeyL",
  KeyM = "KeyM",
  KeyN = "KeyN",
  KeyO = "KeyO",
  KeyP = "KeyP",
  KeyQ = "KeyQ",
  KeyR = "KeyR",
  KeyS = "KeyS",
  KeyT = "KeyT",
  KeyU = "KeyU",
  KeyV = "KeyV",
  KeyW = "KeyW",
  KeyX = "KeyX",
  KeyY = "KeyY",
  KeyZ = "KeyZ",

  // Number keys (main keyboard)
  Digit0 = "Digit0",
  Digit1 = "Digit1",
  Digit2 = "Digit2",
  Digit3 = "Digit3",
  Digit4 = "Digit4",
  Digit5 = "Digit5",
  Digit6 = "Digit6",
  Digit7 = "Digit7",
  Digit8 = "Digit8",
  Digit9 = "Digit9",

  // Numpad keys (optional)
  Numpad0 = "Numpad0",
  Numpad1 = "Numpad1",
  Numpad2 = "Numpad2",
  Numpad3 = "Numpad3",
  Numpad4 = "Numpad4",
  Numpad5 = "Numpad5",
  Numpad6 = "Numpad6",
  Numpad7 = "Numpad7",
  Numpad8 = "Numpad8",
  Numpad9 = "Numpad9",
  NumpadAdd = "NumpadAdd",
  NumpadSubtract = "NumpadSubtract",
  NumpadMultiply = "NumpadMultiply",
  NumpadDivide = "NumpadDivide",
  NumpadEnter = "NumpadEnter",
  NumpadDecimal = "NumpadDecimal",
}
