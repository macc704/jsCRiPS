'use strict';
var th = {};    //
var ttls = [];  //
var imgs = {};  //

/*global Concurrent*/
var Thread = Concurrent.Thread;
var DEFAULT_MOVE_STEP = 2;
var DEFAULT_ROTATE_STEP = 5;
var sleepTime = 10;
var moveStep = DEFAULT_MOVE_STEP;
var rotateStep = DEFAULT_ROTATE_STEP;

function createTurtle() {
    var t = {};

    t.x = 100.0;    // TODO 中心座標？どこを基準？
    t.y = 100.0;

    //  dx = sin(angle), dy = -cos(angle) メンバ変数にする必要なし？
    //t.dx = 0.0;
    //t.dy = 0.0;

    // (x,y)から(rx,ry)まで線を引く
    t.rx = t.x;
    t.ry = t.y;

    t.angle = -90.0;

    t.isShow = true;

    t.penDown = true;
    t.penColor = "black";

    t.kameColor = "green";

    t._looks = null;

    t.size = 10;
    t.width = 0;
    t.height = 0;

    t.fd = function (d) {
        if (d < 0) {
            t.bk(-d);
        } else {
            th = Thread.create(function (d, t) {
                var xx = t.x, yy = t.y;
                var dx = Math.cos(deg2rad(t.angle));
                var dy = Math.sin(deg2rad(t.angle));
                setRxRy(t);
                for (var i = moveStep; i < d; i += moveStep) {
                    t.x = xx + dx * i;
                    t.y = yy + dy * i;
                    draw(t);
                    setRxRy(t);
                    sleep(sleepTime);
                }
                t.x = xx + dx * d;
                t.y = yy + dy * d;
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
                var dx = Math.cos(deg2rad(t.angle));
                var dy = Math.sin(deg2rad(t.angle));
                setRxRy(t);
                for (var i = moveStep; i < d; i += moveStep) {
                    t.x = xx - dx * i;
                    t.y = yy - dy * i;
                    draw(t);
                    setRxRy(t);
                    sleep(sleepTime);
                }
                t.x = xx - dx * d;
                t.y = yy - dy * d;
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
                draw(t);
                t.penDown = tmpPendown;
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
                draw(t);
                t.penDown = tmpPendown;
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

    t.looks = function (tt) {
        if (tt && tt._looks) {
            t._looks = tt._looks;
        } else {
            println("looks対象が間違っています[" + tt + "]\n");
        }
    };

    t.show = function () {
        t.isShow = true;
    };

    t.hide = function () {
        t.isShow = false;
    };

    t.setWidth = function (w) {
        t.width = w;
    };

    t.setHeight = function (h) {
        t.height = h;
    };

    t.printState = function () {
        println(
            "(x,y) = (" + parseInt(t.x) + "," + parseInt(t.y) + ")\n" +
            "angle = " + t.angle + "\n" +
            "(width,height) = (" + t.width + "," + t.height + ")\n"
        );
    };

    ttls.push(t);
    return t;
}

function createImageTurtle(imgName) {
    if (imgs[imgName] === undefined) {
        var img = new Image();
        img.src = imgName;
        imgs[imgName] = img;
        img.onerror = function () {
            document.getElementById('msg').value +=
                document.getElementById('msg').value + "画像[" + imgName + "]が見つかりません\n";
        };
    }
    var t = createTurtle();
    t.penDown = false;
    t._looks = imgs[imgName];
    t.width = t._looks.width;
    t.height = t._looks.height;
    return t;
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
        if (ttls[i].isShow) {
            drawTurtle(ttls[i]);
        }
    }

    if (t && t.penDown) {
        drawLine(t);
    }
}

function drawTurtle(t) {
    var canvas = document.getElementById('turtleCanvas');
    if (!canvas.getContext) {
        return;
    }
    var ctx = canvas.getContext('2d');
    if (t._looks === null) {
        drawKame();
    } else {
        drawImg();
    }

    function drawKame() {
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

    function drawImg() {
        ctx.save();
        ctx.translate(t.x + t.width / 2, t.y + t.height / 2);
        ctx.rotate(deg2rad(t.angle));
        ctx.translate(-(t.x + t.width / 2), -(t.y + t.height / 2));
        ctx.drawImage(t._looks, t.x, t.y, t.width, t.height);
        ctx.restore();
    }

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

function update() {
    draw();
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

function println(str) {
    var msgArea = document.getElementById('msg');
    msgArea.value += msgArea.value + str;
    while (msgArea.value.length > 1000) {
        msgArea.value = msgArea.value.split('\n').slice(1).join('\n');
    }
}