class Vector2d {
    y: number;
    x: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    multiply(scalar: number) {
        return new Vector2d(this.x*scalar, this.y*scalar);
    }
    divide(scalar: number) {
        return new Vector2d(this.x/scalar, this.y/scalar);
    }
    subtract(vector: Vector2d) {
        return new Vector2d(this.x - vector.x, this.y - vector.y);
    }
    add(vector: Vector2d) {
        return new Vector2d(this.x + vector.x, this.y + vector.y);
    }
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    dot(vector: Vector2d): number {
        return (this.x*vector.x) + (this.y*vector.y);
    }
    normalize() {
        return this.divide(this.length());
    }

}

class Color {
    r: number;
    g: number;
    b: number;
    constructor(r: number, g: number, b: number) {
        this.r = r; this.g = g; this.b = b;
    }
    darker(x: number) {
        let dr = this.r - x;
        let dg = this.g - x;
        let db = this.b - x;
        return new Color(dr > 0 ? dr : 0, dg > 0 ? dg : 0, db > 0 ? db : 0);
    }

    getRGB() : string {
        return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
    }
    getRGBA(alpha: number) : string {
        return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + alpha + ")";
    }
}


class Point {
    id: number;
    position: Vector2d;
    velocity: Vector2d;
    radius: number;
    m: number;
    color: Color;

    constructor (id: number, position: Vector2d, radius: number, velocity: Vector2d) {
        this.id = id;
        this.position = position;
        this.m = radius/20;
        if (this.m < 0.5)
            this.m = 0.5;

        this.radius = radius;
        this.velocity = velocity;
    }

    setColor(r: number, g: number, b: number): void {
        this.color = new Color(r, g, b);
    }



    exitingX(W: number): boolean {
        let result = this.position.x <= this.radius || this.position.x >= W - this.radius;
        if (result) this.position.x = this.position.x <= this.radius ? this.radius : W - this.radius;
        return result;
    }

    exitingY(H: number): boolean {
        let result = this.position.y <= this.radius || this.position.y >= H - this.radius;
        if (result) this.position.y = this.position.y <= this.radius ? this.radius : H - this.radius;
        return result;
    }

    bounceX(): void {
        this.velocity.x = -this.velocity.x;
    }
    bounceY(): void {
        this.velocity.y = -this.velocity.y;
    }

    move(dt: number): void {
        this.position = this.position.add(this.velocity.multiply(dt));
    }
    accelerate(a: Vector2d): void {
        this.velocity = this.velocity.add(a.divide(this.m));
    }
    draw(canvas: CanvasRenderingContext2D, W: number, H: number): void {
        let nr = this.radius + 20;
        let rV = new Vector2d(nr, nr);

        let beginV = new Vector2d(W-this.position.x, H-this.position.y).subtract(rV);
        let gradV = beginV.add(rV);

        let grad = ctx.createRadialGradient(gradV.x,gradV.y,0,
                                            gradV.x,gradV.y,nr);

        grad.addColorStop(0, this.color.getRGBA(1));
        grad.addColorStop(0.9, this.color.darker(-20).getRGBA(0.8));
        grad.addColorStop(1, this.color.darker(-80).getRGBA(0));
      
        canvas.fillStyle = grad;
        canvas.beginPath();
        canvas.fillRect(beginV.x, beginV.y, nr*2, nr*2);
        //canvas.strokeRect(beginV.x, beginV.y, nr*2, nr*2);
        //canvas.arc(W-this.position.x,H-this.position.y,this.radius,0,2*Math.PI);
        canvas.stroke();
    }

    checkCollision(point: Point): boolean {
        if (point.id == this.id) return false;
        return this.position.subtract(point.position).length() < (this.radius + point.radius);
    }

    bounceFrom(point: Point) {
        // based on https://stackoverflow.com/questions/345838/ball-to-ball-collision-detection-and-handling
        // get the mtd
        let delta: Vector2d = this.position.subtract(point.position);
        let d = delta.length();

        // minimum translation distance to push balls apart after intersecting
        let mtd: Vector2d = delta.multiply(((this.radius + point.radius)-d)/d)

        // resolve intersection --
        // inverse mass quantities
        let im1: number = 1 / this.m;
        let im2: number = 1 / point.m;

        // push-pull them apart based off their mass
        this.position = this.position.add(mtd.multiply(im1 / (im1 + im2)));
        point.position = point.position.subtract(mtd.multiply(im2 / (im1 + im2)));

        // impact speed
        let v: Vector2d = this.velocity.subtract(point.velocity);
        let vn: number = v.dot(mtd.normalize());

        // sphere intersecting but moving away from each other already
        if (vn > 0.0) return;

        // collision impulse
        let i: number = (-(1.0 + 0.8) * vn) / (im1 + im2);
        let impulse: Vector2d = mtd.normalize().multiply(i);

        // change in momentum
        this.velocity = this.velocity.add(impulse.multiply(im1));
        point.velocity = point.velocity.subtract(impulse.multiply(im2));
    }
}

function random(minRange: number, maxRange: number): number {
    return Math.floor((Math.random() * maxRange) + minRange);
}

var W: number, H: number;
var dt = 0.1;
var g = -9.8;

// przygotowanie do rysowania
let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('mycanvas');
W=640;	H=480;
canvas.width = W; 	
canvas.height = H;
var ctx = canvas.getContext('2d');

var points = Array<Point>();
var max_points = 40;
var i = 0;

var center: Vector2d = new Vector2d(W/2, H/2);

var viscosity = 0.00001;

function generate() {
    setTimeout(() => {
        let r = random(5, 30);
        let point = new Point(i, center, r, new Vector2d(random(-20, 20), random(-5, 5)));
        points.push(point);
        point.setColor(random(0,180), random(0,180), random(0,180));
        i++;

        if (points.length > max_points)
            points.shift();

        generate();
    }, 200);
}

// pętla obliczeniowa i rysująca
var loop=function() 
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
                
        //rysowanie punktu
        point.draw(ctx, W, H);
    }

    //kontynuuj petle
    requestAnimationFrame(loop);
};

// start
loop();
generate();