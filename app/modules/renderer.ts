/// <reference path ="../../node_modules/@types/three/index.d.ts"/>

import { Point } from "./point";
import * as THREE from 'three';


export class BaseRenderer {
    /**
     * Base class for all renderers. Keeps common logic.
     */
    canvas: HTMLCanvasElement;
    W: number = window.innerWidth;
    H: number = window.innerHeight;
    D: number = 60;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    resize(W: number, H: number, D: number) {
        this.W = W;
        this.H = H;
        this.D = D;
        this.setupRenderer();
        this.initCamera();
    }

    setupRenderer() {
        console.log("Dummy setupRenderer() called");
    }

    initCamera() {
        console.log("Dummy initCamera() called");
    }

    render(points: Array<Point>): void {
        console.log("Dummy render function called");
    }
}


export class WebGLRender extends BaseRenderer {
    renderer: THREE.WebGLRenderer;
    camera: THREE.Camera;
    scene: THREE.Scene = new THREE.Scene();
    fw: number;
    fh: number;
    texture_loader: THREE.TextureLoader = new THREE.TextureLoader();
    glow: THREE.Texture;
    spotlight: THREE.SpotLight;
    distance: number;
    fov: number = 75;

    setupRenderer() {
        if (this.renderer == undefined) {
            this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
        }
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.W, this.H);
    }

    initCamera() {
        let aspect = this.W / this.H;
        this.camera = new THREE.PerspectiveCamera(this.fov, aspect, 0.1, 1000);

        this.distance = this.D / 2;
        this.fh = 2.0 * this.distance * Math.tan(this.fov * 0.5 * (Math.PI/180));
        this.fw = this.fh * aspect;
        this.camera.position.set(0, 0, this.distance);
    }

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.setupRenderer();
        this.initCamera();

        this.glow = this.texture_loader.load('textures/glow.png')

        this.scene.add(new THREE.HemisphereLight(0xffffff,0xffffff,1.0));

        this.spotlight = new THREE.SpotLight( 0xffffff );
        this.spotlight.position.set(0, 0, this.distance);
        this.spotlight.castShadow = true;
        this.scene.add(this.spotlight);
        this.renderer.render(this.scene, this.camera);
    }

    render(points: Array<Point>): void {
        this.camera.rotateZ(0.01);
        
        for (let point of points) {
            let sphere = point["sphere"];
            if (point.lifetime/point.max_lifetime > 0.1) {
                if (point["sphere"] == undefined){
                    point["sphere"] = new THREE.Sprite(new THREE.SpriteMaterial({ 
                        map: this.glow, 
                        color: point.color.getRGB(), transparent: true, blending: THREE.AdditiveBlending
                    }));
                    this.scene.add(point["sphere"]);
                }
                (<THREE.SpriteMaterial>point["sphere"].material).opacity = point.lifetime/point.max_lifetime;
                point["sphere"].scale.set(point.radius,point.radius,point.radius);
                point["sphere"].position.set(this.fw*((this.W-point.position.x)/this.W)-(this.fw/2), this.fh*((this.H-point.position.y)/this.H)-(this.fh/2), point.position.z);
            } else {
                this.scene.remove(point["sphere"]);
            }

        }

        this.renderer.render(this.scene, this.camera);
    }
}

export class Poor2DRenderer extends BaseRenderer {
    /**
     *  Basic, HTML Canvas renderer (2D)
     */
    context: CanvasRenderingContext2D;

    setupRenderer() {
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.context = this.canvas.getContext("2d");
    }

    initCamera() {}

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.setupRenderer();
        this.initCamera();
    }

    draw(point: Point): void {
        this.context.fillStyle = point.color.getRGBA(point.lifetime/point.max_lifetime);
        this.context.beginPath();
        this.context.arc(this.W-point.position.x,this.H-point.position.y,point.radius,0,2*Math.PI);
        this.context.fill();
    }

    render(points: Array<Point>): void {
        this.context.clearRect(0, 0, this.W, this.H);

        for (let point of points) {
            this.draw(point);
        }
    }
}