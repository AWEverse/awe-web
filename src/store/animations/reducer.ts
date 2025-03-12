import { Action, ActionType, AnimationState } from "./types";

const updateNested = <T extends object, K extends keyof T>(
  obj: T,
  key: K,
  updates: Partial<T[K]>
): T => ({
  ...obj,
  [key]: { ...obj[key], ...updates } as T[K],
});

export default function (state: AnimationState, action: Action): AnimationState {
  switch (action.type) {
    case ActionType.PLAY:
      return { ...state, isPlaying: true };
    case ActionType.PAUSE:
      return { ...state, isPlaying: false };
    case ActionType.STOP:
      return { ...state, isPlaying: false, level: 0 };
    case ActionType.SET_LOOP:
      return { ...state, loop: action.payload };
    case ActionType.SET_LEVEL:
      return { ...state, level: action.payload };
    case ActionType.SET_TYPE:
      return { ...state, type: action.payload };
    case ActionType.TOGGLE_AUTOPLAY_VIDEOS:
      return { ...state, autoplayVideos: action.payload };
    case ActionType.TOGGLE_AUTOPLAY_GIFS:
      return { ...state, autoplayGIFs: action.payload };
    case ActionType.TOGGLE_STICKER_ANIMATIONS:
      return updateNested(state, "stickerAnimations", { enabled: action.payload });
    case ActionType.TOGGLE_INTERACTIVE_EFFECTS:
      return updateNested(state, "interactiveEffects", { enabled: action.payload });
    case ActionType.TOGGLE_CHAT_ANIMATIONS:
      return updateNested(state, "chatAnimations", { enabled: action.payload });
    case ActionType.TOGGLE_INTERFACE_ANIMATIONS:
      return { ...state, interfaceAnimations: action.payload };
    case ActionType.TOGGLE_STICKERS_PANEL:
      return updateNested(state, "stickerAnimations", { autoplayInPanel: action.payload });
    case ActionType.TOGGLE_STICKERS_CHAT:
      return updateNested(state, "stickerAnimations", { autoplayInChat: action.payload });
    case ActionType.TOGGLE_REACTION_EFFECT:
      return updateNested(state, "interactiveEffects", { reactionEffect: action.payload });
    case ActionType.TOGGLE_PREMIUM_STICKERS_EFFECT:
      return updateNested(state, "interactiveEffects", { premiumStickersEffect: action.payload });
    case ActionType.TOGGLE_EMOJI_EFFECT:
      return updateNested(state, "interactiveEffects", { emojiEffect: action.payload });
    case ActionType.TOGGLE_WALLPAPER_ROTATION:
      return updateNested(state, "chatAnimations", { wallpaperRotation: action.payload });
    case ActionType.TOGGLE_ANIMATED_SPOILER:
      return updateNested(state, "chatAnimations", { animatedSpoilerEffect: action.payload });
    default:
      return state;
  }
}
