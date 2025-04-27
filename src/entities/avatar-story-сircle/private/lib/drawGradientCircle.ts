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

// Predefined gradients cache to avoid recreation
const gradientCache = new Map<string, string[]>();

/**
 * Optimized function to draw gradient circles for avatar story indicators
 */
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
  // Get 2D context once
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Cap segments at maximum and adjust read segments proportionally
  if (segmentsCount > SEGMENTS_MAX) {
    readSegmentsCount = Math.round(readSegmentsCount * (SEGMENTS_MAX / segmentsCount));
    segmentsCount = SEGMENTS_MAX;
  }

  // Calculate key dimensions and angles once
  const strokeModifier = Math.max(Math.max(size - SIZES.large * dpr, 0) / dpr / REM / 1.5, 1) * dpr;
  const actualStrokeWidth = strokeWidth * strokeModifier;
  const centerCoordinate = size / 2;
  const radius = (size - actualStrokeWidth) / 2;
  const segmentAngle = (2 * Math.PI) / segmentsCount;
  const gapSize = (GAP_PERCENT / 100) * (2 * Math.PI);
  const baseAngle = -Math.PI / 2; // Starting at the top (12 o'clock position)

  // Set canvas dimensions (only if they've changed)
  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size;
    canvas.height = size;
  }

  // Clear the canvas
  ctx.clearRect(0, 0, size, size);

  // Set common drawing properties
  ctx.lineCap = 'round';

  // Create or get gradient from cache
  let gradient;
  const colorKey = `${color}-${size}`;
  let colorStops = gradientCache.get(colorKey);

  if (!colorStops) {
    colorStops = color === 'purple' ? PURPLE : color === 'green' ? GREEN : BLUE;
    gradientCache.set(colorKey, colorStops);
  }

  // Create gradient only once, outside the loop
  gradient = ctx.createLinearGradient(
    20,
    0,
    Math.ceil(size * Math.cos(Math.PI / 2)),
    Math.ceil(size * Math.sin(Math.PI / 2)),
  );

  colorStops.forEach((colorStop, index) => {
    gradient.addColorStop(index / (colorStops.length - 1), colorStop);
  });

  // Draw each segment in a batch
  for (let i = 0; i < segmentsCount; i++) {
    const isRead = i < readSegmentsCount;

    // Calculate segment angles
    let startAngle = baseAngle + i * segmentAngle + gapSize / 2;
    let endAngle = startAngle + segmentAngle - (segmentsCount > 1 ? gapSize : 0);

    // Handle extra gap if needed
    if (withExtraGap) {
      // Skip if segment is entirely within the extra gap
      if (startAngle >= EXTRA_GAP_START && endAngle <= EXTRA_GAP_END) {
        continue;
      }

      // Check if segment overlaps with the extra gap
      if (startAngle < EXTRA_GAP_END && endAngle > EXTRA_GAP_START) {
        // Skip segments that would cross the gap
        continue;
      }
    }

    // Set appropriate stroke style and width
    ctx.strokeStyle = isRead ? readSegmentColor : gradient;
    ctx.lineWidth = isRead ? STROKE_WIDTH_READ * strokeModifier : actualStrokeWidth;

    // Draw the segment
    ctx.beginPath();
    ctx.arc(centerCoordinate, centerCoordinate, radius, startAngle, endAngle);
    ctx.stroke();
  }
}
