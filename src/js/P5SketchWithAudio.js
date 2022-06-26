import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

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
                    console.log(result);
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

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);

            p.background(0);
            p.colorMode(p.HSB);
            p.rectMode(p.CENTER);
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.colourMode = 'rainbow';

        p.colourModeOptions = ['rainbow', 'hue', 'monochromatic', 'complementary', 'triadic'];

        p.colourModeHue = 0;

        p.bgColour = 0;

        p.xDonuts = p.random([3,4,6]);

        p.donutSize = 0;

        p.donutOpacity = 1;

        p.shapeOptions = ['rect', 'ellipse', 'equilateral', 'pentagon', 'hexagon', 'octagon'];

        p.rotationOptions = [24, 48];

        p.executeCueSet1 = (note) => {
            
            const { currentCue } = note;
            p.background(p.bgColour);
            p.donutSize = p.donutSize + 4 ;
            // if(currentCue < 65) {
            //     const heightDivisor = p.xDonuts === 6 ? 8 : p.xDonuts === 4 ? 6 : 4;
                
            //     p.donutOpacity = 1 / 64 * currentCue;
            // }
            // else if(currentCue % 32 === 1) {
            //     p.xDonuts = p.random([3,4,6]);
            //     const options = p.colourModeOptions.slice(),
            //         heightDivisor = p.xDonuts === 6 ? 8 : p.xDonuts === 4 ? 6 : 4;
            //     options.splice(options.indexOf(p.colourMode), 1)
            //     p.colourMode = p.random(options); 
            //     p.colourModeHue = p.random(0, 360); 
            //     // p.donutSize = p.height / heightDivisor;
            // }

            // if(currentCue < 185) {
            //     p.background(p.bgColour);
            // }
            // else {
            //     p.colourMode = 'rainbow';
            // }

            const yLoops = p.xDonuts % 3 === 0 ? (p.xDonuts / 3 * 2) : 3;

            // for (let x = 1; x <= p.xDonuts; x++) {
            //     for (let y = 1; y <= yLoops; y++) {
            //         const numOfRotations = p.random(p.rotationOptions),
            //             shape = p.random(p.shapeOptions), 
            //             translateX = p.width / p.xDonuts * x - p.width / (p.xDonuts * 2),
            //             translateY = p.height / yLoops * y - p.height / (yLoops * 2);
            //         let colour = null;
            //          switch (p.colourMode) {
            //             case 'monochromatic':
            //                 colour = p.color(p.colourModeHue, p.random(50, 100), p.random(50, 100), p.donutOpacity)
            //                 break;
            //             case 'complementary':
            //                 const complementaryHue = p.colourModeHue + 180 > 360 ? p.colourModeHue - 180 : p.colourModeHue + 180,
            //                     hue = p.random([p.colourModeHue, complementaryHue]);
            //                 colour = p.color(hue, p.random(50, 100), p.random(50, 100), p.donutOpacity)
            //                 break;
            //             case 'triadic':
            //                 const hue2 = p.colourModeHue + 120 > 360 ? p.colourModeHue - 120 : p.colourModeHue + 120,
            //                     hue3 = hue2 + 120 > 360 ? p.colourModeHue - 240 : p.colourModeHue + 120,
            //                     triadicHue = p.random([p.colourModeHue, hue2, hue3]);
            //                 colour = p.color(triadicHue, p.random(50, 100), p.random(50, 100), p.donutOpacity)
            //                 break;
            //             default:
            //                 colour = p.color(p.random(0, 360), 100, 100, p.donutOpacity)
            //                 break;
            //         }
                    
            //     }
            // }
            const colour = p.color(p.random(0, 360), 100, 100, p.donutOpacity),
                numOfRotations = p.random(p.rotationOptions);

            p.translate(p.width / 2, p.height / 2); 
            p.drawDonut(colour, numOfRotations);
            p.translate(-p.width / 2, -p.height / 2);
        }

        //this is where the donut is created
        p.drawDonut = (colour, numOfRotations) => {
            const  shape = p.random(p.shapeOptions);
            p.stroke(colour);
            p.strokeWeight(0.3);
            p.noFill();
            for (var i = 0; i < (numOfRotations * 2); i ++) {
                if(p.colourMode === 'rainbow') {
                    const colour = p.color(p.random(0, 360), 100, 100, p.donutOpacity)
                    p.stroke(colour);
                }
                for (var j = 0; j <=5; j++) {
                    //call the function as detemined by the variable shape
                    //rect and ellipse are built in p5.js
                    //tri,hexa & octa are defined in this file
                    p[shape](0, 20, p.donutSize + j, p.donutSize + j);
                }
                p.rotate(p.PI/numOfRotations);
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
