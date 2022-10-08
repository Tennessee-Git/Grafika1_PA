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
    drawWithClicks();
});

drawParamsButton.addEventListener('click', () => {
    drawWithParams();
});

stopDrawingButton.addEventListener('click', () => {
    removeCanvasEventListeners();
    drawingMode = '';
    setNotDrawing();
    resetDrawingMode();
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
})

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
                rectangleWidth = rectangleWidthInput.value;
                rectangleHeight = rectangleHeightInput.value;
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
            ]
        });
        clicks = 0;
    }

    lastClick = [x, y];
};

function drawCircle(e) {
    x = getCursorPosition(e)[0] - this.offsetLeft;
    y = getCursorPosition(e)[1] - this.offsetTop;
    ctx.beginPath();
    ctx.arc(x,y,radius, 0, 2 * Math.PI);
    ctx.fill();
    addToShapes({
        type:'circle',
        corners:[
            {x:x, y:y}
        ],
        radius: radius
    });
};


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
            corners:[
                {x:posX, y:posY},
                {x:posX + width, y:posY + height}
            ]
        });

        clicks = 0;
    }

    lastClick = [x, y];
}

function drawRectangleWithParams(e) {
    x = getCursorPosition(e)[0] - this.offsetLeft;
    y = getCursorPosition(e)[1] - this.offsetTop;
    ctx.fillRect(x,y,rectangleWidth,rectangleHeight);
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
                    ]
                }
            );
            break;
        case 'circle':
            shapes.push(
                {
                    type:'circle',
                    corners:[
                        {x:shape.corners[0].x, y:shape.corners[0].y}
                    ],
                    radius: shape.radius
                }
            );
            break;
        case 'rectangle':
            shapes.push(
                {
                    type:'rectangle',
                    corners:[
                        {x:shape.corners[0].x, y:shape.corners[0].y},
                        {x:shape.corners[1].x, y:shape.corners[1].y}
                    ]
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

const removeCanvasEventListeners = () => {
    canvas.removeEventListener('click', drawLine);
    canvas.removeEventListener('click', drawCircle);
    canvas.removeEventListener('click', drawRectangleWithClicks);
    canvas.removeEventListener('click', drawRectangleWithParams);
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

setNotDrawing();