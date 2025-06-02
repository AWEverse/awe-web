// Animation levels
export type Level = 0 | 1 | 2;

// Sticker animations configuration
export interface StickerAnimations {
  enabled: boolean;
  autoplayInPanel: boolean;
  autoplayInChat: boolean;
}

// Interactive effects configuration
export interface InteractiveEffects {
  enabled: boolean;
  reactionEffect: boolean;
  premiumStickersEffect: boolean;
  emojiEffect: boolean;
}

// Chat animations configuration
export interface ChatAnimations {
  enabled: boolean;
  wallpaperRotation: boolean;
  animatedSpoilerEffect: boolean;
}

// Main animation state
export interface AnimationState {
  // Playback state
  isPlaying: boolean;
  loop: boolean;
  level: Level;
  type: string;

  // Media autoplay settings
  autoplayVideos: boolean;
  autoplayGIFs: boolean;

  // Feature-specific animations
  stickerAnimations: StickerAnimations;
  interactiveEffects: InteractiveEffects;
  chatAnimations: ChatAnimations;

  // Interface animations
  interfaceAnimations: boolean;
}

// Action payload types
export interface SetLevelPayload {
  level: Level;
}

export interface SetTypePayload {
  type: string;
}

export interface UpdateStickerAnimationsPayload {
  updates: Partial<StickerAnimations>;
}

export interface UpdateInteractiveEffectsPayload {
  updates: Partial<InteractiveEffects>;
}

export interface UpdateChatAnimationsPayload {
  updates: Partial<ChatAnimations>;
}

// Grouped state types for selectors
export interface PlaybackState {
  isPlaying: boolean;
  loop: boolean;
  level: Level;
  type: string;
}

export interface AutoplaySettings {
  autoplayVideos: boolean;
  autoplayGIFs: boolean;
}

export interface AllAnimationSettings {
  stickerAnimations: StickerAnimations;
  interactiveEffects: InteractiveEffects;
  chatAnimations: ChatAnimations;
  interfaceAnimations: boolean;
}
