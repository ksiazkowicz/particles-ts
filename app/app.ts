import { Vector2d, Color } from './modules/types';
import { Emitter } from "./modules/emitter";
import { random } from './modules/utils';
import { Point } from './modules/point';
import { Poor2DRenderer } from './modules/renderer';

var MAX_TIME: number = 120;

var W: number = 1024, H: number = 700;
var dt = 0.1;

// przygotowanie do rysowania
var renderer = new Poor2DRenderer(<HTMLCanvasElement>document.getElementById('mycanvas'), W, H);
var points = Array<Point>();

var emitters = Array<Emitter>();
emitters.push(new Emitter(new Vector2d(0, H/2), 5, 10, MAX_TIME));
emitters.push(new Emitter(new Vector2d(W, H/2), 5, 10, MAX_TIME));

var viscosity = 0.00001;

function generate() {
    setTimeout(() => {
        for (let emitter of emitters) {
            let point = emitter.generate();
            points.push(point);
        }
        generate();
    }, MAX_TIME/2);
}

var loop = function() 
{
    // call renderer
    renderer.render(points);

    let g = random(0, 9.81*2) - 9.81;

    // handle physics
    for (let point of points) {
        point.move(dt);

        let gravity = new Vector2d(0, g).multiply(dt);
        let drag = point.velocity.multiply(point.radius*Math.PI*(-6)*viscosity);

        let center_drag_v = point.position.subtract(new Vector2d(W/2, H/2));
        let k = 1/(center_drag_v.length());
        point.accelerate(gravity.add(drag).add(center_drag_v.multiply(k*k).multiply(-150)));

        if (point.exitingY(H)) point.bounceY();
        if (point.exitingX(W)) point.bounceX();

        for (let point2 of points) {
            if (point.checkCollision(point2))
                point.bounceFrom(point2);
        }

        if (point.lifetime > 0) {
            point.lifetime--;
        } else {
            points.splice(points.indexOf(point), 1);
        }
    }

    //kontynuuj petle
    requestAnimationFrame(loop);
};

loop();
generate();