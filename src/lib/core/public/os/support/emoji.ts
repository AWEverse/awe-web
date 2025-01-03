import { PLATFORM_ENV } from '@/lib/utils/OS/windowEnviroment';
import { IS_MAC_OS, IS_IOS } from '../platform';

function isLastEmojiVersionSupported() {
  const ALLOWABLE_CALCULATION_ERROR_SIZE = 5;
  const inlineEl = document.createElement('span');
  inlineEl.classList.add('emoji-test-element');
  document.body.appendChild(inlineEl);

  inlineEl.innerText = '🐦‍🔥'; // Emoji from 15.1 version
  const newEmojiWidth = inlineEl.offsetWidth;
  inlineEl.innerText = '❤️'; // Emoji from 1.0 version
  const legacyEmojiWidth = inlineEl.offsetWidth;

  document.body.removeChild(inlineEl);

  return Math.abs(newEmojiWidth - legacyEmojiWidth) < ALLOWABLE_CALCULATION_ERROR_SIZE;
}

export const IS_EMOJI_SUPPORTED =
  PLATFORM_ENV && (IS_MAC_OS || IS_IOS) && isLastEmojiVersionSupported();
