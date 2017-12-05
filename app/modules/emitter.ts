import { Vector3d, Color } from './types';
import { Point } from './point';
import { random } from './utils';

export class Emitter {
    position: Vector3d;
    initial_velocity: Vector3d;
    lifetime: number = 120;
    max_size: number;
    min_size: number;

    base_color: Color;
    time_to_change: number = 20;
    time: number = 0;

    constructor(position: Vector3d, initial_velocity: Vector3d, min_size: number, max_size: number, lifetime: number) {
        this.lifetime = lifetime;
        this.position = position;
        this.min_size = min_size;
        this.max_size = max_size;
        this.base_color = new Color(random(100,140), random(100, 140), random(100, 140));
        this.initial_velocity = initial_velocity;
    }

    applyRandomChange() {
        let choose = random(0, 9);
        if (choose <= 3) {
            this.base_color.r = random(100,140);
        } else if (choose <= 6) {
            this.base_color.g = random(100,140);
        } else {
            this.base_color.b = random(100, 140);
        }
    }

    getColor(): Color {
        return new Color(this.base_color.r + (random(0, 80)), this.base_color.g + (random(0, 80)), this.base_color.b + (random(0, 80)));
    }

    generate() {
        if (this.time >= this.time_to_change) {
            this.time = 0;
            this.applyRandomChange();
        } else {
            this.time++;
        }
        let r = random(this.min_size, this.max_size);
        let point = new Point(this.position, r, this.initial_velocity, this.lifetime);
        let c: Color = this.getColor();
        point.setColor(c.r, c.g, c.b);
        return point;
    }
}