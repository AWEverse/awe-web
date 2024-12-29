interface IVector2 {
  readonly x: number;
  readonly y: number;
}

class Vector2 implements IVector2, Iterable<number> {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  // Static Methods
  static max(v1: Vector2, v2: Vector2): Vector2 {
    return new Vector2(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y));
  }

  static min(v1: Vector2, v2: Vector2): Vector2 {
    return new Vector2(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y));
  }

  // Instance Methods (Immutable)
  add(v: IVector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v: IVector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  multiplyScalar(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  dot(v: IVector2): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: IVector2): number {
    return this.x * v.y - this.y * v.x;
  }

  getLength(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  getSquaredLength(): number {
    return this.x ** 2 + this.y ** 2;
  }

  normalize(): Vector2 {
    const length = this.getLength();
    if (length === 0) throw new Error('Cannot normalize a zero-length vector');
    return new Vector2(this.x / length, this.y / length);
  }

  angleBetween(v: IVector2): number {
    const dot = this.dot(v);
    const lengths = this.getLength() * Math.sqrt(v.x ** 2 + v.y ** 2);
    return Math.acos(dot / lengths);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  equals(v: IVector2): boolean {
    return this.x === v.x && this.y === v.y;
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }

  toJSON(): string {
    return JSON.stringify({ x: this.x, y: this.y });
  }

  static fromJSON(json: string): Vector2 {
    const { x, y } = JSON.parse(json);
    return new Vector2(x, y);
  }

  squaredDistance(end: IVector2) {
    return (this.x - end.x) ** 2 + (this.y - end.y) ** 2;
  }

  distance(v: IVector2): number {
    return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
  }

  reflect(normal: Vector2): Vector2 {
    const dot = this.dot(normal);
    return new Vector2(this.x - 2 * dot * normal.x, this.y - 2 * dot * normal.y);
  }

  project(onto: Vector2): Vector2 {
    const scalar = this.dot(onto) / onto.getSquaredLength();
    return new Vector2(scalar * onto.x, scalar * onto.y);
  }

  lerp(to: Vector2, t: number): Vector2 {
    return new Vector2(this.x + (to.x - this.x) * t, this.y + (to.y - this.y) * t);
  }

  transformHomogeneous(
    matrix: [number, number, number, number, number, number, number, number, number],
  ): Vector2 {
    const [a, b, c, d, e, f, g, h, i] = matrix;
    const x = this.x * a + this.y * b + c;
    const y = this.x * d + this.y * e + f;
    const w = this.x * g + this.y * h + i;
    return w !== 0 ? new Vector2(x / w, y / w) : new Vector2(x, y);
  }

  toString(): string {
    return `Vector2(${this.x}, ${this.y})`;
  }

  // Iterator
  *[Symbol.iterator](): Iterator<number> {
    yield this.x;
    yield this.y;
  }

  // Static Helper Methods
  static add(v1: IVector2, v2: IVector2): Vector2 {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }

  static subtract(v1: IVector2, v2: IVector2): Vector2 {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
  }

  static multiplyScalar(v: IVector2, scalar: number): Vector2 {
    return new Vector2(v.x * scalar, v.y * scalar);
  }

  static dot(v1: IVector2, v2: IVector2): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  static cross(v1: IVector2, v2: IVector2): number {
    return v1.x * v2.y - v1.y * v2.x;
  }

  static distance(v1: IVector2, v2: IVector2): number {
    return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
  }

  static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  static one(): Vector2 {
    return new Vector2(1, 1);
  }

  static unitX(): Vector2 {
    return new Vector2(1, 0);
  }

  static unitY(): Vector2 {
    return new Vector2(0, 1);
  }

  static transform(v: IVector2, matrix: [number, number, number, number]): Vector2 {
    const [a, b, c, d] = matrix;
    return new Vector2(v.x * a + v.y * b, v.x * c + v.y * d);
  }
}

export default Vector2;
export type { IVector2 };
