export type Level = 0 | 1 | 2;

export interface AnimationState {
  isPlaying: boolean;
  loop: boolean;
  level: Level;
  type: string;
  autoplayVideos: boolean;
  autoplayGIFs: boolean;
  stickerAnimations: {
    enabled: boolean;
    autoplayInPanel: boolean;
    autoplayInChat: boolean;
  };
  interactiveEffects: {
    enabled: boolean;
    reactionEffect: boolean;
    premiumStickersEffect: boolean;
    emojiEffect: boolean;
  };
  chatAnimations: {
    enabled: boolean;
    wallpaperRotation: boolean;
    animatedSpoilerEffect: boolean;
  };
  interfaceAnimations: boolean;
}

export enum ActionType {
  PLAY = "PLAY",
  PAUSE = "PAUSE",
  STOP = "STOP",
  SET_LOOP = "SET_LOOP",
  SET_LEVEL = "SET_LEVEL",
  SET_TYPE = "SET_TYPE",
  TOGGLE_AUTOPLAY_VIDEOS = "TOGGLE_AUTOPLAY_VIDEOS",
  TOGGLE_AUTOPLAY_GIFS = "TOGGLE_AUTOPLAY_GIFS",
  TOGGLE_STICKER_ANIMATIONS = "TOGGLE_STICKER_ANIMATIONS",
  TOGGLE_INTERACTIVE_EFFECTS = "TOGGLE_INTERACTIVE_EFFECTS",
  TOGGLE_CHAT_ANIMATIONS = "TOGGLE_CHAT_ANIMATIONS",
  TOGGLE_INTERFACE_ANIMATIONS = "TOGGLE_INTERFACE_ANIMATIONS",
  TOGGLE_STICKERS_PANEL = "TOGGLE_STICKERS_PANEL",
  TOGGLE_STICKERS_CHAT = "TOGGLE_STICKERS_CHAT",
  TOGGLE_REACTION_EFFECT = "TOGGLE_REACTION_EFFECT",
  TOGGLE_PREMIUM_STICKERS_EFFECT = "TOGGLE_PREMIUM_STICKERS_EFFECT",
  TOGGLE_EMOJI_EFFECT = "TOGGLE_EMOJI_EFFECT",
  TOGGLE_WALLPAPER_ROTATION = "TOGGLE_WALLPAPER_ROTATION",
  TOGGLE_ANIMATED_SPOILER = "TOGGLE_ANIMATED_SPOILER",
}

export type Action =
  | { type: ActionType.PLAY; payload: undefined }
  | { type: ActionType.PAUSE; payload: undefined }
  | { type: ActionType.STOP; payload: undefined }
  | { type: ActionType.SET_LOOP; payload: boolean }
  | { type: ActionType.SET_LEVEL; payload: Level }
  | { type: ActionType.SET_TYPE; payload: string }
  | { type: ActionType.TOGGLE_AUTOPLAY_VIDEOS; payload: boolean }
  | { type: ActionType.TOGGLE_AUTOPLAY_GIFS; payload: boolean }
  | { type: ActionType.TOGGLE_STICKER_ANIMATIONS; payload: boolean }
  | { type: ActionType.TOGGLE_INTERACTIVE_EFFECTS; payload: boolean }
  | { type: ActionType.TOGGLE_CHAT_ANIMATIONS; payload: boolean }
  | { type: ActionType.TOGGLE_INTERFACE_ANIMATIONS; payload: boolean }
  | { type: ActionType.TOGGLE_STICKERS_PANEL; payload: boolean }
  | { type: ActionType.TOGGLE_STICKERS_CHAT; payload: boolean }
  | { type: ActionType.TOGGLE_REACTION_EFFECT; payload: boolean }
  | { type: ActionType.TOGGLE_PREMIUM_STICKERS_EFFECT; payload: boolean }
  | { type: ActionType.TOGGLE_EMOJI_EFFECT; payload: boolean }
  | { type: ActionType.TOGGLE_WALLPAPER_ROTATION; payload: boolean }
  | { type: ActionType.TOGGLE_ANIMATED_SPOILER; payload: boolean };

export type Handler = (state: AnimationState, action: Action) => AnimationState;
