import { Vector2d, Color } from './modules/types';
import { Emitter } from "./modules/emitter";
import { random } from './modules/utils';
import { Point } from './modules/point';

var MAX_TIME: number = 120;

var W: number, H: number;
var dt = 0.1;
var g = 0; //-9.8;

// przygotowanie do rysowania
var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('mycanvas');
W=1024;	H=700;
canvas.width = W; 	
canvas.height = H;
var ctx = canvas.getContext('2d');

var points = Array<Point>();
var i = 0;

var emitters = Array<Emitter>();
emitters.push(new Emitter(new Vector2d(W/6, H/2), MAX_TIME));
emitters.push(new Emitter(new Vector2d((W/6)*5, H/2), MAX_TIME));

var viscosity = 0.00001;

function generate() {
    setTimeout(() => {
        for (let emitter of emitters) {
            let point = emitter.generate();
            point.id = i;
            points.push(point);
            i++;
        }
        generate();
    }, MAX_TIME);
}

// pętla obliczeniowa i rysująca
var loop= function() 
{
    ctx.clearRect(0,0,W,H);
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
            point.draw(ctx, W, H);
        } else {
            points.splice(points.indexOf(point), 1);
        }
    }

    //kontynuuj petle
    requestAnimationFrame(loop);
};

loop();
generate();