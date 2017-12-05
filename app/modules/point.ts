import { Vector3d, Color } from './types';

export class Point {
    position: Vector3d;
    velocity: Vector3d;
    radius: number;
    m: number;
    lifetime: number;
    max_lifetime: number;
    color: Color;

    constructor (position: Vector3d, radius: number, velocity: Vector3d, lifetime: number) {
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

    exitingZ(D: number): boolean {
        let result = this.position.z <= this.radius || this.position.z >= D - this.radius;
        if (result) this.position.z = this.position.z <= this.radius ? this.radius : D - this.radius;
        return result;
    }

    bounceX(): void {
        this.velocity.x = -this.velocity.x;
    }
    bounceY(): void {
        this.velocity.y = -this.velocity.y;
    }
    bounceZ(): void {
        this.velocity.z = -this.velocity.z;
    }

    move(dt: number): void {
        this.position = this.position.add(this.velocity.multiply(dt));
    }
    accelerate(a: Vector3d): void {
        this.velocity = this.velocity.add(a.divide(this.m));
    }
    checkCollision(point: Point): boolean {
        if (point == this) return false;
        return this.position.subtract(point.position).length() < (this.radius + point.radius);
    }

    bounceFrom(point: Point) {
        // based on https://stackoverflow.com/questions/345838/ball-to-ball-collision-detection-and-handling
        // get the mtd
        let delta: Vector3d = this.position.subtract(point.position);
        let d = delta.length();

        // minimum translation distance to push balls apart after intersecting
        let mtd: Vector3d = delta.multiply(((this.radius + point.radius)-d)/d)

        // resolve intersection --
        // inverse mass quantities
        let im1: number = 1 / this.m;
        let im2: number = 1 / point.m;

        // push-pull them apart based off their mass
        this.position = this.position.add(mtd.multiply(im1 / (im1 + im2)));
        point.position = point.position.subtract(mtd.multiply(im2 / (im1 + im2)));

        // impact speed
        let v: Vector3d = this.velocity.subtract(point.velocity);
        let vn: number = v.dot(mtd.normalize());

        // sphere intersecting but moving away from each other already
        if (vn > 0.0) return;

        // collision impulse
        let i: number = (-(1.0 + 0.8) * vn) / (im1 + im2);
        let impulse: Vector3d = mtd.normalize().multiply(i);

        // change in momentum
        this.velocity = this.velocity.add(impulse.multiply(im1));
        point.velocity = point.velocity.subtract(impulse.multiply(im2));
    }
}