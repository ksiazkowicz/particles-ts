import { Vector2d, Color } from './types';

export class Point {
    id: number;
    position: Vector2d;
    velocity: Vector2d;
    radius: number;
    m: number;
    lifetime: number;
    max_lifetime: number;
    color: Color;

    constructor (id: number, position: Vector2d, radius: number, velocity: Vector2d, lifetime: number) {
        this.id = id;
        this.position = position;
        this.m = radius/20;
        if (this.m < 0.5)
            this.m = 0.5;

        this.radius = radius;
        this.velocity = velocity;
        this.lifetime = lifetime;
        this.max_lifetime = lifetime;
    }

    setColor(r: number, g: number, b: number): void {
        this.color = new Color(r, g, b);
    }

    exitingX(W: number): boolean {
        let result = this.position.x <= this.radius || this.position.x >= W - this.radius;
        if (result) this.position.x = this.position.x <= this.radius ? this.radius : W - this.radius;
        return result;
    }

    exitingY(H: number): boolean {
        let result = this.position.y <= this.radius || this.position.y >= H - this.radius;
        if (result) this.position.y = this.position.y <= this.radius ? this.radius : H - this.radius;
        return result;
    }

    bounceX(): void {
        this.velocity.x = -this.velocity.x;
    }
    bounceY(): void {
        this.velocity.y = -this.velocity.y;
    }

    move(dt: number): void {
        this.position = this.position.add(this.velocity.multiply(dt));
    }
    accelerate(a: Vector2d): void {
        this.velocity = this.velocity.add(a.divide(this.m));
    }
    draw(canvas: CanvasRenderingContext2D, W: number, H: number): void {
        canvas.fillStyle = this.color.getRGBA(this.lifetime/this.max_lifetime);
        canvas.beginPath();
        canvas.arc(W-this.position.x,H-this.position.y,this.radius,0,2*Math.PI);
        canvas.fill();
    }
    checkCollision(point: Point): boolean {
        if (point.id == this.id) return false;
        return this.position.subtract(point.position).length() < (this.radius + point.radius);
    }

    bounceFrom(point: Point) {
        // based on https://stackoverflow.com/questions/345838/ball-to-ball-collision-detection-and-handling
        // get the mtd
        let delta: Vector2d = this.position.subtract(point.position);
        let d = delta.length();

        // minimum translation distance to push balls apart after intersecting
        let mtd: Vector2d = delta.multiply(((this.radius + point.radius)-d)/d)

        // resolve intersection --
        // inverse mass quantities
        let im1: number = 1 / this.m;
        let im2: number = 1 / point.m;

        // push-pull them apart based off their mass
        this.position = this.position.add(mtd.multiply(im1 / (im1 + im2)));
        point.position = point.position.subtract(mtd.multiply(im2 / (im1 + im2)));

        // impact speed
        let v: Vector2d = this.velocity.subtract(point.velocity);
        let vn: number = v.dot(mtd.normalize());

        // sphere intersecting but moving away from each other already
        if (vn > 0.0) return;

        // collision impulse
        let i: number = (-(1.0 + 0.8) * vn) / (im1 + im2);
        let impulse: Vector2d = mtd.normalize().multiply(i);

        // change in momentum
        this.velocity = this.velocity.add(impulse.multiply(im1));
        point.velocity = point.velocity.subtract(impulse.multiply(im2));
    }
}