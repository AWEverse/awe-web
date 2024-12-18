export type KeyboardModifiers = {
  alt: boolean;
  ctrl: boolean;
  meta: boolean;
  mod: boolean;
  shift: boolean;
};

export type Hotkey = KeyboardModifiers & {
  key?: string;
};

type CheckHotkeyMatch = (event: KeyboardEvent) => boolean;

export function parseHotkey(hotkey: string): Hotkey {
  const normalizedHotkey = hotkey.toLocaleLowerCase();
  const keys = normalizedHotkey.split(/\s*\+\s*/);

  const reservedKeys = new Set(['alt', 'ctrl', 'meta', 'shift', 'mod']);

  const modifiers: KeyboardModifiers = {
    alt: false,
    ctrl: false,
    meta: false,
    mod: false,
    shift: false,
  };

  let freeKey: string | undefined;

  for (const key of keys) {
    if (reservedKeys.has(key)) {
      modifiers[key as keyof KeyboardModifiers] = true;
    } else if (!freeKey) {
      freeKey = key;
    }
  }

  return {
    ...modifiers,
    key: freeKey,
  };
}

function isExactHotkey(hotkey: Hotkey, event: KeyboardEvent): boolean {
  const { alt, ctrl, meta, mod, shift, key } = hotkey;
  const { altKey, ctrlKey, metaKey, shiftKey, key: pressedKey, code } = event;

  if (alt !== altKey || shift !== shiftKey || (mod ? !ctrlKey && !metaKey : ctrl !== ctrlKey || meta !== metaKey)) {
    return false;
  }

  if (key && (pressedKey.toLowerCase() === key.toLowerCase() || code.replace('Key', '').toLowerCase() === key.toLowerCase())) {
    return true;
  }

  return false;
}

export function getHotkeyMatcher(hotkey: string): CheckHotkeyMatch {
  return event => isExactHotkey(parseHotkey(hotkey), event);
}

export interface HotkeyItemOptions {
  preventDefault?: boolean;
}

type HotkeyItem = [string, (event: KeyboardEvent) => void, HotkeyItemOptions?];

export function getHotkeyHandler(hotkeys: HotkeyItem[]) {
  return (event: React.KeyboardEvent<HTMLElement> | KeyboardEvent) => {
    const _event = 'nativeEvent' in event ? event.nativeEvent : event;

    hotkeys.forEach(([hotkey, handler, options = { preventDefault: true }]) => {
      if (getHotkeyMatcher(hotkey)(_event)) {
        if (options.preventDefault) {
          event.preventDefault();
        }

        handler(_event);
      }
    });
  };
}
