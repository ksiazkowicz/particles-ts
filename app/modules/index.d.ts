declare module 'modules/utils' {
    export function random(minRange: number, maxRange: number): number;
}

declare module 'modules/types' {
    export class Vector2d {
        y: number;
        x: number;
        constructor(x: number, y: number);
        multiply(scalar: number): Vector2d;
        divide(scalar: number): Vector2d;
        subtract(vector: Vector2d): Vector2d;
        add(vector: Vector2d): Vector2d;
        length(): number;
        dot(vector: Vector2d): number;
        normalize(): Vector2d;
    }
    export class Vector3d {
        y: number;
        x: number;
        z: number;
    
        constructor(x: number, y: number, z: number);
        multiply(scalar: number): Vector3d;
        divide(scalar: number): Vector3d;
        subtract(vector: Vector3d): Vector3d;
        add(vector: Vector3d): Vector2d;
        length(): number;
        dot(vector: Vector3d): number;
        normalize(): Vector3d;
        convertTo2d(): Vector2d;
    }
    export class Color {
        r: number;
        g: number;
        b: number;
        constructor(r: number, g: number, b: number);
        darker(x: number): Color;
    
        getRGB(): string;
        getRGBA(alpha: number): string;
    }
}

declare module 'modules/point' {
    import { Vector2d, Vector3d, Color } from 'modules/types';
    
    export class Point {
        id: number;
        position: Vector3d;
        velocity: Vector3d;
        radius: number;
        m: number;
        lifetime: number;
        max_lifetime: number;
        color: Color;
    
        constructor (id: number, position: Vector3d, radius: number, velocity: Vector3d, lifetime: number);
    
        setColor(r: number, g: number, b: number): void;
        exitingX(W: number): boolean;
        exitingY(H: number): boolean;
        bounceX(): void;
        bounceY(): void;
        move(dt: number): void;
        accelerate(a: Vector3d): void;
        checkCollision(point: Point): boolean;
        bounceFrom(point: Point): void;
    }
}

declare module 'modules/emitter' {
    import { Vector3d } from 'modules/types';
    import { Point } from 'modules/point';

    export class Emitter {
        position: Vector3d;

        generate(): Point;
    }
}

declare module 'modules/renderer' {
    import { Point } from 'modules/point';

    export class WebGLRenderer {
        canvas: HTMLCanvasElement;
        constructor(canvas: HTMLCanvasElement, W: number, H: number);
        render(points: Array<Point>): void;
    }

    export class Poor2DRenderer {
        canvas: HTMLCanvasElement;
        constructor(canvas: HTMLCanvasElement, W: number, H: number);
        render(points: Array<Point>): void;
    }
}