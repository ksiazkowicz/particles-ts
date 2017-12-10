import { Vector2d, Vector3d, Color } from './modules/types';
import { Emitter } from "./modules/emitter";
import { random } from './modules/utils';
import { Point } from './modules/point';
import { Poor2DRenderer, WebGLRender } from './modules/renderer';

const viscosity_factor = 0.0001;

class AudioAnalyser {
    analyserNode: AnalyserNode;
    audioContext: AudioContext = new AudioContext();
    audioSource: MediaElementAudioSourceNode;
    audioElement: HTMLAudioElement;
    bufferLength: number;
    dataArray: Float32Array;

    captureAudioData() {
        this.analyserNode.getFloatTimeDomainData(this.dataArray);
    }

    slice(pieces: number, index: number): Float32Array {
        let slice_size = this.dataArray.length/pieces;
        return this.dataArray.slice(index*slice_size, (index+1)*slice_size);
    }

    sumAbs(array: Float32Array) { 
        if (array == undefined) array = this.dataArray; 
        return array.reduce(function(a,b) {return Math.abs(a)+Math.abs(b); }); 
    }
    meanAbs(array: Float32Array) {
        if (array == undefined) array = this.dataArray; 
        return this.sumAbs(array)/this.dataArray.length; 
    }
    sum(array: Float32Array) { 
        if (array == undefined) array = this.dataArray; 
        return array.reduce(function(a,b) {return a+b; }); 
    }
    mean(array: Float32Array) { 
        if (array == undefined) array = this.dataArray; 
        return this.sum(array)/this.dataArray.length; 
    }

    constructor(e: HTMLAudioElement) {
        this.audioElement = e;
        this.audioSource = this.audioContext.createMediaElementSource(e);
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        this.audioSource.connect(this.analyserNode);
        this.audioSource.connect(this.audioContext.destination);
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.dataArray = new Float32Array(this.analyserNode.frequencyBinCount);
        
    }
}

class AudioControls {
    seek: HTMLInputElement;
    container: HTMLElement;
    play: HTMLElement;
    seek_held: boolean = false;

    constructor(audio: HTMLAudioElement, container: HTMLElement) {
        this.container = container;
        this.seek = container.querySelector("#seek");
        this.play = container.querySelector(".play-btn");

        this.seek.addEventListener("mousedown", () => {
            this.seek_held = true;
        })

        this.seek.addEventListener("mouseup", () => {
            audio.currentTime = Number(this.seek.value);
            this.seek_held = false
        })
        audio.addEventListener('timeupdate', () => {
            this.seek.max = String(audio.duration);
            if (!this.seek_held)
                this.seek.value = String(audio.currentTime);
        });
        audio.addEventListener("ended", () => {
            container.classList.remove("playing");
        })
        audio.addEventListener("pause", () => {
            container.classList.remove("playing");
        })
        audio.addEventListener("play", () => {
            container.classList.add("playing");
        })
        this.play.addEventListener("click", () => {
            if (container.classList.contains("playing")) {
                audio.pause();
            } else {
                audio.play();
            }
        })
    }
}

class Application {
    audio: AudioAnalyser;
    renderer: any;
    use_2d: number;

    MAX_TIME: number = 80;
    point_cap: number = 1000;
    dt: number = 0.1;

    emitters: Array<Emitter> = Array<Emitter>();
    points: Array<Point> = Array<Point>();

    setupRenderer() {
        // find Canvas and initialize either 2D or WebGL Renderer
        var canvas = <HTMLCanvasElement>document.getElementById('mycanvas');
        if (this.use_2d == 1) {
            this.renderer = new Poor2DRenderer(canvas);
        } else {
            this.renderer = new WebGLRender(canvas);
        }
        
        // connect resize event
        window.addEventListener('resize', () => {
            this.renderer.resize(window.innerWidth, window.innerHeight, this.renderer.D);
        }, false);
    }

    simulatePhysics() {
        let factor = (this.audio.sumAbs(undefined)/10);
        let viscosity = factor * viscosity_factor;
        this.dt = 0.1 * factor;
        let death_factor = this.points.length / this.point_cap;

        for (let point of this.points) {
            point.move(this.dt);
            let drag = point.velocity.multiply(point.radius*Math.PI*(-6)*viscosity);

            let center_drag_v = point.position.subtract(new Vector3d(this.renderer.W/2, this.renderer.H/2, 0));
            let k = 1/(center_drag_v.length());
            point.accelerate(drag.add(center_drag_v.multiply(k*k).multiply(-20)));

            if (point.exitingY(this.renderer.H)) point.bounceY();
            if (point.exitingX(this.renderer.W)) point.bounceX();
            if (point.exitingZ(this.renderer.D)) point.bounceZ();

            for (let point2 of this.points) {
                if (point.checkCollision(point2))
                    point.bounceFrom(point2);
            }

            if (point.lifetime > 0) {
                point.die(8*(2-death_factor));
            } else {
                this.points.splice(app.points.indexOf(point), 1);
            }
        }
    }

    generateParticles(factor: number) {
        for (let emitter of this.emitters) {
            if (this.points.length >= this.point_cap) {
                continue;
            }
            let speed_factor: number = this.points.length / this.point_cap;
            emitter.lifetime = (this.MAX_TIME*(10*factor))*(1/speed_factor);
            for (var i=0; i<2*factor*100; i++) {
                let point = emitter.generate();
                this.points.push(point);
                point.accelerate(new Vector3d(emitter.initial_velocity.x*speed_factor*random(-20,20), random(-1,1)*speed_factor*200, random(-5, 5)));
            }
        }
    }

    audioDependentGenerator() {
        this.audio.captureAudioData();
        
        if (this.audio.audioElement.currentTime % 2 > (this.points.length / this.point_cap)) {
            var slice_count = 4;
            for (var j=0; j<slice_count; j+=1) {
                let factor = this.audio.meanAbs(this.audio.slice(slice_count, j));
                if (factor > 0.01) app.generateParticles(factor);
            }
        }
    }

    constructor() {
        // get settings from URL
        var url = new URL(window.location.href);
        this.use_2d = parseInt(url.searchParams.get("2d"));

        // setup renderer
        this.setupRenderer();

        // setup scene elements
        this.emitters.push(new Emitter(new Vector3d(this.renderer.W/2, this.renderer.H/2, 0), new Vector3d(-5, 2, 0), 0.5, 4, this.MAX_TIME));
        this.emitters.push(new Emitter(new Vector3d(this.renderer.W/2, this.renderer.H/2, 0), new Vector3d(5, -2, 0), 0.5, 4, this.MAX_TIME));

        // setup Audio Analyser
        var el = <HTMLAudioElement>document.getElementById('audio');
        this.audio = new AudioAnalyser(el);

        el.addEventListener('timeupdate', () => {
            this.audioDependentGenerator();
        })

        // setup Audio Controls
        let container = <HTMLInputElement>(document.getElementsByClassName("audio-controls")[0]);
        let controls = new AudioControls(el, container);

        // start event loop
        var loop = () =>
        {
            // call renderer
            this.renderer.render(this.points);
            this.simulatePhysics();

            // continue loop
            requestAnimationFrame(loop);
        };
        loop();
    }
}

var app = new Application();