// ----------------------------------------------------------------------------
// Seeded random number generator
function seededRandom(a) {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

// ----------------------------------------------------------------------------
// Colour function for the triangles
const tiledColourFunc = (jitterFactor = 0.15) => ({ xPercent, yPercent, xScale, yScale, opts, random }) => {
    let xDist = 0;
    let yDist = 0;

    // x/y Dist is the distance from 0.25 or 0.75, whichever is closer
    if (xPercent < 0.5) {
        xDist = Math.abs(0.25 - xPercent);
    } else {
        xDist = Math.abs(0.75 - xPercent);
    }
    if (yPercent < 0.5) {
        yDist = Math.abs(0.25 - yPercent);
    } else {
        yDist = Math.abs(0.75 - yPercent);
    }

    // Use the distance to seed the jitter
    const a = xScale((xDist*4) + (jitterFactor * seededRandom(parseInt(xDist * 100))));
    const b = yScale((yDist*4) + (jitterFactor * seededRandom(parseInt(yDist * 100)))); //

    return chroma.mix(a, b, 0.5, opts.colorSpace);
};

// ----------------------------------------------------------------------------
function getTriangles(width, height, cellsize){
    // Generate a pattern of correct size and use its triangles
    const pattern = trianglify({
      cellSize: 20,
      width: oldWidth,
      height: oldHeight
    })
    return pattern.points;
}

// ----------------------------------------------------------------------------
function getDimensions(points){

    // Find the min and max of the points
    var maxX = -99;
    var maxY = -99;
    for(var i = 0; i < oldPoints.length; i++){
        if(oldPoints[i][0] > maxX)
            maxX = oldPoints[i][0];
        if(oldPoints[i][1] > maxY)
            maxY = oldPoints[i][1];
    }
    return [maxX, maxY];
}

// ----------------------------------------------------------------------------
function tilePoints(points, width, height){
    const newPoints = []
    for(var i = 0; i < points.length; i++){
        if(points[i][0] < 0){
           points[i][0] = 0;
           continue
        }
        if(points[i][1] < 0){
            points[i][1] = 0
            continue
        }
        var point_x1y0 = [points[i][0] + width, points[i][1]]
        var point_x0y1 = [points[i][0], points[i][1] + height]
        var point_x1y1 = [points[i][0] + width, points[i][1] + height]
        newPoints.push(point_x1y0)
        newPoints.push(point_x0y1)
        newPoints.push(point_x1y1)
        newPoints.push(points[i])
    }
    return newPoints;
}

// ----------------------------------------------------------------------------
function getCanvas(pattern, xMult, yMult){
    var canvas = pattern.toCanvas();
    const ctx = canvas.getContext('2d');
    var canvasW = canvas.width
    var canvasH = canvas.height
    var imageData = ctx.getImageData(canvasW * 0.25,canvasH * 0.25,canvasW * 0.75, canvasH * 0.75);
    let canvas1 = document.createElement("canvas");
    canvas1.width = (canvasW / 2) * xMult;
    canvas1.height = (canvasH / 2) * yMult;
    let ctx1 = canvas1.getContext("2d");
    for(var x = 0; x < xMult; x++){
        for(var y = 0; y < yMult; y++){
            ctx1.putImageData(imageData, (canvasW / xMult) * x, (canvasH / yMult) * y);
        }
    }
    return canvas1;
}


var mainWindow = document.getElementById("main");
var oldHeight = window.innerHeight * 0.3;
var oldWidth = oldHeight;
//var oldWidth = window.innerWidth * 0.3

// Generate some triangles
var oldPoints = getTriangles(oldWidth, oldHeight, 20);

// Get dimensions
var dimensions = getDimensions(oldPoints);
var newHeight = dimensions[1];
var newWidth = dimensions[0];

// Tile the points into 4 quadrants
var points = tilePoints(oldPoints, newWidth, newHeight);

const palette = {mine:  ["#9AC71B", "#B3A22A", "#189830", "#79581E"]};

var newPattern = trianglify({
    height: newHeight*2,
    width: newWidth*2,
    points: points,
    variance: 0.7,
    palette: palette,
    colorFunction: tiledColourFunc(0.3)
});
const canvas = getCanvas(newPattern, 1, 1);
document.body.appendChild(canvas);

var dataURL = canvas.toDataURL("image/png");
document.body.style.backgroundImage = "url('"+dataURL+"')";



/*
document.body.appendChild(newPattern.toCanvas())

const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext('2d');
var canvasW = canvas.width
var canvasH = canvas.height
var imageData = ctx.getImageData(canvasW * 0.25,canvasH * 0.25,canvasW * 0.75, canvasH * 0.75);
let canvas1 = document.createElement("canvas");
canvas1.width = canvasW;
canvas1.height = canvasH;
let ctx1 = canvas1.getContext("2d");
ctx1.putImageData(imageData, 0, 0);
ctx1.putImageData(imageData, canvasW * 0.5, 0);
ctx1.putImageData(imageData, 0, canvasH * 0.5);
ctx1.putImageData(imageData, canvasW * 0.5, canvasH * 0.5);

document.body.appendChild(canvas1);

let canvas2 = document.createElement("canvas");
canvas2.width = canvasW/2;
canvas2.height = canvasH/2;
let ctx2 = canvas2.getContext("2d");
ctx2.putImageData(imageData, 0, 0);
document.body.appendChild(canvas2);

var dataURL = canvas2.toDataURL("image/png");
//var newTab = window.open('about:blank','image from canvas');
//newTab.document.write("<img src='" + dataURL + "' alt='from canvas'/>");
//window.open(canvas2.toDataURL("image/png"));

console.log("Start: (oldWidth: " + oldWidth + "), (oldHeight: " + oldHeight + ")")

console.log("Derived: (newWidth: " + newWidth.toFixed(1) + "), (newHeight: " + newHeight.toFixed(1) + ")")*/
