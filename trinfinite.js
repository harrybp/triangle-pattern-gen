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
const tiledColourFunc = (jitterFactor, gradientFactor) => ({ xPercent, yPercent, xScale, yScale, opts, random }) => {
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
    const a = xScale((xDist*gradientFactor) + (jitterFactor * seededRandom(parseInt(xDist * 100))));
    const b = yScale((yDist*gradientFactor) + (jitterFactor * seededRandom(parseInt(yDist * 100)))); //

    return chroma.mix(a, b, 0.5, opts.colorSpace);
};

// ----------------------------------------------------------------------------
// Generate a basic pattern to get the points data
function getTriangles(width, height, cellSize, variance){
    // Generate a pattern of correct size and use its triangles
    const pattern = trianglify({
      cellSize: cellSize,
      width: oldWidth,
      height: oldHeight,
      variance: variance,
    })
    return pattern.points;
}

// ----------------------------------------------------------------------------
// Find the maximum x and y values of the points
function getDimensions(points){

    // Find the min and max of the points
    var maxX = -99;
    var maxY = -99;
    for(var i = 0; i < points.length; i++){
        if(points[i][0] > maxX)
            maxX = points[i][0];
        if(points[i][1] > maxY)
            maxY = points[i][1];
    }
    return [maxX, maxY];
}

// ----------------------------------------------------------------------------
// Tile the points together into 4 quadrants
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
// Extract the center square and tile
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

var newHeight = 0;
var newWidth = 0;

function getPoints(width, height, cellSize, variance){
    // Generate some triangles
    var oldPoints = getTriangles(width, height, cellSize, variance);

    // Get dimensions
    var dimensions = getDimensions(oldPoints);
    newHeight = dimensions[1];
    newWidth = dimensions[0];

    // Tile the points into 4 quadrants
    var points = tilePoints(oldPoints, newWidth, newHeight);
    return points;
}

// ----------------------------------------------------------------------------

var mainWindow = document.getElementById("mainWindow");
console.log(mainWindow);
var oldHeight = window.innerHeight * 0.3;
var oldWidth = oldHeight;
//var oldWidth = window.innerWidth * 0.3
//
var cellSizeValue = 20;
var varianceValue = 0.75;
var points = getPoints(oldWidth, oldHeight, cellSizeValue, varianceValue);


// Variable Inputs
var palette = {mine:  ["#9AC71B", "#B3A22A", "#189830", "#79581E"]};
var jitterValue = 0.5;
var gradientValue = 4;

// ----------------------------------------------------------------------------
// Refresh the pattern
function getPattern(){
    var newPattern = trianglify({
        height: newHeight*2,
        width: newWidth*2,
        points: points,
        palette: palette,
        colorFunction: tiledColourFunc(jitterValue, gradientValue)
    });
    return newPattern;
}

// ----------------------------------------------------------------------------
// Updat the pattern and apply it to the background
function updatePattern(){
    var newPattern = getPattern();
    const canvas = getCanvas(newPattern, 1, 1);
    var dataURL = canvas.toDataURL("image/png");
    mainWindow.style.backgroundImage = "url('"+dataURL+"')";

}
updatePattern();

// ----------------------------------------------------------------------------
// Update the jitter factor from the slider
function updateJitter(){
    var jitterRange = document.getElementById("jitterRange");
    var jitterRangeLabel = document.getElementById("jitterRangeLabel");
    jitterRangeLabel.innerHTML = "Jitter Factor: " + jitterRange.value;
    jitterValue = jitterRange.value;
    updatePattern();
}

// ----------------------------------------------------------------------------
// Update the gradient factor from the slider
function updateGradientFactor(){
    var gradientFactorRange = document.getElementById("gradientFactorRange");
    var gradientFactorRangeLabel = document.getElementById("gradientFactorRangeLabel");
    gradientFactorRangeLabel.innerHTML = "Gradient Factor: " + gradientFactorRange.value;
    gradientValue = gradientFactorRange.value;
    updatePattern();
}

// ----------------------------------------------------------------------------
// Update the cell size from the slider
function updateCellSize(){
    var cellSizeRange = document.getElementById("cellSizeRange");
    var cellSizeRangeLabel = document.getElementById("cellSizeRangeLabel");
    cellSizeRangeLabel.innerHTML = "Cell Size: " + cellSizeRange.value;
    cellSizeValue = cellSizeRange.value;
    points = getPoints(oldWidth, oldHeight, cellSizeValue, varianceValue);
    updatePattern();
}

// ----------------------------------------------------------------------------
// Update the variance from the slider
function updateVariance(){
    var varianceRange = document.getElementById("varianceRange");
    var varianceRangeLabel = document.getElementById("varianceRangeLabel");
    varianceRangeLabel.innerHTML = "Variance: " + varianceRange.value;
    varianceValue = varianceRange.value;
    points = getPoints(oldWidth, oldHeight, cellSizeValue, varianceValue);
    updatePattern();
}

// ----------------------------------------------------------------------------
// Update the colour palette from the colour pickers
function updateColours(){
    var inputs = document.getElementsByTagName("input");
    var newColours = [];
    for(var i = 0; i < inputs.length; i++) {
        if(inputs[i].type.toLowerCase() == "color") {
            newColours.push(inputs[i].value);
        }
    }
    palette = {mine: newColours};
    updatePattern();
}

// ----------------------------------------------------------------------------
// Download image
function downloadImage(data, filename = "untitled.png") {
    var a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
}

// ----------------------------------------------------------------------------
// Save the generated image
function saveImage(){
    var pattern = getPattern();
    var canvas = getCanvas(pattern, 1, 1);
    var dataURL = canvas.toDataURL("image/png", 1.0);
    downloadImage(dataURL, "triangles.png");
}

var numColours = 4;

// ----------------------------------------------------------------------------
// Add a colour to the palette
function addColour(){
    var picker = document.createElement("input");
    picker.type = "color";
    picker.name = "colour" + numColours;
    picker.id = "colour" + numColours;
    picker.value = "#123456";
    picker.setAttribute("onchange", "updateColours()");
    var allPickers = document.getElementById("colourPickers");
    allPickers.appendChild(picker);
    numColours++;
    updateColours();
}

// ----------------------------------------------------------------------------
// Remove a colour from the palette
function removeColour(){
    var allPickers = document.getElementById("colourPickers");
    var toRemove = document.getElementById("colour" + (numColours - 1));
    allPickers.removeChild(toRemove);
    numColours--;
    updateColours();
}
