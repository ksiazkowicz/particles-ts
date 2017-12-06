/// <reference path ="../../node_modules/@types/three/index.d.ts"/>

import { Point } from "./point";
import * as THREE from 'three';


export class WebGLRender {
    canvas: HTMLCanvasElement;
    renderer: THREE.WebGLRenderer;
    camera: THREE.Camera;
    scene: THREE.Scene;
    fw: number;
    fh: number;
    W: number;
    H: number;
    D: number;
    texture_loader: THREE.TextureLoader;
    glow: THREE.Texture;

    constructor(canvas: HTMLCanvasElement, W: number, H: number, D: number) {
        this.canvas = canvas;
        this.renderer = new THREE.WebGLRenderer({canvas: canvas});
        this.renderer.setPixelRatio( window.devicePixelRatio);
        this.renderer.setSize(W, H);
        this.W = W;
        this.H = H;
        this.D = D;
        let fov = 75;

        this.texture_loader =  new THREE.TextureLoader();
        this.glow = this.texture_loader.load('textures/glow.png')

        this.scene = new THREE.Scene();
        let aspect = this.renderer.context.canvas.width / this.renderer.context.canvas.height;

        this.scene.add(new THREE.HemisphereLight(0xffffff,0xffffff,1.0));
        //this.scene.add(new THREE.AmbientLight("rgb(200, 32, 60)"));
        this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);

        let distance = D/2;
        this.fh = 2.0 * distance * Math.tan(fov * 0.5 * (Math.PI/180));
        this.fw = this.fh * aspect;
        this.camera.position.set(0, 0, distance);

        var spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.position.set(0, 0, distance);
        spotLight.castShadow = true;
        this.scene.add( spotLight );

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

export class Poor2DRenderer {
    /**
     *  Basic, HTML Canvas renderer (2D)
     */
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    W: number;
    H: number;

    constructor(canvas: HTMLCanvasElement, W: number, H: number, D: number) {
        this.canvas = canvas;
        this.canvas.width = W;
        this.canvas.height = H;
        this.W = this.canvas.width;
        this.H = this.canvas.height;
        this.context = canvas.getContext("2d");
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