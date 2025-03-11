import { AnimationState } from "./types";

export default {
  isPlaying: false,
  loop: false,
  level: 0,
  type: '',

  autoplayVideos: false,
  autoplayGIFs: false,
  stickerAnimations: {
    enabled: false,
    autoplayInPanel: false,
    autoplayInChat: false,
  },
  interactiveEffects: {
    enabled: false,
    reactionEffect: false,
    premiumStickersEffect: false,
    emojiEffect: false,
  },
  chatAnimations: {
    enabled: false,
    wallpaperRotation: false,
    animatedSpoilerEffect: false,
  },
  interfaceAnimations: false,
} as AnimationState;
