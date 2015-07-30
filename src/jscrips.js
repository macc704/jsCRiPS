'use strict';

/*global esprima,console,escodegen*/
var _converter = {};
_converter.convert = function (source) {
    var ast = esprima.parse(source);
    var yieldAST = esprima.parse('_th.join();').body[0];

    //for debug       
    document.getElementById('ast').value = JSON.stringify(ast, null, 4);

    var processStatement = function (stmt) {
        if (stmt.type === 'BlockStatement') {
            stmt.body = processStatements(stmt.body);
        }
        if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'CallExpression') {
            var block = esprima.parse('{}').body[0];
            block.body.push(stmt);
            block.body.push(yieldAST);
            return block;
        }
        if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'AssignmentExpression' &&
            stmt.expression.right.type === 'CallExpression' && stmt.expression.right.callee.name === 'input') {
            var block = esprima.parse('{}').body[0];
            block.body.push(stmt);
            block.body.push(yieldAST);
            block.body.push(esprima.parse(stmt.expression.left.name + ' = _inputText;').body[0]);
            return block;
        }
        if (stmt.type === 'VariableDeclaration' && stmt.declarations[0].init &&
            stmt.declarations[0].init.type === 'CallExpression' && stmt.declarations[0].init.callee.name === 'input') {
            var block = esprima.parse('{}').body[0];
            block.body.push(stmt);
            block.body.push(yieldAST);
            block.body.push(esprima.parse(stmt.declarations[0].id.name + ' = _inputText;').body[0]);
        }
        return stmt;
    };

    var processStatements = function (stmts) {
        var newStmts = [];
        stmts.forEach(function (each) {
            if (each.type === 'IfStatement') {
                if (each.consequent) {
                    each.consequent = processStatement(each.consequent);
                }
                if (each.alternate) {
                    each.alternate = processStatement(each.alternate);
                }
            }
            if (each.body) { //while series
                each.body = processStatement(each.body);
            }
            newStmts.push(each);
            if (each.type === 'ExpressionStatement' && each.expression.type === 'CallExpression') {
                newStmts.push(yieldAST);
            }
            // var x=input(),y=input() や f(input()) や if(input()=='abc')などには未対応
            if (each.type === 'ExpressionStatement' && each.expression.type === 'AssignmentExpression' &&
                each.expression.right.type === 'CallExpression' && each.expression.right.callee.name === 'input') {
                newStmts.push(yieldAST);
                newStmts.push(esprima.parse(each.expression.left.name + ' = _inputText;').body[0]);
            }
            if (each.type === 'VariableDeclaration' && each.declarations[0].init &&
                each.declarations[0].init.type === 'CallExpression' && each.declarations[0].init.callee.name === 'input') {
                newStmts.push(yieldAST);
                newStmts.push(esprima.parse(each.declarations[0].id.name + ' = _inputText;').body[0]);
            }
        });
        return newStmts;
    };

    ast.body = processStatements(ast.body);
    return escodegen.generate(ast);
};
// 開始時に例外が出ないために予めスレッドを生成しておく、例外を無視する仕様にした場合いらなくなるかも
var _mth = Concurrent.Thread.create(function () {
    Thread.stop();
});// メインスレッド
var _th = Concurrent.Thread.create(function () {
    Thread.stop();
});// スレッド制御用
var _ttls = []; // タートルを管理するリスト
var _imgs = {}; // 画像を管理するマップ
var _inputText = ""; // 入力されたテキスト
var _inputted = false; // 入力制御用

/*global Concurrent*/
var Thread = Concurrent.Thread;
var DEFAULT_MOVE_STEP = 2;
var DEFAULT_ROTATE_STEP = 5;
var _sleepTime = 10;
var _moveStep = DEFAULT_MOVE_STEP;
var _rotateStep = DEFAULT_ROTATE_STEP;
var KEY_ENTER = 13;

function createTurtle() {
    var t = {};

    t.x = 100.0; // (x,y)は対象の中心を示す
    t.y = 100.0;

    t.rx = t.x; // (x,y)から(rx,ry)まで線を引く
    t.ry = t.y;

    t.angle = -90;

    t.isShow = true;

    t.penDown = true;
    t.penColor = "black";

    t.kameType = 0;
    t.kameColor = "green";

    t._looks = null;

    t.kameScale = 0.4;
    t.width = 0;
    t.height = 0;


    t.fd = function (d) {
        if (d < 0) {
            t.bk(-d);
        } else {
            _th = Thread.create(function (d, t) {
                var xx = t.x,
                    yy = t.y;
                var dx = Math.cos(deg2rad(t.angle));
                var dy = Math.sin(deg2rad(t.angle));
                t.setRxRy();
                for (var i = _moveStep; i < d; i += _moveStep) {
                    t.x = xx + dx * i;
                    t.y = yy + dy * i;
                    draw(t);
                    t.setRxRy();
                    sleep(_sleepTime);
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
            _th = Thread.create(function (d, t) {
                var xx = t.x,
                    yy = t.y;
                var dx = Math.cos(deg2rad(t.angle));
                var dy = Math.sin(deg2rad(t.angle));
                t.setRxRy();
                for (var i = _moveStep; i < d; i += _moveStep) {
                    t.x = xx - dx * i;
                    t.y = yy - dy * i;
                    draw(t);
                    t.setRxRy();
                    sleep(_sleepTime);
                }
                t.x = xx - dx * d;
                t.y = yy - dy * d;
                draw(t);
            }, d, t);
        }
    };

    t.rt = function (deg) {
        if (deg < 0) {
            t.lt(-deg);
        } else {
            _th = Thread.create(function (deg, t) {
                var tmpAngle = t.angle;
                var tmpPendown = t.penDown;
                t.up();
                for (var i = _rotateStep; i < deg; i += _rotateStep) {
                    draw(t);
                    t.angle += _rotateStep;
                    sleep(_sleepTime);
                }
                t.angle = tmpAngle + deg;
                draw(t);
                t.penDown = tmpPendown;
            }, deg, t);
        }
    };

    t.lt = function (deg) {
        if (deg < 0) {
            t.rt(-deg);
        } else {
            _th = Thread.create(function (deg, t) {
                var tmpAngle = t.angle;
                var tmpPendown = t.penDown;
                t.up();
                for (var i = _rotateStep; i < deg; i += _rotateStep) {
                    draw(t);
                    t.angle -= _rotateStep;
                    sleep(_sleepTime);
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
        t.setRxRy();
        t.penDown = tmpPendown;
    };

    t.looks = function (tt) {
        if (tt && tt._looks) {
            t._looks = tt._looks;
            t.width = tt.width;
            t.height = tt.height;
        } else {
            println("looks対象が間違っています[" + tt + "]");
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

    // 参考：http://mclass13.web.fc2.com/hsplecture/nanamekukei.htm
    t.contains = function (tx, ty) {
        var xx = t.x - t.width / 2, yy = t.y - t.height / 2;
        var cx = t.x,
            cy = t.y;
        var l = Math.sqrt((tx - cx) * (tx - cx) + (ty - cy) * (ty - cy));
        var r2 = Math.atan((ty - cy) / (tx - cx)) - deg2rad(t.angle);
        var tx2 = l * Math.cos(r2) + cx;
        var ty2 = l * Math.sin(r2) + cy;
        println(xx, yy);
        return xx <= tx2 && tx2 <= xx + t.width &&
            yy <= ty2 && ty2 <= yy + t.height;
    };

    t.centerX = function () {
        return t.x + t.width / 2;
    };

    t.centerY = function () {
        return t.y + t.height / 2;
    };

    t.setRxRy = function () {
        t.rx = t.x;
        t.ry = t.y;
    };

    t.printState = function () {
        println(
            "(x,y) = (" + parseInt(t.x) + "," + parseInt(t.y) + ")\n" +
            "angle = " + t.angle + "\n" +
            "(width,height) = (" + t.width + "," + t.height + ")"
        );
    };

    _ttls.push(t);
    return t;
}

function createImageTurtle(imgName) {
    var t = createTurtle(); // 先頭に書かないとなんかおかしくなる？
    if (_imgs[imgName] === undefined) {
        var img = new Image();
        img.src = imgName;
        _imgs[imgName] = img;
        img.onerror = function () {
            document.getElementById('console').value +=
                document.getElementById('console').value + "画像[" + imgName + "]が見つかりません\n";
        };
    }
    t.penDown = false;
    t._looks = _imgs[imgName];
    t.width = t._looks.width;
    t.height = t._looks.height;
    return t;
}

// 現在使っていない、デフォルトタートル用のものたち
//var defaultTurtle = createTurtle();
//
//function fd(d) {
//    defaultTurtle.fd(d);
//}
//
//function bk(d) {
//    defaultTurtle.bk(d);
//}
//
//
//function rt(deg) {
//    defaultTurtle.rt(deg);
//}
//
//function lt(deg) {
//    defaultTurtle.lt(deg);
//}
//
//function up() {
//    defaultTurtle.up();
//}
//
//function down() {
//    defaultTurtle.down();
//}
//
//function color(c) {
//    defaultTurtle.color(c);
//}


/* 描画関連 */
function draw(t) {
    clearTurtleCanvas();
    for (var i = 0; i < _ttls.size(); i++) {
        if (_ttls[i].isShow) {
            drawTurtle(_ttls[i]);
        }
    }

    if (t && t.penDown) {
        drawLocus(t);
    }
}

function drawTurtle(t) {
    var canvas = document.getElementById('turtleCanvas');
    if (!canvas.getContext) {
        return;
    }
    var ctx = canvas.getContext('2d');
    if (t._looks === null) {
        drawKame(t, kameMotions[getMotion()]);
        t.kameType++;
    } else {
        drawImg();
    }

    function drawKame(t, data) {
        var dx = Math.cos(deg2rad(t.angle)), dy = Math.sin(deg2rad(t.angle));
        var ix = t.x, iy = t.y;
        ctx.strokeStyle = t.kameColor;
        for (var i = 0; i < data.length; i++) {
            var px = 0, py = 0;
            for (var j = 0; j < data[i].length; j += 2) {
                var kx = data[i][j], ky = data[i][j + 1];
                var nx = (kx * (-dy) + ky * (-dx)) * t.kameScale;
                var ny = (kx * dx + ky * (-dy)) * t.kameScale;
                if (j > 0) {
                    drawLine(ctx, ix + px, iy + py, ix + nx, iy + ny);
                }
                px = nx;
                py = ny;
            }
        }
    }

    function drawImg() {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(deg2rad(t.angle));
        ctx.translate(-t.x, -t.y);
        ctx.drawImage(t._looks, t.x - t.width / 2, t.y - t.height / 2, t.width, t.height);
        ctx.restore();
    }

    // (int)n / 2 % 4 => 0->0 , 1->1 , 2->0 , 3->2
    function getMotion() {
        var tmp = parseInt(t.kameType / 2) % 4;
        return parseInt(tmp % 2 + tmp / 3);
    }

}

function drawLine(ctx, x, y, dx, dy) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(dx, dy);
    ctx.closePath();
    ctx.stroke();
}

function drawLocus(t) {
    var canvas = document.getElementById('locusCanvas');
    if (!canvas.getContext) {
        return;
    }
    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = t.penColor;
    drawLine(ctx, t.rx, t.ry, t.x, t.y);
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

function start(f) {
    _mth = Thread.create(f);
}

function random(n) {
    return parseInt(Math.random() * n);
}

// windows.size -> canvasSize
function canvasSize(w, h) {
    var tc = document.getElementById('turtleCanvas');
    var lc = document.getElementById('locusCanvas');
    tc.width = w;
    tc.height = h;
    lc.width = w;
    lc.height = h;
}

/*global main*/
function restart() {
    clearTurtleCanvas();
    clearLocusCanvas();
    document.getElementById('console').value = "";
    try {
        _mth.kill();
        _th.kill();
    } catch (e) {
        // TODO mth,thが終了時に例外が出る、無視でok?
        println("ERROR [" + e + "]");
    }
    _ttls = [];
    main();
}

// TODO MAXスピードが遅い、関数呼び出しのオーバーヘッド？
function changeSpeed(x) {
    _sleepTime = Number(x);
    if (Number(x) === 0) {
        _moveStep = 1000;
        _rotateStep = 1000;
    } else {
        _moveStep = DEFAULT_MOVE_STEP;
        _rotateStep = DEFAULT_ROTATE_STEP;
    }
}

function print() {
    var str = "";
    for (var i = 0; i < arguments.length - 1; i++) {
        str += arguments[i] + ',';
    }
    str += arguments[arguments.length - 1];
    var msgArea = document.getElementById('console');
    msgArea.value += str;
    while (msgArea.value.length > 1000) {
        msgArea.value = msgArea.value.split('\n').slice(1).join('\n');
    }
    msgArea.scrollTop = msgArea.scrollHeight;
}

function println() {
    var str = "";
    for (var i = 0; i < arguments.length - 1; i++) {
        str += arguments[i] + ',';
    }
    str += arguments[arguments.length - 1];
    print(str + '\n');
}

/* イベント関係 */

var _keys = {};
var _recentPressKey = -1;
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

var _mx = -1,
    _my = -1;
var MOUSE_LEFT = 0;
var MOUSE_RIGHT = 2;
var _mouseLeftDown = false;
var _mouseRightDown = false;
var _wclick = false;
document.addEventListener('mousemove', mouseMove);
document.addEventListener('mousedown', _mouseDown);
document.addEventListener('mouseup', mouseUp);
document.addEventListener('dblclick', mouseDoubleClick);

function key() {
    return _recentPressKey;
}

function keyDown(e) {
    _keys[e.keyCode] = true;
    _recentPressKey = e.keyCode;
}

function keyUp(e) {
    _keys[e.keyCode] = false;
    if (_recentPressKey === e.keyCode) {
        _recentPressKey = -1;
    }
}

function isPressing(keyCode) {
    return _keys[keyCode] ? _keys[keyCode] : false;
}
// TODO 座標のずれをどうするか
function mouseMove(e) {
    _mx = document.body.scrollLeft + e.clientX - 332;
    _my = document.body.scrollTop + e.clientY - 76;
}

function mouseX() {
    return _mx;
}

function mouseY() {
    return _my;
}

function _mouseDown(e) {
    _mouseLeftDown = (_mouseLeftDown || (e.button === MOUSE_LEFT));
    _mouseRightDown = (_mouseRightDown || (e.button === MOUSE_RIGHT));
}

function mouseUp(e) {
    _mouseLeftDown = (_mouseLeftDown && (e.button !== MOUSE_LEFT));
    _mouseRightDown = (_mouseRightDown && (e.button !== MOUSE_RIGHT));
}

function mouseDown() {
    return (_mouseLeftDown || _mouseRightDown);
}

function leftMouseDown() {
    return (mouseDown() && _mouseLeftDown);
}

function rightMouseDown() {
    return (mouseDown() && _mouseRightDown);
}

function doubleClick() {
    var tmp = _wclick;
    _wclick = false;
    return tmp;
}

function mouseDoubleClick(e) {
    _wclick = true;
}

// 最初に実装していたinputの方式
//function entered(k, id) {
//    if (k === KEY_ENTER) {
//        var text = document.getElementById(id);
//        _inputText = text.value;
//        println("INPUT [" + _inputText + "]");
//        text.value = "";
//        _inputted = true;
//    }
//}

/* global swal*/
// TODO input("1辺の長さを入力してください")で入力用のメッセージ表示はどうか
function input() {
    //  入力待ち用にスレッドを生成
    _th = Thread.create(function () {
        while (!_inputted) {
            sleep(1);
        }
        sleep(200); // Input用ウィンドウが消えるのを待つ
        _inputted = false;
    });

    swal({
            title: "An input!",
            type: "input",
            allowEscapeKey: false,
            closeOnConfirm: false
        },
        function (inputValue) {
            if (inputValue === "") {
                swal.showInputError("You need to write something!");
                return false;
            }
            _inputText = inputValue;
            println("INPUT [" + _inputText + "]");
            _inputted = true;             // th.kill(); 本当はこうしたい
            swal.close();
        }
    );

}

// 亀描画用データ
var kameMotions = [
    // Front
    [[-12, -6, -12, 6, 0, 18, 12, 6, 12, -6, 0, -18, -12, -6],
        [-18, -12, -12, -6],
        [-6, -24, 0, -18, 6, -24],
        [12, -6, 18, -12],
        [12, 6, 18, 12],
        [-6, 24, 0, 18, 6, 24],
        [-18, 12, -12, 6],
        [-18, 12, -18, -12, -6, -24, 6, -24, 18, -12, 18, 12, 6, 24, -6,
            24, -18, 12], [-15, -15, -18, -24, -9, -21],
        [9, -21, 18, -24, 15, -15], [15, 15, 18, 24, 9, 21],
        [-9, 21, -18, 24, -15, 15], [-3, 24, 0, 30, 3, 24],
        [-6, -24, -12, -36, -6, -48, 6, -48, 12, -36, 6, -24]],
    // Left
    [[-12, -6, -12, 6, 0, 18, 12, 6, 12, -6, 0, -18, -12, -6],
        [-18, -12, -12, -6],
        [-6, -24, 0, -18, 6, -24],
        [12, -6, 18, -12],
        [12, 6, 18, 12],
        [-6, 24, 0, 18, 6, 24],
        [-18, 12, -12, 6],
        [-18, 12, -18, -12, -6, -24, 6, -24, 18, -12, 18, 12, 6, 24, -6,
            24, -18, 12], [-15, -15, -24, -18, -9, -21],
        [-9, 21, -24, 18, -15, 15], [-3, 24, -3, 30, 3, 24],
        [-6, -24, -6, -36, 0, -48, 12, -48, 18, -36, 6, -24],
        [9, -21, 18, -30, 15, -15], [15, 15, 18, 30, 9, 21]],
    // Right
    [
        [-12, -6, -12, 6, 0, 18, 12, 6, 12, -6, 0, -18, -12, -6],
        [-18, -12, -12, -6],
        [-6, -24, 0, -18, 6, -24],
        [12, -6, 18, -12],
        [12, 6, 18, 12],
        [-6, 24, 0, 18, 6, 24],
        [-18, 12, -12, 6],
        [-18, 12, -18, -12, -6, -24, 6, -24, 18, -12, 18, 12, 6, 24, -6,
            24, -18, 12], [-15, -15, -18, -30, -9, -21],
        [-9, 21, -18, 30, -15, 15], [-3, 24, 3, 30, 3, 24],
        [-6, -24, -18, -36, -12, -48, 0, -48, 6, -36, 6, -24],
        [9, -21, 24, -18, 15, -15], [15, 15, 24, 18, 9, 21]]
];