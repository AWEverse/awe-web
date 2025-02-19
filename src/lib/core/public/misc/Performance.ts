import { requestMutation } from "@/lib/modules/fastdom";

export type PerformanceTypeKey =
  | "pageTransitions"
  | "messageSendingAnimations"
  | "mediaViewerAnimations"
  | "messageComposerAnimations"
  | "contextMenuAnimations"
  | "contextMenuBlur"
  | "rightColumnAnimations"
  | "animatedEmoji"
  | "loopAnimatedStickers"
  | "reactionEffects"
  | "stickerEffects"
  | "autoplayGifs"
  | "autoplayVideos"
  | "storyRibbonAnimations"
  | "snapEffect";

export type PerformanceType = {
  [key in PerformanceTypeKey]: boolean;
};

const classMap: Record<PerformanceTypeKey, string> = {
  pageTransitions: "no-page-transitions",
  messageSendingAnimations: "no-message-sending-animations",
  mediaViewerAnimations: "no-media-viewer-animations",
  messageComposerAnimations: "no-message-composer-animations",
  contextMenuAnimations: "no-context-menu-animations",
  contextMenuBlur: "no-menu-blur",
  rightColumnAnimations: "no-right-column-animations",
  animatedEmoji: "no-animated-emoji",
  loopAnimatedStickers: "no-loop-animated-stickers",
  reactionEffects: "no-reaction-effects",
  stickerEffects: "no-sticker-effects",
  autoplayGifs: "no-autoplay-gifs",
  autoplayVideos: "no-autoplay-videos",
  storyRibbonAnimations: "no-story-ribbon-animations",
  snapEffect: "no-snap-effect",
};

export function applyPerformanceSettings(performanceType: PerformanceType) {
  const root = document.body;

  requestMutation(() => {
    for (const key in performanceType) {
      if (Object.prototype.hasOwnProperty.call(performanceType, key)) {
        root.classList.toggle(
          classMap[key as PerformanceTypeKey],
          !performanceType[key as PerformanceTypeKey],
        );
      }
    }
  });
}

export function applyAnimationSettings(performanceType: 0 | 1 | 2) {
  const root = document.body;

  requestMutation(() => {
    root.classList.remove(
      "animation-level-0",
      "animation-level-1",
      "animation-level-2",
    );
    root.classList.add(`animation-level-${performanceType}`);
  });
}
