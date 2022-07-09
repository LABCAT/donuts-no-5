import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';
import SaveJSONToFile from './functions/SaveJSONToFile.js';
import { TetradicColourCalculator, TriadicColourCalculator, ComplementaryColourCalculator } from './functions/ColourCalculators';
import Donut from './classes/Donut.js';

import audio from "../audio/donuts-no-5.ogg";
import midi from "../audio/donuts-no-5.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    const noteSet1 = result.tracks[1].notes; 
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.shapeOptions = ['ellipse', 'equilateral', 'rect', 'pentagon', 'hexagon', 'octagon'];

        p.colourModes = ['random', 'rainbow', 'complementary', 'triadic', 'tetradic'];

        p.hueOptions = [0, 60, 120, 180, 240, 300];

        p.donuts = [];

        p.donutIndex = 0;

        p.loopIndex = 0;

        p.currentShape = null;

        p.currentColourScheme = [];

        p.donutShapeSet = [];

        p.donutColourSchemeSet = [];
        
        p.donutHueSet = [];

        p.outroHues = [];

        p.generatePermutations = (array) => {
            const pemutation = (array, temp) => {
                var i, x;
                if (!array.length) {
                    result.push(temp);
                }
                for (i = 0; i < array.length; i++) {
                    x = array.splice(i, 1)[0];
                    pemutation(array, temp.concat(x));
                    array.splice(i, 0, x);
                }
            }

            var result = [];
            pemutation(array, []);
            return result;
        }

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(0, 0, 0);
            p.colorMode(p.HSB);
            p.rectMode(p.CENTER);
            console.log(window.fxhash);
            console.log(window.fxrand());
            p.randomSeed(window.fxrand() * 1000);
            p.donutShapeSet = p.generatePermutations(p.shapeOptions)[Math.floor(p.random(0, 720))];
            p.donutHueSet = p.generatePermutations(p.hueOptions)[Math.floor(p.random(0, 720))];
            p.donutColourSchemeSet = p.generatePermutations(p.colourModes)[Math.floor(p.random(0, 120))];
            console.log(p.donutShapeSet);
            console.log(Math.floor(p.random(0, 720)));

            p.currentShape = p.donutShapeSet[p.loopIndex];
            p.generateColourScheme(p.donutColourSchemeSet[p.loopIndex]);
            p.loopIndex++
            for (let i = 0; i < 32; i++) {
                // p.outroHues[i] =p.random(p.outroHueOptions[i][0], p.outroHueOptions[i][1]);
                p.outroHues[i] = i;
            }
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){
                p.background(0, 0, 0, 0.05);
                for (let i = 0; i < p.donuts.length; i++) {
                    const donut = p.donuts[i];
                    if(Object.keys(donut).length) {
                        donut.update();
                        donut.draw();
                    }
                }
            }
        }

        p.executeCueSet1 = (note) => {
            const { currentCue } = note;

            if([1, 9, 17, 25, 29].includes(currentCue % 32) || currentCue > 160) {
                if(p.donutIndex > 4){
                    if(currentCue <= 161) {
                        p.donutIndex = 0;
                        p.generateColourScheme();
                        for (let i = 0; i < p.donuts.length; i++) {
                            p.donuts[i] = {};
                        }
                        p.currentShape = p.donutShapeSet[p.loopIndex];
                        if(currentCue < 160) {
                            p.generateColourScheme(p.donutColourSchemeSet[p.loopIndex]);
                        }
                        p.loopIndex++
                    }
                }
                const colour = currentCue > 160 ? p.outroHues[currentCue - 161] : p.currentColourScheme[p.donutIndex];
                console.log(p.currentShape);
                p.donuts[p.donutIndex] = new Donut(p, colour, p.currentShape);
                p.donutIndex++;
            }
        }

        p.generateColourScheme = (mode = false) => {
            const colourMode = mode ? mode : p.random(['random', 'rainbow', 'complementary', 'triadic', 'tetradic']);
            let hueSet = [];
            
            switch (colourMode) {
                case 'complementary':
                    hueSet = ComplementaryColourCalculator(p, p.random(0, p.donutHueSet[1]));
                    break;
                case 'triadic':
                    hueSet = TriadicColourCalculator(p, p.random(0, p.donutHueSet[3]));
                    break;
                case 'tetradic':
                    hueSet = TetradicColourCalculator(p, p.random(0, p.donutHueSet[5]));
                    break;
                case 'rainbow':
                    let hue = p.random(0, p.donutHueSet[0]);
                    for (let i = 0; i < 5; i++) {
                        hueSet.push(hue);
                        hue = hue + 30 > 360 ? hue - 330 : hue + 30;
                    }
                    break;
                default:
                    for (let i = 5; i > 1; i--) {
                        hueSet.push(p.random(0, p.donutHueSet[i]));
                    }
                    break;
            }

            for (let i = 0; i < 5; i++) {
                p.currentColourScheme[i] = hueSet[i % hueSet.length];
            }
        }

        /*
        * function to draw an equilateral triangle with a set width
        * based on x, y co-oridinates that are the center of the triangle
        * @param {Number} x        - x-coordinate that is at the center of triangle
        * @param {Number} y      	- y-coordinate that is at the center of triangle
        * @param {Number} width    - radius of the hexagon
        */
        p.equilateral = (x, y, width) => {
            var x1 = x - (width/2);
            var y1 = y + (width/2);
            var x2 = x;
            var y2 = y - (width/2);
            var x3 = x + (width/2);
            var y3 = y + (width/2);
            p.triangle(x1,y1,x2,y2,x3,y3);
        }

        /*
        * function to draw a pentagon shape
        * adapted from: https://p5js.org/examples/form-regular-polygon.html
        * @param {Number} x        - x-coordinate of the pentagon
        * @param {Number} y      - y-coordinate of the pentagon
        * @param {Number} radius   - radius of the pentagon
        */
        p.pentagon = (x, y, radius) => {
            radius = radius / 2;
            p.angleMode(p.RADIANS);
            var angle = p.TWO_PI / 5;
            p.beginShape();
            for (var a = p.TWO_PI/10; a < p.TWO_PI + p.TWO_PI/10; a += angle) {
                var sx = x + p.cos(a) * radius;
                var sy = y + p.sin(a) * radius;
                p.vertex(sx, sy);
            }
            p.endShape(p.CLOSE);
        }

        /*
        * function to draw a hexagon shape
        * adapted from: https://p5js.org/examples/form-regular-polygon.html
        * @param {Number} x        - x-coordinate of the hexagon
        * @param {Number} y      - y-coordinate of the hexagon
        * @param {Number} radius   - radius of the hexagon
        */
        p.hexagon = (x, y, radius) => {
            radius = radius / 2;
            p.angleMode(p.RADIANS);
            var angle = p.TWO_PI / 6;
            p.beginShape();
            for (var a = p.TWO_PI/12; a < p.TWO_PI + p.TWO_PI/12; a += angle) {
                var sx = x + p.cos(a) * radius;
                var sy = y + p.sin(a) * radius;
                p.vertex(sx, sy);
            }
            p.endShape(p.CLOSE);
        }

        /*
        * function to draw a octagon shape
        * adapted from: https://p5js.org/examples/form-regular-polygon.html
        * @param {Number} x        - x-coordinate of the octagon
        * @param {Number} y      - y-coordinate of the octagon
        * @param {Number} radius   - radius of the octagon
        */
        p.octagon = (x, y, radius) => {
            radius = radius / 2;
            p.angleMode(p.RADIANS);
            var angle = p.TWO_PI / 8;
            p.beginShape();
            for (var a = p.TWO_PI/16; a < p.TWO_PI + p.TWO_PI/16; a += angle) {
                var sx = x + p.cos(a) * radius;
                var sy = y + p.sin(a) * radius;
                p.vertex(sx, sy);
            }
            p.endShape(p.CLOSE);
        }


        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
