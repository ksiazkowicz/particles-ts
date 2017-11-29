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
    import { Vector2d, Color } from 'modules/types';
    
    export class Point {
        id: number;
        position: Vector2d;
        velocity: Vector2d;
        radius: number;
        m: number;
        lifetime: number;
        max_lifetime: number;
        color: Color;
    
        constructor (id: number, position: Vector2d, radius: number, velocity: Vector2d, lifetime: number);
    
        setColor(r: number, g: number, b: number): void;
        exitingX(W: number): boolean;
        exitingY(H: number): boolean;
        bounceX(): void;
        bounceY(): void;
        move(dt: number): void;
        accelerate(a: Vector2d): void;
        draw(canvas: CanvasRenderingContext2D, W: number, H: number): void;
        checkCollision(point: Point): boolean;
        bounceFrom(point: Point): void;
    }
}

declare module 'modules/emitter' {
    import { Vector2d } from 'modules/types';
    import { Point } from 'modules/point';

    export class Emitter {
        position: Vector2d;

        generate(): Point;
    }
}