import { Vector2d } from './types';
import { Point } from './point';
import { random } from './utils';

export class Emitter {
    position: Vector2d;
    lifetime: number = 120;
    max_size: number;
    min_size: number;

    constructor(position: Vector2d, min_size: number, max_size: number, lifetime: number) {
        this.lifetime = lifetime;
        this.position = position;
        this.min_size = min_size;
        this.max_size = max_size;
    }

    generate() {
        let r = random(this.min_size, this.max_size);
        let point = new Point(this.position, r, new Vector2d(random(-20, 20), random(-5, 5)), this.lifetime);
        point.setColor(random(0,180), random(0,180), random(0,180));
        return point;
    }
}