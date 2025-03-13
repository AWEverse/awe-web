
interface KeyboardLayoutMap {
  get(code: string): string | undefined;
}

let layoutMap: KeyboardLayoutMap | undefined;

/**
 * Initialize the keyboard manager with cross-browser support
 * This function attempts multiple methods to identify keyboard layout
 */
export async function initializeKeyboardManager(): Promise<void> {
  if (layoutMap) return;

  try {
    const experimentalNavigator = window.navigator as unknown as {
      keyboard?: { getLayoutMap(): Promise<KeyboardLayoutMap> };
    };

    if (experimentalNavigator.keyboard?.getLayoutMap) {
      layoutMap = await experimentalNavigator.keyboard.getLayoutMap();
      return;
    }

    layoutMap = await createFallbackLayoutMap();
  } catch (error) {
    console.warn("Keyboard layout detection failed:", error);
    layoutMap = createBasicFallbackMap();
  }
}

/**
 * Create a fallback layout map using browser detection and language settings
 * This provides a reasonable approximation for most common keyboard layouts
 */
async function createFallbackLayoutMap(): Promise<KeyboardLayoutMap> {
  const fallbackMap = new Map<string, string>();
  const userLanguage = navigator.language || 'en-US';

  await loadLayoutForLanguage(userLanguage, fallbackMap);

  return {
    get(code: string): string | undefined {
      return fallbackMap.get(code);
    }
  };
}

/**
 * Load keyboard layout data for a specific language
 * This can be expanded to include more layouts as needed
 */
async function loadLayoutForLanguage(language: string, map: Map<string, string>): Promise<void> {
  const layouts: Record<string, Record<string, string>> = {
    'en-US': {
      'KeyQ': 'q', 'KeyW': 'w', 'KeyE': 'e', /* ... other keys ... */
    },
    // Add more layouts as needed
  };

  const baseLanguage = language.split('-')[0];
  const exactLayout = layouts[language];
  const baseLayout = Object.keys(layouts).find(key => key.startsWith(baseLanguage));
  const defaultLayout = layouts['en-US'];

  const selectedLayout = exactLayout || (baseLayout ? layouts[baseLayout] : defaultLayout);

  Object.entries(selectedLayout).forEach(([code, key]) => {
    map.set(code, key);
  });
}

/**
 * Create a basic fallback map for worst-case scenarios
 * This provides minimal functionality when all else fails
 */
function createBasicFallbackMap(): KeyboardLayoutMap {
  const basicMap = new Map<string, string>();


  "QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(char => {
    basicMap.set(`Key${char}`, char.toLowerCase());
  });

  return {
    get(code: string): string | undefined {
      return basicMap.get(code);
    }
  };
}

/**
 * Look up a key based on its code, with extended functionality
 * This function handles special cases and provides advanced features
 */
export function lookup({ code, key }: Pick<KeyboardEvent, 'code' | 'key'>): string {
  if (!layoutMap) {
    initializeKeyboardManager().catch(console.error);
    return key;
  }

  const mappedKey = layoutMap.get(code);

  if (mappedKey) {
    return mappedKey;
  }

  if (code.startsWith('Digit')) {
    return code.charAt(5);
  }

  return key;
}
