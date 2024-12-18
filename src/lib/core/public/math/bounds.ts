import Vector2 from './vector2';

class Bounds<T extends number> {
  public min: Vector2;
  public max: Vector2;

  constructor() {
    this.min = new Vector2(Number.MAX_VALUE, Number.MAX_VALUE);
    this.max = new Vector2(-Number.MAX_VALUE, -Number.MAX_VALUE);
  }

  // Add a vector to update min and max bounds
  addVector(v: Vector2): Bounds<T> {
    this.min = Vector2.min(this.min, v);
    this.max = Vector2.max(this.max, v);
    return this;
  }

  // Merge another bounds instance into this one
  addBounds(b: Bounds<T>): Bounds<T> {
    this.min = Vector2.min(this.min, b.min);
    this.max = Vector2.max(this.max, b.max);
    return this;
  }

  // Check if this bounds contains another bounds
  contains(b: Bounds<T>): boolean {
    return (
      this.min.x <= b.min.x &&
      this.min.y <= b.min.y &&
      this.max.x >= b.max.x &&
      this.max.y >= b.max.y
    );
  }

  // Check if this bounds intersects with another bounds
  intersect(b: Bounds<T>): boolean {
    return !(
      this.min.x > b.max.x ||
      this.max.x < b.min.x ||
      this.min.y > b.max.y ||
      this.max.y < b.min.y
    );
  }

  // Get the center point of the bounds
  getCenter(): Vector2 {
    return new Vector2((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2);
  }

  // Check if this bounds is outside another bounds
  isOutside(b: Bounds<T>): boolean {
    return (
      this.min.x > b.max.x || this.max.x < b.min.x || this.min.y > b.max.y || this.max.y < b.min.y
    );
  }

  // Get the size of the bounds (width and height)
  getSize(): Vector2 {
    return this.max.subtract(this.min);
  }

  // Calculate the surface area (area of a rectangle in 2D)
  getSurfaceArea(): number {
    const size = this.getSize();
    return size.x * size.y;
  }

  // Shift the bounds by an offset (absolute translation)
  toAbsolute(offset: Vector2): Bounds<T> {
    const newBounds = new Bounds<T>();
    newBounds.min = this.min.add(offset);
    newBounds.max = this.max.add(offset);
    return newBounds;
  }

  // Shift the bounds by an offset (relative translation)
  toRelative(offset: Vector2): Bounds<number> {
    const newBounds = new Bounds<number>();
    newBounds.min = this.min.subtract(offset);
    newBounds.max = this.max.subtract(offset);
    return newBounds;
  }

  // Convert bounds to string representation
  toString(value?: string): string {
    if (!value) {
      return `Bounds(min: ${this.min.toString()}, max: ${this.max.toString()})`;
    }

    return value.replace(/\${(min|max)}/g, (_, p1) => {
      return p1 === 'min' ? this.min.toString() : this.max.toString();
    });
  }
}

export default Bounds;
