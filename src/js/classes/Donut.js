export default class Donut {
    constructor(p5, hueOrColour, shape) {
        this.p = p5;
        this.colour = this.isObject(hueOrColour) ? hueOrColour : this.p.color(hueOrColour, 100, 100);
        this.shape = shape;
        this.numOfRotations = 24;
        this.size = 0;
    }

    isObject(variable) {
        return typeof variable === 'object' &&
            variable !== null &&
            !Array.isArray(variable);
    }    

    update() {
        const speed = (this.p.width + this.p.height) / (this.shape === 'ellipse' ? 200 : 500);
        this.size = this.size + speed;
        this.hue = this.hue > 360 ? 0 : this.hue++;
    }

    draw() {
        this.p.translate(this.p.width / 2, this.p.height / 2); 
        this.p.stroke(this.colour);
        this.p.strokeWeight(0.02);
        this.p.noFill();
        for (var i = 0; i < (this.numOfRotations * 2); i ++) {
            for (var j = 0; j <=5; j++) {
                //call the function as detemined by the variable shape
                //rect and ellipse are built in p5.js
                //tri,hexa & octa are defined in this file
                this.p[this.shape](0, 20, this.size + j, this.size + j);
            }
            this.p.rotate(this.p.PI/this.numOfRotations);
        }
        this.p.translate(-this.p.width / 2, -this.p.height / 2);
    }
}