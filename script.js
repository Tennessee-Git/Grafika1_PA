let canvas = document.getElementById('mainCanvas');
let ctx;
if(canvas.getContext) {
    ctx = canvas.getContext('2d');
}

let clicks = 0;
let lastClick = [0,0];
let radius = 20;
let rectangleWidth = 0;
let rectangleHeight = 0;
let startX;
let startY;
let dragOk = false;

let drawingMode = '';
let shapes = [];

let lineDrawing = document.getElementById('line');
let rectangleDrawing = document.getElementById('rectangle');
let circleDrawing = document.getElementById('circle');

let radiusInput = document.getElementById('circleRadius');
let rectangleWidthInput = document.getElementById('rectWidth');
let rectangleHeightInput = document.getElementById('rectHeight');

let drawClicksButton = document.getElementById('drawButton');
let drawParamsButton = document.getElementById('drawParamsButton');
let clearButton = document.getElementById('clearButton');
let stopDrawingButton = document.getElementById('stopDrawingButton');
let drawingModeP = document.getElementById('drawingModeP');
let saveButton = document.getElementById('saveButton');
let loadButton = document.getElementById('loadButton');

lineDrawing.addEventListener('click', () => {
    if(lineDrawing.checked) {
        drawingMode = 'line';
        rectangleDrawing.disabled = true;
        circleDrawing.disabled = true;
    }
    else {
        drawingMode = '';
        rectangleDrawing.disabled = false;
        circleDrawing.disabled = false;
    }
});

rectangleDrawing.addEventListener('click', () => {
    if(rectangleDrawing.checked) {
        drawingMode = 'rectangle';
        lineDrawing.disabled = true;
        circleDrawing.disabled = true;
    }
    else {
        drawingMode = '';
        lineDrawing.disabled = false;
        circleDrawing.disabled = false;
    }
});

circleDrawing.addEventListener('click', () => {
    if(circleDrawing.checked) {
        drawingMode = 'circle';
        lineDrawing.disabled = true;
        rectangleDrawing.disabled = true;
    }
    else {
        drawingMode = '';
        lineDrawing.disabled = false;
        rectangleDrawing.disabled = false;
    }
});

drawClicksButton.addEventListener('click', () => {
    removeCanvasEventListeners();
    dragOk = false;
    drawWithClicks();
});

drawParamsButton.addEventListener('click', () => {
    removeCanvasEventListeners();
    dragOk = false;
    drawWithParams();
});

stopDrawingButton.addEventListener('click', () => {
    removeCanvasEventListeners();
    drawingMode = '';
    setNotDrawing();
    resetDrawingMode();
    console.log(shapes);
    canvas.onmousedown = myMouseDown;
    canvas.onmouseup = myMouseUp;
    canvas.onmousemove = myMouseMove;
});

clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    removeCanvasEventListeners();
    drawingMode = '';
    shapes = [];
    radius = 20;
    setNotDrawing();
    ctx.fillStyle = "black";

    resetDrawingMode();

    radiusInput.value = 0;
    rectangleHeightInput.value = 0;
    rectangleWidthInput.value = 0;
});

saveButton.addEventListener('click', () => {
    if(shapes.length > 0) {
        const file = new Blob([JSON.stringify(shapes)], {type: "text/plain"});
        var anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(file);
        anchor.download = "shapes.txt";
        anchor.click();
    }
    else {
        alert('Add some shapes!');
    }
});

loadButton.addEventListener('click', () => {

});

let drawWithClicks = () => {
    switch(drawingMode) {
        case 'rectangle':
            ctx.fillStyle = "green";
            removeCanvasEventListeners();
            canvas.addEventListener('click', drawRectangleWithClicks);
            setDrawingWithClicks();
            break;
        case 'circle':
            ctx.fillStyle = "blue";
            removeCanvasEventListeners();
            canvas.addEventListener('click', drawCircle);
            setDrawingWithClicks();
            break;
        case 'line':
            ctx.strokeStyle = "red";
            removeCanvasEventListeners();
            canvas.addEventListener('click', drawLine);
            setDrawingWithClicks();
            break;
        default:
            drawingMode = '';
            ctx.fillStyle = "black";
            setNotDrawing();
            removeCanvasEventListeners();
            break;
    }
}

let drawWithParams = () => {
    switch(drawingMode) {
        case 'rectangle':
            if(rectangleWidthInput.value != 0 && rectangleHeightInput.value != 0) {
                ctx.fillStyle = "green";
                rectangleWidth = Number(rectangleWidthInput.value);
                rectangleHeight = Number(rectangleHeightInput.value);
                removeCanvasEventListeners();
                canvas.addEventListener('click', drawRectangleWithParams);
                setDrawingWithParams();
            }
            else {
                alert('Enter rectangle width and height!')
            }
            break;
        case 'circle':
            if(radiusInput.value != 0) {
                ctx.fillStyle = "blue";
                radius = radiusInput.value;
                removeCanvasEventListeners();
                canvas.addEventListener('click', drawCircle);
                setDrawingWithParams();
            }
            else {
                alert('Enter radius value!');
            }
            break;
        case 'line':
            ctx.strokeStyle = "red";
            removeCanvasEventListeners();
            canvas.addEventListener('click', drawLine);
            setDrawingWithParams();
            break;
        default:
            drawingMode = '';
            ctx.fillStyle = "black";
            setNotDrawing();
            removeCanvasEventListeners();
            break;
    }
}

function line(l) {
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(l.corners[0].x, l.corners[0].y);
    ctx.lineTo(l.corners[1].x, l.corners[1].y, 6);
    ctx.lineWidth = 5;
    ctx.stroke();
}

function circle(c) {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(c.origin.x,c.origin.y,c.radius, 0, 2 * Math.PI);
    ctx.fill();
}

function rectangle(r) {
    ctx.fillStyle = "green";
    ctx.fillRect(r.origin.x, r.origin.y,r.width,r.height);
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawShapes() {
    clear();
    shapes.forEach( (shape) => {
        switch(shape.type) {
            case 'line':
                line(shape);
                break;
            case 'rectangle':
                rectangle(shape);
                break;
            case 'circle':
                circle(shape);
                break;
        }
    })
}

function drawLine(e) {
    x = getCursorPosition(e)[0] - this.offsetLeft;
    y = getCursorPosition(e)[1] - this.offsetTop;

    if (clicks != 1) {
        clicks++;
    } else {
        ctx.beginPath();
        ctx.moveTo(lastClick[0], lastClick[1]);
        ctx.lineTo(x, y, 6);
        ctx.lineWidth = 5;
        ctx.stroke();

        addToShapes({
            type:'line',
            corners:[
                {x:lastClick[0], y:lastClick[1]},
                {x:x, y:y}
            ],
            isDragging: false
        });
        clicks = 0;
    }

    lastClick = [x, y];
}

function drawCircle(e) {
    x = getCursorPosition(e)[0] - this.offsetLeft;
    y = getCursorPosition(e)[1] - this.offsetTop;
    ctx.beginPath();
    ctx.arc(x,y,radius, 0, 2 * Math.PI);
    ctx.fill();
    addToShapes({
        type:'circle',
        origin: {x:x, y:y},
        radius: radius,
        isDragging: false
    });
}


function drawRectangleWithClicks(e) {
    x = getCursorPosition(e)[0] - this.offsetLeft;
    y = getCursorPosition(e)[1] - this.offsetTop;
    
    if (clicks != 1) {
        clicks++;
    } else {
        var width = Math.abs(x - lastClick[0]);
        var height = Math.abs(y - lastClick[1]);
        var posX, posY; 

        if(lastClick[0] < x && lastClick[1] < y) {
            posX = lastClick[0];
            posY = lastClick[1];
        }

        else if(lastClick[0] > x && lastClick[1] > y) {
            posX = x;
            posY = y;
        }

        else {
            posX = Math.min(x, lastClick[0]);
            posY = Math.min(y, lastClick[1]);
        }

        ctx.fillRect(posX, posY,width,height);

        addToShapes({
            type:'rectangle',
            origin: {x:posX, y:posY},
            width: width,
            height: height,
            isDragging: false
        });

        clicks = 0;
    }

    lastClick = [x, y];
}

function drawRectangleWithParams(e) {
    x = getCursorPosition(e)[0] - this.offsetLeft;
    y = getCursorPosition(e)[1] - this.offsetTop;
    ctx.fillRect(x,y,rectangleWidth,rectangleHeight);
    addToShapes({
        type:'rectangle',
        origin: {x:x, y:y},
        width: rectangleWidth,
        height: rectangleHeight,
        isDragging: false
    });
}

let addToShapes = (shape) => {
    switch(shape.type) {
        case 'line':
            shapes.push(
                {
                    type:'line',
                    corners:[
                        {x:shape.corners[0].x, y:shape.corners[0].y},
                        {x:shape.corners[1].x, y:shape.corners[1].y}
                    ],
                    isDragging:false
                }
            );
            break;
        case 'circle':
            shapes.push(
                {
                    type:'circle',
                    origin: {x:shape.origin.x, y:shape.origin.y},
                    radius: shape.radius,
                    isDragging:false
                }
            );
            break;
        case 'rectangle':
            shapes.push(
                {
                    type:'rectangle',
                    origin: {x:shape.origin.x, y:shape.origin.y},
                    width: shape.width,
                    height: shape.height,
                    isDragging:false
                }
            );
            break;
    }
}

function getCursorPosition(e) {
    var x;
    var y;

    if(e.pageX != undefined && e.pageY != undefined) {
        x = e.pageX;
        y = e.pageY;
    }
    else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return [x,y];
}

function myMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();

    var mx = getCursorPosition(e)[0] - this.offsetLeft;
    var my = getCursorPosition(e)[1] - this.offsetTop;

    dragOk = false;

    shapes.forEach((shape) => {
        switch(shape.type) {
            case 'line':
                if(mx > shape.corners[0].x - 5 && mx < shape.corners[0].x + 10 && my > shape.corners[0].y - 5  && my < shape.corners[0].y + 10) {
                    dragOk = true;
                    shape.isDragging = true;
                }
                if(mx > shape.corners[1].x - 5 && mx < shape.corners[1].x + 10 && my > shape.corners[1].y - 5  && my < shape.corners[1].y + 10) {
                    dragOk = true;
                    shape.isDragging = true;
                }
                break;
            case 'rectangle':
                if(mx > shape.origin.x && mx < shape.origin.x + shape.width && my > shape.origin.y && my < shape.origin.y + shape.height) {
                    dragOk = true;
                    shape.isDragging = true;
                }
                break;
            case 'circle':
                var distOriginMouse = calcDist(shape.origin.x,shape.origin.y,mx,my);
                if(distOriginMouse <= shape.radius) {
                    dragOk = true;
                    shape.isDragging = true;
                }
                break;
        }
    });
    startX=mx;
    startY=my;
}

function myMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();
    dragOk = false;
    shapes.forEach((shape) => {
        shape.isDragging = false;
    });
}

function myMouseMove(e) {
    if(dragOk) {
        e.preventDefault();
        e.stopPropagation();
        var mx = getCursorPosition(e)[0] - this.offsetLeft;
        var my = getCursorPosition(e)[1] - this.offsetTop;

        var dx = mx - startX;
        var dy = my - startY;

        shapes.forEach((shape) => {
            if(shape.isDragging) {
                if(shape.type == 'line') {
                    shape.corners[0].x += dx;
                    shape.corners[0].y += dy;
                    shape.corners[1].x += dx;
                    shape.corners[1].y += dy;
                }
                else {
                    shape.origin.x += dx;
                    shape.origin.y += dy;
                }
            }
        });
        drawShapes();
        startX=mx;
        startY=my;
    }
}

const removeCanvasEventListeners = () => {
    canvas.removeEventListener('click', drawLine);
    canvas.removeEventListener('click', drawCircle);
    canvas.removeEventListener('click', drawRectangleWithClicks);
    canvas.removeEventListener('click', drawRectangleWithParams);
    canvas.removeEventListener('mousedown', myMouseDown);
    canvas.removeEventListener('mouseup', myMouseUp);
    canvas.removeEventListener('mousemove', myMouseMove);
}

const resetDrawingMode = () => {
    lineDrawing.checked = false;
    rectangleDrawing.checked = false;
    circleDrawing.checked = false;

    lineDrawing.disabled = false;
    rectangleDrawing.disabled = false;
    circleDrawing.disabled = false;
}

const setNotDrawing = () => {
    drawingModeP.innerText = 'Not drawing!';
    drawingModeP.style.color = "red";
}

const setDrawingWithClicks = () => {
    drawingModeP.innerText = 'Drawing with clicks!';
    drawingModeP.style.color = "green";
}

const setDrawingWithParams = () => {
    drawingModeP.innerText = 'Drawing with parameters!';
    drawingModeP.style.color = "green";
}

const calcDist = (x1,y1,x2,y2) => {
    var xPart = Math.pow(x2 - x1,2);
    var yPart = Math.pow(y2 - y1, 2);
    return Math.sqrt(xPart + yPart);
}

setNotDrawing();