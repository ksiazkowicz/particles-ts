import { Vector2d, Vector3d, Color } from './modules/types';
import { Emitter } from "./modules/emitter";
import { random } from './modules/utils';
import { Point } from './modules/point';
import { Poor2DRenderer, WebGLRender } from './modules/renderer';

var MAX_TIME: number = 120;

var W: number = 1024, H: number = 700, D: number = 1000;
var dt = 0.1;

// przygotowanie do rysowania
var renderer = new WebGLRender(<HTMLCanvasElement>document.getElementById('mycanvas'), W, H);
var points = Array<Point>();

var emitters = Array<Emitter>();
emitters.push(new Emitter(new Vector3d(W/2, H/2, 0), new Vector3d(-5, 2, 0), 5, 10, MAX_TIME));
emitters.push(new Emitter(new Vector3d(W/2, H/2, 0), new Vector3d(5, 2, 0), 5, 10, MAX_TIME));

var viscosity = 0.00001;

function generate(factor: number) {
    for (let emitter of emitters) {
        emitter.time_to_change = 5-factor*100;
        emitter.max_size = 10 + 5*(factor*20);
        let point = emitter.generate();
        points.push(point);
        point.accelerate(new Vector3d(emitter.initial_velocity.x*factor*100*5, random(-20, 20)*factor*100, 0));
    }
}

var context = new AudioContext;
var el = <HTMLAudioElement>document.getElementById('audio');
var source = context.createMediaElementSource(el);
var analyser = context.createAnalyser();
analyser.fftSize = 2048;
source.connect(analyser);
source.connect(context.destination);
el.play();
var bufferLength = analyser.frequencyBinCount;
const dataArray = new Float32Array(analyser.frequencyBinCount);


var seek = <HTMLInputElement>document.getElementById('seek');
seek.addEventListener("mouseup", () => {
    el.currentTime = Number(seek.value);
})

el.addEventListener('timeupdate', () => {
    seek.max = String(el.duration);
    seek.value = String(el.currentTime);
});

var loop = function() 
{
    // capture audio data
    analyser.getFloatTimeDomainData(dataArray);

    // call renderer
    renderer.render(points);

    for (var j=0; j<bufferLength/10; j+=bufferLength/10) {
        let slice = dataArray.slice(j*(bufferLength/10), (j+1)*(bufferLength/10));
        let factor = slice.reduce(function(a,b) {return Math.abs(a)+Math.abs(b); })/(bufferLength/10);
        if (factor > 0.005) generate(factor);
    }

    // handle physics
    let i = 0;
    for (let point of points) {
        point.move(dt);
        let drag = point.velocity.multiply(point.radius*Math.PI*(-6)*viscosity);

        let center_drag_v = point.position.subtract(new Vector3d(W/2, H/2, 0));
        let k = 1/(center_drag_v.length());
        point.accelerate(drag.add(center_drag_v.multiply(k*k).multiply(-150)));

        if (point.exitingY(H)) point.bounceY();
        if (point.exitingX(W)) point.bounceX();
        if (point.exitingZ(D)) point.bounceZ();

        for (let point2 of points) {
            if (point.checkCollision(point2))
                point.bounceFrom(point2);
        }

        if (point.lifetime > 0) {
            point.lifetime--;
        } else {
            points.splice(points.indexOf(point), 1);
        }
        i++;
    }

    //kontynuuj petle
    requestAnimationFrame(loop);
};

loop();