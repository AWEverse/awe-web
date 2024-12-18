import { REM } from '@/lib/utils/mediaDimensions';
import {
  SIZES,
  SEGMENTS_MAX,
  BLUE,
  EXTRA_GAP_END,
  EXTRA_GAP_START,
  GAP_PERCENT,
  GREEN,
  PURPLE,
  STROKE_WIDTH,
  STROKE_WIDTH_READ,
} from '../constants';

export default function drawGradientCircle({
  canvas,
  size,
  color,
  segmentsCount,
  readSegmentsCount = 0,
  withExtraGap = false,
  readSegmentColor,
  dpr,
  strokeWidth = STROKE_WIDTH,
}: {
  canvas: HTMLCanvasElement;
  size: number;
  color: string;
  segmentsCount: number;
  readSegmentsCount?: number;
  withExtraGap?: boolean;
  readSegmentColor: string;
  dpr: number;
  strokeWidth?: number;
}) {
  if (segmentsCount > SEGMENTS_MAX) {
    const _prepareRound = readSegmentsCount * (SEGMENTS_MAX / segmentsCount);

    readSegmentsCount = Math.round(_prepareRound);
    segmentsCount = SEGMENTS_MAX;
  }

  const strokeModifier = Math.max(Math.max(size - SIZES.large * dpr, 0) / dpr / REM / 1.5, 1) * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  canvas.width = size;
  canvas.height = size;
  const centerCoordinate = size / 2;
  const radius = (size - STROKE_WIDTH * strokeModifier) / 2;
  const segmentAngle = (2 * Math.PI) / segmentsCount;
  const gapSize = (GAP_PERCENT / 100) * (2 * Math.PI);

  const gradient = ctx.createLinearGradient(
    20,
    0,
    Math.ceil(size * Math.cos(Math.PI / 2)),
    Math.ceil(size * Math.sin(Math.PI / 2)),
  );

  const colorStops = color === 'purple' ? PURPLE : color === 'green' ? GREEN : BLUE;

  colorStops.forEach((colorStop, index) => {
    gradient.addColorStop(index / (colorStops.length - 1), colorStop);
  });

  ctx.lineCap = 'round';
  ctx.clearRect(0, 0, size, size);

  const canvasIterate = Array.from({ length: segmentsCount });

  canvasIterate.forEach((_, i) => {
    const isRead = i < readSegmentsCount;
    let startAngle = i * segmentAngle - Math.PI / 2 + gapSize / 2;
    let endAngle = startAngle + segmentAngle - (segmentsCount > 1 ? gapSize : 0);

    if (withExtraGap) {
      // Check if the segment intersects with the extra gap
      if (startAngle >= EXTRA_GAP_START && endAngle <= EXTRA_GAP_END) {
        // Segment is entirely inside the extra gap, skip drawing
        return;
      } else {
        // Adjust start and end angles if the segment intersects with the extra gap
        startAngle = Math.max(startAngle, EXTRA_GAP_START);
        endAngle = Math.min(endAngle, EXTRA_GAP_END);
      }
    }

    ctx.strokeStyle = isRead ? readSegmentColor : gradient;
    ctx.lineWidth = strokeWidth ? strokeWidth : (isRead ? STROKE_WIDTH_READ : STROKE_WIDTH) * strokeModifier;

    ctx.beginPath();
    ctx.arc(centerCoordinate, centerCoordinate, radius, startAngle, endAngle);
    ctx.stroke();
  });
}
