import { Vector2d } from './types';
import { Point } from './point';
import { random } from './utils';

export class Emitter {
    position: Vector2d;
    lifetime: number = 120;

    constructor(position: Vector2d, lifetime: number) {
        this.lifetime = lifetime;
        this.position = position;
    }

    generate() {
        let r = random(5,30);
        let point = new Point(0, this.position, r, new Vector2d(random(-20, 20), random(-5, 5)), this.lifetime);
        point.setColor(random(0,180), random(0,180), random(0,180));
        return point;
    }
}