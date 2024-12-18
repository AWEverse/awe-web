interface IVector2 {
  readonly x: number;
  readonly y: number;
}

class Vector2 implements IVector2, Iterable<number> {
  static max(prevMax: Vector2, v: Vector2): Vector2 {
    return new Vector2(Math.max(prevMax.x, v.x), Math.max(prevMax.y, v.y));
  }

  static min(prevMin: Vector2, v: Vector2): Vector2 {
    return new Vector2(Math.min(prevMin.x, v.x), Math.min(prevMin.y, v.y));
  }

  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  // Instance Methods (Immutable)
  add(other: IVector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  subtract(other: IVector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  multiplyScalar(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  dot(other: IVector2): number {
    return this.x * other.x + this.y * other.y;
  }

  cross(other: IVector2): number {
    return this.x * other.y - this.y * other.x;
  }

  getLength(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  getSquaredLength(): number {
    return this.x ** 2 + this.y ** 2; // Faster for comparisons
  }

  normalize(): Vector2 {
    const length = this.getLength();
    if (length === 0) throw new Error('Cannot normalize a vector with length 0');
    return new Vector2(this.x / length, this.y / length);
  }

  angleBetween(other: IVector2): number {
    const dotProduct = this.dot(other);
    const lengthsProduct = this.getLength() * new Vector2(other.x, other.y).getLength();
    return Math.acos(dotProduct / lengthsProduct);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  equals(other: IVector2): boolean {
    return this.x === other.x && this.y === other.y;
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

  toString(): string {
    return `Vector2(${this.x}, ${this.y})`;
  }

  // Iterator
  *[Symbol.iterator](): Iterator<number> {
    yield this.x;
    yield this.y;
  }

  // Static Methods
  static add(v1: IVector2, v2: IVector2): Vector2 {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }

  static subtract(v1: IVector2, v2: IVector2): Vector2 {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
  }

  static multiplyScalar(vector: IVector2, scalar: number): Vector2 {
    return new Vector2(vector.x * scalar, vector.y * scalar);
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

  static squaredDistance(v1: IVector2, v2: IVector2): number {
    return (v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2; // Faster than calculating actual distance
  }

  static angleBetween(v1: IVector2, v2: IVector2): number {
    const dotProduct = Vector2.dot(v1, v2);
    const lengthsProduct =
      new Vector2(v1.x, v1.y).getLength() * new Vector2(v2.x, v2.y).getLength();
    return Math.acos(dotProduct / lengthsProduct);
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

  // Matrix Transformation (2x2 matrix)
  transform(matrix: [number, number, number, number]): Vector2 {
    const [a, b, c, d] = matrix;
    return new Vector2(this.x * a + this.y * b, this.x * c + this.y * d);
  }

  // Static method for transformation
  static transform(v: IVector2, matrix: [number, number, number, number]): Vector2 {
    return new Vector2(v.x * matrix[0] + v.y * matrix[1], v.x * matrix[2] + v.y * matrix[3]);
  }
}

export default Vector2;
export type { IVector2 };
