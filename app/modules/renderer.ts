import { Point } from "./point";

export class Poor2DRenderer {
    /**
     *  Basic, HTML Canvas renderer (2D)
     */
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    W: number;
    H: number;

    constructor(canvas: HTMLCanvasElement, W: number, H: number) {
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