'use strict';
var th = {};
var ttls = [];
/*global Concurrent*/
var Thread = Concurrent.Thread;
var DEFAULT_MOVE_STEP = 2;
var DEFAULT_ROTATE_STEP = 5;
var sleepTime = 10;
var moveStep = DEFAULT_MOVE_STEP;
var rotateStep = DEFAULT_ROTATE_STEP;

function createTurtle() {
    var t = {};

    t.x = 100.0;
    t.y = 100.0;

    //  dx = sin(angle), dy = -cos(angle)
    t.dx = 0.0;
    t.dy = 0.0;

    // (x,y)から(rx,ry)まで線を引く
    t.rx = t.x;
    t.ry = t.y;

    t.angle = -90.0;

    t.show = true;

    t.penDown = true;
    t.penColor = "black";

    t.kameColor = "green";

    t.size = 10;

    t.fd = function (d) {
        if (d < 0) {
            t.bk(-d);
        } else {
            th = Thread.create(function (d, t) {
                var xx = t.x, yy = t.y;
                t.dx = Math.cos(deg2rad(t.angle));
                t.dy = Math.sin(deg2rad(t.angle));
                setRxRy(t);
                for (var i = moveStep; i < d; i += moveStep) {
                    t.x = xx + t.dx * i;
                    t.y = yy + t.dy * i;
                    draw(t);
                    setRxRy(t);
                    sleep(sleepTime);
                }
                t.x = xx + t.dx * d;
                t.y = yy + t.dy * d;
                draw(t);
            }, d, t);
        }
    };

    t.bk = function (d) {
        if (d < 0) {
            t.fd(-d);
        } else {
            th = Thread.create(function (d, t) {
                var xx = t.x, yy = t.y;
                t.dx = Math.cos(deg2rad(t.angle));
                t.dy = Math.sin(deg2rad(t.angle));
                setRxRy(t);
                for (var i = moveStep; i < d; i += moveStep) {
                    t.x = xx - t.dx * i;
                    t.y = yy - t.dy * i;
                    draw(t);
                    setRxRy(t);
                    sleep(sleepTime);
                }
                t.x = xx - t.dx * d;
                t.y = yy - t.dy * d;
                draw(t);
            }, d, t);
        }
    };

    t.rt = function (deg) {
        if (deg < 0) {
            lt(-deg);
        } else {
            th = Thread.create(function (deg, t) {
                var tmpAngle = t.angle;
                var tmpPendown = t.penDown;
                up();
                for (var i = rotateStep; i < deg; i += rotateStep) {
                    draw(t);
                    t.angle += rotateStep;
                    sleep(sleepTime);
                }
                t.angle = tmpAngle + deg;
                t.penDown = tmpPendown;
                drawTurtle(t);
            }, deg, t);
        }
    };

    t.lt = function (deg) {
        if (deg < 0) {
            rt(-deg);
        } else {
            th = Thread.create(function (deg, t) {
                var tmpAngle = t.angle;
                var tmpPendown = t.penDown;
                up();
                for (var i = rotateStep; i < deg; i += rotateStep) {
                    draw(t);
                    t.angle -= rotateStep;
                    sleep(sleepTime);
                }
                t.angle = tmpAngle - deg;
                t.penDown = tmpPendown;
                drawTurtle(t);
            }, deg, t);
        }
    };

    t.up = function () {
        t.penDown = false;
    };

    t.down = function () {
        t.penDown = true;
    };

    t.color = function (c) {
        t.penColor = c;
    };

    t.warp = function (x, y) {
        var tmpPendown = t.penDown;
        t.up();
        t.x = x;
        t.y = y;
        setRxRy(t);
        t.penDown = tmpPendown;
    };

    ttls.push(t);
    return t;
}

function createImageTurtle(imgName){
    var t = createTurtle();

}


var defaultTurtle = createTurtle();

function fd(d) {
    defaultTurtle.fd(d);
}

function bk(d) {
    defaultTurtle.bk(d);
}


function rt(deg) {
    defaultTurtle.rt(deg);
}

function lt(deg) {
    defaultTurtle.lt(deg);
}

function up() {
    defaultTurtle.up();
}

function down() {
    defaultTurtle.down();
}

function color(c) {
    defaultTurtle.color(c);
}

/* 描画関連 */

function draw(t) {
    clearTurtleCanvas();
    for (var i = 0; i < ttls.size(); i++) {
        if (ttls[i].show) {
            drawTurtle(ttls[i]);
        }
    }

    if (t.penDown) {
        drawLine(t);
    }
}

function drawTurtle(t) {
    var canvas = document.getElementById('turtleCanvas');
    if (!canvas.getContext) {
        return;
    }
    var ctx = canvas.getContext('2d');

    // 胴体
    ctx.beginPath();
    ctx.arc(t.x, t.y, 10, 0, Math.PI * 2, true);
    ctx.fillStyle = t.kameColor;
    ctx.fill();
    ctx.closePath();

    // 頭部分
    ctx.beginPath();
    ctx.arc(t.x + 5 * Math.cos(deg2rad(t.angle)),
        t.y + 5 * Math.sin(deg2rad(t.angle)), 3, 0, Math.PI * 2, true);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
}


function drawLine(t) {
    var canvas = document.getElementById('locusCanvas');
    if (!canvas.getContext) {
        return;
    }
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(t.rx, t.ry);
    ctx.lineTo(t.x, t.y);
    ctx.closePath();
    ctx.strokeStyle = t.penColor;
    ctx.stroke();
}

function clearTurtleCanvas() {
    clearCanvas('turtleCanvas');
}

function clearLocusCanvas() {
    clearCanvas('locusCanvas');
}

function clearCanvas(name) {
    var canvas = document.getElementById(name);
    if (!canvas.getContext) {
        return;
    }
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* Turtle補助メソッド */
function setRxRy(t) {
    t.rx = t.x;
    t.ry = t.y;
}

/* 一般補助メソッド */
function deg2rad(deg) {
    return deg * Math.PI / 180;
}

function sleep(t) {
    Thread.sleep(t);
}

function changeSpeed(x) {
    sleepTime = Number(x);
    if (Number(x) === 0) {
        moveStep = 1000;
        rotateStep = 1000;
    } else {
        moveStep = DEFAULT_MOVE_STEP;
        rotateStep = DEFAULT_ROTATE_STEP;
    }
}


// /* 実行部分 */
// function start() {
//     main();
// }

