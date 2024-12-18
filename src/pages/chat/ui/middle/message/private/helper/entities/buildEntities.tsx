import { ApiMessageEntity } from '@/@types/api/types/messages';
import { ObserveFn } from '@/lib/hooks/sensors/useIntersectionObserver';

interface IRenderEntity {
  text: string;
  entities?: ApiMessageEntity[];
  highlight?: string;
  emojiSize?: number;
  shouldRenderAsHtml?: boolean;
  containerId?: string;
  isSimple?: boolean;
  isProtected?: boolean;
  noLineBreaks?: boolean;
  observeIntersectionForLoading?: ObserveFn;
  observeIntersectionForPlaying?: ObserveFn;
  withTranslucentThumbs?: boolean;
  sharedCanvasRef?: React.RefObject<HTMLCanvasElement>;
  sharedCanvasHqRef?: React.RefObject<HTMLCanvasElement>;
  cacheBuster?: string;
  forcePlayback?: boolean;
  focusedQuote?: string;
  isInSelectMode?: boolean;
}

function buildEntities({
  text,
  entities,
  highlight,
  emojiSize,
  shouldRenderAsHtml,
  containerId,
  isSimple,
  isProtected,
  noLineBreaks,
  observeIntersectionForLoading,
  observeIntersectionForPlaying,
  withTranslucentThumbs,
  sharedCanvasRef,
  sharedCanvasHqRef,
  cacheBuster,
  forcePlayback,
  focusedQuote,
  isInSelectMode,
}: IRenderEntity) {
  if (!entities) return <></>;

  return <></>;
}
