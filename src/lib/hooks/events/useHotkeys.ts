import { useEffect } from 'react';
import { getHotkeyMatcher, HotkeyItemOptions } from '@/lib/utils/parse-hotkey';

export type HotkeyItem = [string, (event: KeyboardEvent) => void, HotkeyItemOptions?];

function shouldFireEvent(event: KeyboardEvent, tagsToIgnore: string[], triggerOnContentEditable = false) {
  if (event.target instanceof HTMLElement) {
    if (triggerOnContentEditable) {
      return !tagsToIgnore.includes(event.target.tagName);
    }

    return !event.target.isContentEditable && !tagsToIgnore.includes(event.target.tagName);
  }

  return true;
}

/*
 useHotkeys({
    'Mod+F': handleHotkeySearchClick,
  });
*/
export function useHotkeys(
  hotkeys: HotkeyItem[],
  tagsToIgnore: string[] = ['INPUT', 'TEXTAREA', 'SELECT'],
  triggerOnContentEditable = false,
) {
  useEffect(() => {
    const keydownListener = (event: KeyboardEvent) => {
      hotkeys.forEach(([hotkey, handler, options = { preventDefault: true }]) => {
        if (getHotkeyMatcher(hotkey)(event) && shouldFireEvent(event, tagsToIgnore, triggerOnContentEditable)) {
          if (options.preventDefault) {
            event.preventDefault();
          }

          handler(event);
        }
      });
    };

    document.documentElement.addEventListener('keydown', keydownListener);

    return () => {
      document.documentElement.removeEventListener('keydown', keydownListener);
    };
  }, [hotkeys, tagsToIgnore, triggerOnContentEditable]);
}
