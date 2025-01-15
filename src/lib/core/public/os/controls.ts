export enum EMouseButton {
  Main = 0, // Primary button (usually left)
  Auxiliary = 1, // Middle button (usually scroll wheel press)
  Secondary = 2, // Secondary button (usually right)
  Fourth = 3, // Fourth button (typically a "back" button)
  Fifth = 4, // Fifth button (typically a "forward" button)
  Back = 3, // Often the "back" button (for mouse with extra buttons)
  Forward = 4, // Often the "forward" button (for mouse with extra buttons)
  Middle = 1, // Often the middle button (wheel press)
  Touchpad = 5, // For touchpad gestures or taps
  Trackball = 6, // Trackball input (if applicable)
}

export enum EKeyboardKey {
  // Modifier keys
  Shift = 'Shift',
  Ctrl = 'Control',
  Alt = 'Alt',
  Meta = 'Meta',

  // Special keys
  Enter = 'Enter',
  Escape = 'Escape',
  Space = ' ',
  Backspace = 'Backspace',
  Tab = 'Tab',
  CapsLock = 'CapsLock',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',

  // Function keys
  F1 = 'F1',
  F2 = 'F2',
  F3 = 'F3',
  F4 = 'F4',
  F5 = 'F5',
  F6 = 'F6',
  F7 = 'F7',
  F8 = 'F8',
  F9 = 'F9',
  F10 = 'F10',
  F11 = 'F11',
  F12 = 'F12',

  // Alphanumeric keys
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I',
  J = 'J',
  K = 'K',
  L = 'L',
  M = 'M',
  N = 'N',
  O = 'O',
  P = 'P',
  Q = 'Q',
  R = 'R',
  S = 'S',
  T = 'T',
  U = 'U',
  V = 'V',
  W = 'W',
  X = 'X',
  Y = 'Y',
  Z = 'Z',

  // Numbers
  Zero = '0',
  One = '1',
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
}
