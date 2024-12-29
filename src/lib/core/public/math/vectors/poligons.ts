import { EPSILON, TOLERANCE } from '../constants';
import { clamp01 } from '../utils';
import { IVector2 } from '../vector2';

export const isPointInPolygon = (point: IVector2, polygon: IVector2[]): boolean => {
  let minX = polygon[0].x,
    maxX = polygon[0].x;
  let minY = polygon[0].y,
    maxY = polygon[0].y;

  for (let i = 1; i < polygon.length; i++) {
    const { x, y } = polygon[i];

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
    return false;
  }

  let count = 0;
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const v1 = polygon[i];
    const v2 = polygon[i + 1 === n ? 0 : i + 1];

    const [lower, upper] = v1.y < v2.y ? [v1, v2] : [v2, v1];

    if (
      Math.abs((point.y - v1.y) * (v2.x - v1.x) - (point.x - v1.x) * (v2.y - v1.y)) < EPSILON &&
      point.x >= Math.min(v1.x, v2.x) &&
      point.x <= Math.max(v1.x, v2.x) &&
      point.y >= Math.min(v1.y, v2.y) &&
      point.y <= Math.max(v1.y, v2.y)
    ) {
      return true;
    }

    if (lower.y <= point.y + EPSILON && point.y < upper.y) {
      const xIntersection =
        lower.x + ((upper.x - lower.x) * (point.y - lower.y)) / (upper.y - lower.y);

      if (point.x < xIntersection) {
        count++;
      }
    }
  }

  return count % 2 === 1;
};

export const distanceToLineSegment = (point: IVector2, start: IVector2, end: IVector2): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared < EPSILON) {
    const dxPoint = point.x - start.x;
    const dyPoint = point.y - start.y;

    return Math.sqrt(dxPoint * dxPoint + dyPoint * dyPoint);
  }

  const t = clamp01(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared);

  const projX = start.x + t * dx;
  const projY = start.y + t * dy;

  const distX = point.x - projX;
  const distY = point.y - projY;

  return Math.sqrt(distX * distX + distY * distY);
};

export const simplifyPolygon = (polygon: IVector2[], tolerance: number = TOLERANCE): IVector2[] => {
  const n = polygon.length;

  const rec = (start: number, end: number): IVector2[] => {
    let maxDist = 0;
    let index = start;

    for (let i = start + 1; i < end; i++) {
      const dist = pointLineDistance(polygon[i], polygon[start], polygon[end]);

      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }

    if (maxDist > tolerance) {
      const left = rec(start, index);
      const right = rec(index, end);

      return [...left.slice(0, -1), polygon[index], ...right];
    }

    return [polygon[start], polygon[end]];
  };

  return rec(0, n - 1);
};

export const pointLineDistance = (p: IVector2, v: IVector2, w: IVector2): number => {
  const dx = w.x - v.x;
  const dy = w.y - v.y;
  const l2 = dx * dx + dy * dy;

  if (l2 === 0) {
    return Math.sqrt((p.x - v.x) ** 2 + (p.y - v.y) ** 2);
  }

  const t = clamp01(((p.x - v.x) * dx + (p.y - v.y) * dy) / l2);

  const projX = v.x + t * dx;
  const projY = v.y + t * dy;

  const dxP = p.x - projX;
  const dyP = p.y - projY;

  return Math.sqrt(dxP * dxP + dyP * dyP);
};
