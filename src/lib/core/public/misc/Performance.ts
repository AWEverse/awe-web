import { requestMutation } from '@/lib/modules/fastdom/fastdom';

export type PerformanceTypeKey =
  | 'pageTransitions'
  | 'messageSendingAnimations'
  | 'mediaViewerAnimations'
  | 'messageComposerAnimations'
  | 'contextMenuAnimations'
  | 'contextMenuBlur'
  | 'rightColumnAnimations'
  | 'animatedEmoji'
  | 'loopAnimatedStickers'
  | 'reactionEffects'
  | 'stickerEffects'
  | 'autoplayGifs'
  | 'autoplayVideos'
  | 'storyRibbonAnimations'
  | 'snapEffect';

export type PerformanceType = {
  [key in PerformanceTypeKey]: boolean;
};

const classMap: { [key in PerformanceTypeKey]: string } = {
  pageTransitions: 'no-page-transitions',
  messageSendingAnimations: 'no-message-sending-animations',
  mediaViewerAnimations: 'no-media-viewer-animations',
  messageComposerAnimations: 'no-message-composer-animations',
  contextMenuAnimations: 'no-context-menu-animations',
  contextMenuBlur: 'no-menu-blur',
  rightColumnAnimations: 'no-right-column-animations',
  animatedEmoji: 'no-animated-emoji',
  loopAnimatedStickers: 'no-loop-animated-stickers',
  reactionEffects: 'no-reaction-effects',
  stickerEffects: 'no-sticker-effects',
  autoplayGifs: 'no-autoplay-gifs',
  autoplayVideos: 'no-autoplay-videos',
  storyRibbonAnimations: 'no-story-ribbon-animations',
  snapEffect: 'no-snap-effect',
};

export function applyPerformanceSettings(performanceType: PerformanceType) {
  const root = document.body;

  requestMutation(() => {
    (Object.keys(performanceType) as PerformanceTypeKey[]).forEach(key => {
      root.classList.toggle(classMap[key], !performanceType[key]);
    });
  });
}

export function applyAnimationSettings(performanceType: 0 | 1 | 2) {
  const root = document.body;

  root.classList.toggle(`animation-level-${performanceType}`, performanceType in [0, 1, 2]);
}
