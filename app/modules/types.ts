export class Vector2d {
    y: number;
    x: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    multiply(scalar: number) {
        return new Vector2d(this.x*scalar, this.y*scalar);
    }
    divide(scalar: number) {
        return new Vector2d(this.x/scalar, this.y/scalar);
    }
    subtract(vector: Vector2d) {
        return new Vector2d(this.x - vector.x, this.y - vector.y);
    }
    add(vector: Vector2d) {
        return new Vector2d(this.x + vector.x, this.y + vector.y);
    }
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    dot(vector: Vector2d): number {
        return (this.x*vector.x) + (this.y*vector.y);
    }
    normalize() {
        return this.divide(this.length());
    }
}

export class Vector3d {
    y: number;
    x: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    multiply(scalar: number) {
        return new Vector3d(this.x*scalar, this.y*scalar, this.z*scalar);
    }
    divide(scalar: number) {
        return new Vector3d(this.x/scalar, this.y/scalar, this.z/scalar);
    }
    subtract(vector: Vector3d) {
        return new Vector3d(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    }
    add(vector: Vector3d) {
        return new Vector3d(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    }
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }
    dot(vector: Vector3d): number {
        return (this.x*vector.x) + (this.y*vector.y) + (this.z*vector.z);
    }
    normalize() {
        return this.divide(this.length());
    }
    convertTo2d() {
        return new Vector2d(this.x, this.y);
    }
}

export class Color {
    r: number;
    g: number;
    b: number;
    constructor(r: number, g: number, b: number) {
        this.r = r; this.g = g; this.b = b;
    }
    darker(x: number): Color {
        let dr = this.r - x;
        let dg = this.g - x;
        let db = this.b - x;
        return new Color(dr > 0 ? dr : 0, dg > 0 ? dg : 0, db > 0 ? db : 0);
    }

    getRGB(): string {
        return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
    }
    getRGBA(alpha: number): string {
        return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + alpha + ")";
    }
}