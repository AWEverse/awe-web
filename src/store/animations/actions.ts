import { Level, ActionType } from "./types";

export const play = () => ({ type: ActionType.PLAY }) as const;
export const pause = () => ({ type: ActionType.PAUSE }) as const;
export const stop = () => ({ type: ActionType.STOP }) as const;

export const setLoop = (loop: boolean) =>
  ({ type: ActionType.SET_LOOP, payload: loop }) as const;
export const setLevel = (level: Level) =>
  ({ type: ActionType.SET_LEVEL, payload: level }) as const;
export const setType = (type: string) =>
  ({ type: ActionType.SET_TYPE, payload: type }) as const;

export const toggleAutoplayVideos = (enabled: boolean) =>
  ({ type: ActionType.TOGGLE_AUTOPLAY_VIDEOS, payload: enabled }) as const;
export const toggleAutoplayGIFs = (enabled: boolean) =>
  ({ type: ActionType.TOGGLE_AUTOPLAY_GIFS, payload: enabled }) as const;
export const toggleStickerAnimations = (enabled: boolean) =>
  ({ type: ActionType.TOGGLE_STICKER_ANIMATIONS, payload: enabled }) as const;
export const toggleInteractiveEffects = (enabled: boolean) =>
  ({ type: ActionType.TOGGLE_INTERACTIVE_EFFECTS, payload: enabled }) as const;
export const toggleChatAnimations = (enabled: boolean) =>
  ({ type: ActionType.TOGGLE_CHAT_ANIMATIONS, payload: enabled }) as const;
export const toggleInterfaceAnimations = (enabled: boolean) =>
  ({ type: ActionType.TOGGLE_INTERFACE_ANIMATIONS, payload: enabled }) as const;

export const toggleStickersPanel = (enabled: boolean) =>
  ({ type: ActionType.TOGGLE_STICKERS_PANEL, payload: enabled }) as const;
export const toggleStickersChat = (enabled: boolean) =>
  ({ type: ActionType.TOGGLE_STICKERS_CHAT, payload: enabled }) as const;
export const toggleReactionEffect = (enabled: boolean) =>
  ({ type: ActionType.TOGGLE_REACTION_EFFECT, payload: enabled }) as const;
export const togglePremiumStickersEffect = (enabled: boolean) =>
  ({ type: ActionType.TOGGLE_PREMIUM_STICKERS_EFFECT, payload: enabled }) as const;
export const toggleEmojiEffect = (enabled: boolean) =>
  ({ type: ActionType.TOGGLE_EMOJI_EFFECT, payload: enabled }) as const;
export const toggleWallpaperRotation = (enabled: boolean) =>
  ({ type: ActionType.TOGGLE_WALLPAPER_ROTATION, payload: enabled }) as const;
export const toggleAnimatedSpoiler = (enabled: boolean) =>
  ({ type: ActionType.TOGGLE_ANIMATED_SPOILER, payload: enabled }) as const;
