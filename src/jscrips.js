'use strict';

var jsCRiPS = {};

/*global esprima,console,escodegen*/
jsCRiPS.converter = {};
jsCRiPS.converter.convert = function (source) {
    var ast = esprima.parse(source);
    var yieldAST = esprima.parse('jsCRiPS.th.join();').body[0];

    //for debug       
    document.getElementById('ast').value = JSON.stringify(ast, null, 4);

    var processStatement = function (stmt) {
        if (stmt.type === 'BlockStatement') {
            stmt.body = processStatements(stmt.body);
        } else if (stmt.type === 'IfStatement') {  // else if
            if (stmt.consequent) {
                stmt.consequent = processStatement(stmt.consequent);
            }
            if (stmt.alternate) {
                stmt.alternate = processStatement(stmt.alternate);
            }
        } else if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'CallExpression') {
            return newBlock();
        } else if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'AssignmentExpression' &&
            stmt.expression.right.type === 'CallExpression' && stmt.expression.right.callee.name === 'input') {
            return newBlock(stmt.expression.left.name);
        } else if (stmt.type === 'VariableDeclaration' && stmt.declarations[0].init &&
            stmt.declarations[0].init.type === 'CallExpression' && stmt.declarations[0].init.callee.name === 'input') {
            return newBlock(stmt.declarations[0].id.name);
        }
        return stmt;

        function newBlock(inputName) {
            var block = esprima.parse('{}').body[0];
            block.body.push(stmt);
            block.body.push(yieldAST);
            if (inputName) {
                block.body.push(esprima.parse(inputName + ' = jsCRiPS.inputText;').body[0]);
            }
            return block;
        }

    };

    var processStatements = function (stmts) {
        var newStmts = [];
        stmts.forEach(function (each) {
            if (each.type === 'BlockStatement') {
                each.body = processStatements(each.body);
            } else if (each.type === 'IfStatement') {
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
            } else if (each.type === 'ExpressionStatement' && each.expression.type === 'AssignmentExpression' &&
                each.expression.right.type === 'CallExpression' && each.expression.right.callee.name === 'input') {
                // TODO var x=input(),y=input() や f(input()) や if(input()=='abc')などには未対応
                newStmts.push(yieldAST);
                newStmts.push(esprima.parse(each.expression.left.name + ' = jsCRiPS.inputText;').body[0]);
            } else if (each.type === 'VariableDeclaration' && each.declarations[0].init &&
                each.declarations[0].init.type === 'CallExpression' && each.declarations[0].init.callee.name === 'input') {
                newStmts.push(yieldAST);
                newStmts.push(esprima.parse(each.declarations[0].id.name + ' = jsCRiPS.inputText;').body[0]);
            }
        });
        return newStmts;
    };

    ast.body = processStatements(ast.body);
    return escodegen.generate(ast);
};
// 開始時に例外が出ないために予めスレッドを生成しておく、例外を無視する仕様にした場合いらなくなるかも
// メインスレッド
jsCRiPS.mth = Concurrent.Thread.create(function () {
    Thread.stop();
});
// スレッド制御用
jsCRiPS.th = Concurrent.Thread.create(function () {
    Thread.stop();
});
jsCRiPS.ttls = []; // タートルを管理するリスト
jsCRiPS.imgs = {}; // 画像を管理するマップ
jsCRiPS.inputText = ''; // 入力されたテキスト
jsCRiPS.inputted = false; // 入力制御用

/*global Concurrent*/
var Thread = Concurrent.Thread;
jsCRiPS.DEFAULT_MOVE_STEP = 2;
jsCRiPS.DEFAULT_ROTATE_STEP = 5;
jsCRiPS.sleepTime = 10;
jsCRiPS.moveStep = jsCRiPS.DEFAULT_MOVE_STEP;
jsCRiPS.rotateStep = jsCRiPS.DEFAULT_ROTATE_STEP;

jsCRiPS.KEY_ENTER = 13;

jsCRiPS.DEFAULT_FONT = 'MS Gothic';
jsCRiPS.FONT_SIZE = 16;

jsCRiPS.LIST_MARGIN = 12;

jsCRiPS.CARD_MARGIN = 5;

function createTurtle() {
    var t = {};

    t.x = 100.0; // (x,y)は対象の中心を示す
    t.y = 100.0;

    t.rx = t.x; // (x,y)から(rx,ry)まで線を引く
    t.ry = t.y;

    t.angle = -90;

    t._isShow = true;

    t.penDown = true;
    t.penColor = 'black';
    t._fontsize = jsCRiPS.FONT_SIZE;

    t.kameType = 0;
    t.kameColor = 'green';

    t._looks = null;
    t.str = null;

    t.kameScale = 0.4;
    t.width = 30;
    t.height = 50;

    // 基本的な命令
    t.rt = function (deg) {
        if (deg < 0) {
            t.lt(-deg);
        } else {
            jsCRiPS.th = Thread.create(function (deg, t) {
                var tmpAngle = t.angle;
                var tmpPendown = t.penDown;
                t.up();
                for (var i = jsCRiPS.rotateStep; i < deg; i += jsCRiPS.rotateStep) {
                    draw(t);
                    t.angle += jsCRiPS.rotateStep;
                    Thread.sleep(jsCRiPS.sleepTime);
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
            jsCRiPS.th = Thread.create(function (deg, t) {
                var tmpAngle = t.angle;
                var tmpPendown = t.penDown;
                t.up();
                for (var i = jsCRiPS.rotateStep; i < deg; i += jsCRiPS.rotateStep) {
                    draw(t);
                    t.angle -= jsCRiPS.rotateStep;
                    Thread.sleep(jsCRiPS.sleepTime);
                }
                t.angle = tmpAngle - deg;
                draw(t);
                t.penDown = tmpPendown;
            }, deg, t);
        }
    };

    t.fd = function (d) {
        if (d < 0) {
            t.bk(-d);
        } else {
            jsCRiPS.th = Thread.create(function (d, t) {
                var xx = t.x,
                    yy = t.y;
                var dx = Math.cos(deg2rad(t.angle));
                var dy = Math.sin(deg2rad(t.angle));
                t.setRxRy();
                for (var i = jsCRiPS.moveStep; i < d; i += jsCRiPS.moveStep) {
                    t.x = xx + dx * i;
                    t.y = yy + dy * i;
                    draw(t);
                    t.setRxRy();
                    Thread.sleep(jsCRiPS.sleepTime);
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
            jsCRiPS.th = Thread.create(function (d, t) {
                var xx = t.x,
                    yy = t.y;
                var dx = Math.cos(deg2rad(t.angle));
                var dy = Math.sin(deg2rad(t.angle));
                t.setRxRy();
                for (var i = jsCRiPS.moveStep; i < d; i += jsCRiPS.moveStep) {
                    t.x = xx - dx * i;
                    t.y = yy - dy * i;
                    draw(t);
                    t.setRxRy();
                    Thread.sleep(jsCRiPS.sleepTime);
                }
                t.x = xx - dx * d;
                t.y = yy - dy * d;
                draw(t);
            }, d, t);
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


    // 座標に関する命令
    t.warp = function (x, y) {
        var tmpPendown = t.penDown;
        t.up();
        t.x = x;
        t.x = x;
        t.y = y;
        t.setRxRy();
        t.penDown = tmpPendown;
    };

    t.warpByTopLeft = function (x, y) {
        t.warp(x + t.width / 2, y + t.height / 2);
    };

    t.getX = function () {
        return t.x;
    };

    t.getY = function () {
        return t.y;
    };


    // 大きさに関する命令
    t.size = function (w, h) {
        t.setWidth(w);
        t.setHeight(h);
    };

    t.getWidth = function () {
        return t.width;
    };

    t.getHeight = function () {
        return t.height;
    };

    t.scale = function (n) {
        t.setWidth(t.width * n);
        t.setHeight(t.height * n);
    };

    t.large = function (n) {
        t.setWidth(t.width + n);
        t.setHeight(t.height + n);
    };

    t.small = function (n) {
        t.setWidth(t.width - n);
        t.setHeight(t.height - n);
    };

    t.wide = function (n) {
        t.setWidth(t.width + n);
    };

    t.narrow = function (n) {
        t.setWidth(t.width - n);
    };

    t.tall = function (n) {
        t.setHeight(t.height + n);
    };

    t.little = function (n) {
        t.setHeight(t.height - n);
    };

    t.setWidth = function (w) {
        if (w < 0) {
            t.width = 0;
        } else {
            t.width = w;
        }
    };

    t.setHeight = function (h) {
        if (h < 0) {
            t.height = 0;
        } else {
            t.height = h;
        }
    };


    // オブジェクトを出現/隠す命令
    t.show = function (b) {
        if (typeof b === 'undefined') {
            t._isShow = true;
        } else if (typeof b === 'boolean') {
            t._isShow = b;
        } else {
            println('引数の型が間違っています');
        }
    };

    t.hide = function () {
        t._isShow = false;
    };

    t.isShow = function () {
        return t._isShow;
    };

    //  オブジェクトの見た目を変える命令
    t.looks = function (tt) {
        if (typeof tt._looks !== 'undefined') {  // tt extends Turtle
            t._looks = tt._looks;
            t.str = tt.str;
            t._fontsize = tt._fontsize;
            t.penColor = tt.penColor;
            t.width = tt.width;
            t.height = tt.height;
            t.angle = tt.angle;
            t.draw = tt.draw;
        } else {
            println('looks対象が間違っています[' + tt + ']');
        }
    };


    // オブジェクトの接触に関する命令
    // 参考：http://mclass13.web.fc2.com/hsplecture/nanamekukei.htm
    //  isPointInPath()を使う方法も考えられる
    t.contains = function (tx, ty) {
        var xx = t.x - t.width / 2, yy = t.y - t.height / 2;
        var cx = t.x,
            cy = t.y;
        var l = Math.sqrt((tx - cx) * (tx - cx) + (ty - cy) * (ty - cy));
        var r2 = Math.atan((ty - cy) / (tx - cx)) - deg2rad(t.angle);
        var tx2 = l * Math.cos(r2) + cx;
        var ty2 = l * Math.sin(r2) + cy;
        return xx <= tx2 && tx2 <= xx + t.width &&
            yy <= ty2 && ty2 <= yy + t.height;
    };

    t.intersects = function (trg) {
        // TODO 未実装
        if (!trg.x || !trg.y) {
            return false;
        }
        return t.contains(trg.x, trg.y);
    };


    // 補助
    t.setRxRy = function () {
        t.rx = t.x;
        t.ry = t.y;
    };

    t.printState = function () {
        println(
            '(x,y) = (' + parseInt(t.x) + ',' + parseInt(t.y) + ')\n' +
            'angle = ' + t.angle + '\n' +
            '(width,height) = (' + t.width + ',' + t.height + ')'
        );
    };


    //　描画関係
    t.draw = function (ctx) {
        var self = this;
        var data = jsCRiPS.kameMotions[getMotion()];
        var dx = Math.cos(deg2rad(self.angle)), dy = Math.sin(deg2rad(self.angle));
        var ix = self.x, iy = self.y;
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
        // (int)n / 2 % 4 => 0->0 , 1->1 , 2->0 , 3->2
        function getMotion() {
            var tmp = parseInt(t.kameType / 2) % 4;
            return parseInt(tmp % 2 + tmp / 3);
        }
    };

    jsCRiPS.ttls.push(t);
    return t;
}

// アニメーションを必要としないタートルの親
function createObjectTurtle() {
    var t = createTurtle();

    t.isObject = true;

    // override アニメーションなし
    t.fd = function (d) {
        if (d < 0) {
            t.bk(-d);
        } else {
            jsCRiPS.th = Thread.create(function (d, t) {
                var xx = t.x,
                    yy = t.y;
                var dx = Math.cos(deg2rad(t.angle));
                var dy = Math.sin(deg2rad(t.angle));
                t.setRxRy();
                t.x = xx + dx * d;
                t.y = yy + dy * d;
            }, d, t);
        }
    };

    t.bk = function (d) {
        if (d < 0) {
            t.fd(-d);
        } else {
            jsCRiPS.th = Thread.create(function (d, t) {
                var xx = t.x,
                    yy = t.y;
                var dx = Math.cos(deg2rad(t.angle));
                var dy = Math.sin(deg2rad(t.angle));
                t.setRxRy();
                t.x = xx - dx * d;
                t.y = yy - dy * d;
            }, d, t);
        }
    };

    t.rt = function (deg) {
        if (deg < 0) {
            t.lt(-deg);
        } else {
            jsCRiPS.th = Thread.create(function (deg, t) {
                var tmpAngle = t.angle;
                var tmpPendown = t.penDown;
                t.up();
                t.angle = tmpAngle + deg;
                t.penDown = tmpPendown;
            }, deg, t);
        }
    };

    t.lt = function (deg) {
        if (deg < 0) {
            t.rt(-deg);
        } else {
            jsCRiPS.th = Thread.create(function (deg, t) {
                var tmpAngle = t.angle;
                var tmpPendown = t.penDown;
                t.up();
                t.angle = tmpAngle - deg;
                t.penDown = tmpPendown;
            }, deg, t);
        }
    };

    t.drawObject = function (ctx, self, f) {
        t.drawScalableObject(ctx, self, 1, 1, f);
    };

    t.drawScalableObject = function (ctx, self, xr, yr, f) {
        ctx.save();
        ctx.translate(self.x, self.y);
        ctx.rotate(deg2rad(self.angle));
        ctx.scale(xr, yr);
        ctx.translate(-self.x, -self.y);
        f();
        ctx.restore();
    };

    t.penDown = false;
    t.angle = 0;
    return t;
}

function createImageTurtle(imgName) {
    var t = createObjectTurtle(); // 先頭に書かないとなんかおかしくなる？
    if (jsCRiPS.imgs[imgName] === undefined) {
        var img = new Image();
        img.src = imgName;
        jsCRiPS.imgs[imgName] = img;
        img.onerror = function () {
            document.getElementById('console').value +=
                document.getElementById('console').value + '画像[' + imgName + ']が見つかりません\n';
        };
    }
    t._looks = jsCRiPS.imgs[imgName];
    t.width = t._looks.width;
    t.height = t._looks.height;

    // override
    t.draw = function (ctx) {
        var self = this;
        t.drawObject(ctx, self, function () {
            ctx.drawImage(self._looks, self.x - self.width / 2, self.y - self.height / 2, self.width, self.height);
        });
    };

    return t;
}

function createTextTurtle(str) {
    var t = createObjectTurtle();
    t.str = str;

    // テキストの中身を変える命令
    t.text = function (newStr) {
        if (typeof newStr === 'undefined') {
            return t.text;
        }
        t.str = newStr;
        resize();
    };


    // TurtleCafeのマニュアルにはないがCRiPSで実装されていた関数、どうせCardTurtleで使う
    t.fontsize = function (fs) {
        if (typeof fs === 'undefined') {
            return t._fontsize;
        }
        t._fontsize = fs;
        resize();
    };

    t.getNumber = function () {
        return (Number.isNaN(Number(t.str)) || Number.isNaN(parseInt(t.str, 10))) ? -1 : Number(t.str);
    };

    t.getText = function () {
        return t.str;
    };


    // 描画関係
    resize();
    function resize() {
        var canvas = document.getElementById('turtleCanvas');
        if (!canvas.getContext) {
            return;
        }
        var ctx = canvas.getContext('2d');
        ctx.font = t._fontsize + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        t.width = ctx.measureText(str).width;
        t.height = t._fontsize;
    }

    // override
    t.draw = function (ctx) {
        var self = this;
        ctx.font = t._fontsize + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = self.penColor;
        var defaultWidth = ctx.measureText(str).width;
        var defaultHeight = self._fontsize;

        t.drawScalableObject(ctx, self, self.width / defaultWidth, self.height / defaultHeight, function () {
            ctx.fillText(self.str, self.x, self.y);
        });
    };

    return t;
}

function createListTurtle(autoHide, name) {
    var t = createObjectTurtle();
    t.name = name;
    t.show(!autoHide);

    t.list = [];
    t.cursor = 0;
    t.bgColor = "white";

    t.actualWidth = 0;
    t.actualHeight = 0;
    t.width = t.height = 0; // ListTurtleではwidthとheightを追加幅として扱う

    t.nameWidth = 0;
    if (typeof name !== 'undefined') {
        var canvas = document.getElementById('turtleCanvas');
        if (!canvas.getContext) {
            return;
        }
        var ctx = canvas.getContext('2d');
        ctx.font = jsCRiPS.FONT_SIZE + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        t.nameWidth = ctx.measureText(t.name).width;
    }

    // override
    t.getWidth = function () {
        var self = this;
        return self.width + t.actualWidth;
    };

    t.getHeight = function () {
        var self = this;
        return self.height + t.actualHeight;
    };

    t.scale = function (n) {
        t.width = t.actualWidth * n - t.actualWidth;
        t.height = t.actualHeight * n - t.actualHeight;
    };


    // 追加と削除
    t.add = function (x, obj) {
        if (typeof obj !== 'undefined') { // add(n,obj)の場合
            if (x < 0 || t.list.length < x) {
                println("[ add(" + x + "," + obj + ") ]挿入位置が不適切なので末尾に追加しました。");
                t.list.push(obj);
            } else {
                t.list.splice(x, 0, obj);
            }
        } else {    // add(obj)の場合
            t.list.push(x);
        }
    };

    t.addLast = function (obj) {
        t.add(obj);
    };

    t.addFirst = function (obj) {
        t.list.unshift(obj);
    };

    t.addAll = function (that) {
        t.list = t.list.concat(that.list);
    };

    t.moveAllTo = function (that) {
        that.addAll(t);
    };

    t.remove = function (x) {
        var trgIdx = -1;
        if (typeof x === 'number') {  // xがIndexの場合
            trgIdx = x;
        } else {  // xがオブジェクトだと思われる場合
            for (var i = 0; i < t.list.length; i++) {
                if (x === t.list[i]) {
                    trgIdx = i;
                }
            }
            if (trgIdx === -1) {
                println("remove対象が存在しません。");
                return;
            }
        }
        return t.list.splice(trgIdx, 1);
    };

    t.removeFirst = function () {
        return t.list.shift();
    };

    t.removeLast = function () {
        return t.list.pop();
    };

    t.removeAll = function () {
        t.list.length = 0;
    };


    // 取得関係
    t.get = function (idx) {
        return t.list[idx];
    };

    t.getSize = function () {
        return t.list.length;
    };


    // カーソル関係
    t.getCursor = function () {
        return t.cursor;
    };

    t.setCursor = function (newCursor) {
        if (newCursor < 0) {
            t.cursor = 0;
        } else if (newCursor <= t.list.length) {
            t.cursor = newCursor % t.list.length;
        } else {
            t.cursor = newCursor;
        }
    };

    t.moveCursorToNext = function () {
        if (t.list.length === 0) {
            t.cursor = 0;
        } else {
            t.cursor = (t.cursor + 1) % t.list.length;
        }
    };

    t.moveCursorToPrevious = function () {
        if (t.list.length === 0) {
            t.cursor = 0;
        } else {
            t.cursor = (t.cursor === 0) ? t.list.length - 1 : t.cursor - 1;
        }
    };

    t.getObjectAtCursor = function () {
        return t.list[t.cursor];
    };

    t.addToCursor = function (obj) {
        t.add(t.cursor, obj);
    };

    t.addToBeforeCursor = function (obj) {
        t.addToCursor(obj);
    };

    t.addToAfterCursor = function (obj) {
        t.add(t.cursor + 1, obj);
    };

    t.removeAtCursor = function () {
        t.remove(t.cursor);
    };

    // 型がないし、そもそもいらない？
    t.getNumberAtCursor = function () {
        return t.getObjectAtCursor();
    };

    // 型がないし、そもそもいらない？
    t.getStringAtCursor = function () {
        return t.getObjectAtCursor();
    };


    // その他の命令
    // アルゴリズム：http://qiita.com/minodisk/items/94b6287468d0e165f6d9,https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    t.shuffle = function () {
        var i, j, temp;
        var arr = t.list.slice();
        i = arr.length;
        if (i === 0) {
            return arr;
        }
        while (--i) {
            j = Math.floor(Math.random() * (i + 1));
            temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        t.list = arr;
    };

    t.setBgColor = function (color) {
        t.bgColor = color;
    };

    // 内部で呼ばれる描画関係
    t.resize = function () {
        var self = this;
        var width = jsCRiPS.LIST_MARGIN;
        var maxHeight = 0;
        if (self.list.length !== 0) {
            for (var i = 0; i < self.list.length; i++) {
                var obj = self.list[i];
                width += obj.width + jsCRiPS.LIST_MARGIN;
                maxHeight = (maxHeight < obj.height) ? obj.height : maxHeight;
            }
            t.actualWidth = width;
            t.actualHeight = maxHeight + jsCRiPS.LIST_MARGIN * 2;
        } else {
            t.actualWidth = 60;
            t.actualHeight = 30;
        }
        if (typeof name !== 'undefined') {
            if (t.nameWidth > t.actualWidth) {
                t.actualWidth = t.nameWidth + jsCRiPS.LIST_MARGIN * 2;
            }
            t.actualHeight += jsCRiPS.FONT_SIZE + jsCRiPS.LIST_MARGIN;
        }
    };

    // override
    t.draw = function (ctx) {
        var self = this;
        t.resize();
        var w = t.getWidth(), h = t.getHeight();
        var x = t.x - t.width, y = t.y - t.height;
        var wr = w / t.actualWidth, hr = h / t.actualHeight;
        println(t.actualWidth, t.actualHeight, w, h, wr, hr);
        // 背景と外枠
        t.drawScalableObject(ctx, self, wr, hr, function () {
            ctx.fillStyle = t.bgColor;
            ctx.fillRect(x, y, w, h);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            ctx.strokeRect(x, y, w, h);
        });
        x += jsCRiPS.LIST_MARGIN;
        y += jsCRiPS.LIST_MARGIN;

        // ListTurtleの名前
        if (typeof t.name !== 'undefined') {
            ctx.font = jsCRiPS.FONT_SIZE + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'black';
            t.drawScalableObject(ctx, self, wr, hr, function () {
                ctx.fillText(self.name, x + ctx.measureText(t.name).width / 2, y);
            });
            y += jsCRiPS.FONT_SIZE + jsCRiPS.LIST_MARGIN;
        }

        // 各要素
        for (var i = 0; i < t.list.length; i++) {
            var obj = t.list[i];
            var tx = obj.x, ty = obj.y, tangle = obj.angle;
            obj.warp(x + obj.width / 2, y + obj.height / 2);
            if (obj.isObject) {
                obj.angle = 0;
            }
            drawListElem(ctx, t, obj);
            obj.warp(tx, ty);
            obj.angle = tangle;
            if (t.cursor === i) { // cursorのあたっている要素の場合赤い枠で囲む
                drawCursorRect(x, y, self.angle);
            }
            x += jsCRiPS.LIST_MARGIN + obj.width;
        }

        function drawListElem(ctx, t, obj) {
            t.drawScalableObject(ctx, self, wr, hr, function () {
                obj.draw(ctx);
            });
        }

        function drawCursorRect(x, y) {
            t.drawScalableObject(ctx, self, wr, hr, function () {
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'red';
                ctx.strokeRect(x, y, obj.width, obj.height);
            });
        }
    };

    return t;
}

function createCardTurtle(str) {
    var t = createTextTurtle(str);   // CRiPSではImageTurtleを継承していたがTextTurtleに変更

    // 描画関係
    resize();
    // override
    function resize() {
        var canvas = document.getElementById('turtleCanvas');
        if (!canvas.getContext) {
            return;
        }
        var ctx = canvas.getContext('2d');
        ctx.font = t._fontsize + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        t.width = ctx.measureText(str).width + jsCRiPS.CARD_MARGIN * 2;
        t.height = t._fontsize + jsCRiPS.CARD_MARGIN * 2;
    }

    // override
    t.draw = function (ctx) {
        var self = this;
        ctx.font = t._fontsize + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = self.penColor;
        ctx.strokeStyle = self.penColor;
        var defaultWidth = ctx.measureText(str).width;
        var defaultHeight = self._fontsize;

        t.drawScalableObject(ctx, self, self.width / defaultWidth, self.height / defaultHeight, function () {
            ctx.fillText(self.str, self.x, self.y);
        });
        t.drawObject(ctx, self, function () {
            ctx.strokeRect(self.x - self.width / 2, self.y - self.height / 2, self.width, self.height);
        });
    };

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
    if (t) {    // t == Turtle
        t.kameType++;
    }
    for (var i = 0; i < jsCRiPS.ttls.length; i++) {
        if (jsCRiPS.ttls[i]._isShow) {
            drawTurtle(jsCRiPS.ttls[i]);
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
    t.draw(ctx);
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

// ユーザー用、秒単位で指定
// TODO 外部から呼ばれない問題、別の何かが呼ばれてる？
function sleep(s) {
    println(s);
    Thread.sleep(s * 1000);
}

function update() {
    draw();
}

function start(f) {
    jsCRiPS.mth = Thread.create(f);
}

function random(n) {
    return parseInt(Math.random() * n);
}

// CRiPS#windows.size -> jsCRiPS#canvasSize
function canvasSize(w, h) {
    var tc = document.getElementById('turtleCanvas');
    var lc = document.getElementById('locusCanvas');
    tc.width = w;
    tc.height = h;
    lc.width = w;
    lc.height = h;
    tc.parentNode.style.width = w + 'px';
    tc.parentNode.style.height = h + 'px';
}

/*global main*/
function restart() {
    clearTurtleCanvas();
    clearLocusCanvas();
    document.getElementById('console').value = '';
    try {
        jsCRiPS.mth.kill();
        jsCRiPS.th.kill();
    } catch (e) {
        // TODO mth,thが終了時に例外が出る、無視でok?
        println('ERROR [' + e + ']');
    }
    jsCRiPS.mth = Thread.create(function () {
    }); // これらが無いと最初のprint系でjoinし続ける？
    jsCRiPS.th = Thread.create(function () {
    });

    jsCRiPS.ttls = [];
    main();
}

// TODO MAXスピードが遅い、関数呼び出しのオーバーヘッド？
function changeSpeed(x) {
    jsCRiPS.sleepTime = Number(x);
    if (Number(x) === 0) {
        jsCRiPS.moveStep = 1000;
        jsCRiPS.rotateStep = 1000;
    } else {
        jsCRiPS.moveStep = jsCRiPS.DEFAULT_MOVE_STEP;
        jsCRiPS.rotateStep = jsCRiPS.DEFAULT_ROTATE_STEP;
    }
}

function print() {
    var str = '';
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
    var str = '';
    for (var i = 0; i < arguments.length - 1; i++) {
        str += arguments[i] + ',';
    }
    str += arguments[arguments.length - 1];
    print(str + '\n');
}

/* -----イベント関係----- */

// リスナー登録より上で宣言する必要あり
jsCRiPS.keyDown = function (e) {
    jsCRiPS.keys[e.keyCode] = true;
    jsCRiPS.recentPressKey = e.keyCode;
};

jsCRiPS.keyUp = function (e) {
    jsCRiPS.keys[e.keyCode] = false;
    if (jsCRiPS.recentPressKey === e.keyCode) {
        jsCRiPS.recentPressKey = -1;
    }
};

jsCRiPS.mouseMove = function (e) {
    var r = e.target.getBoundingClientRect();
    jsCRiPS.mx = e.clientX - r.left;
    jsCRiPS.my = e.clientY - r.top;
};

jsCRiPS.mouseDown = function (e) {
    jsCRiPS.mouseLeftDown = (jsCRiPS.mouseLeftDown || (e.button === jsCRiPS.MOUSE_LEFT));
    jsCRiPS.mouseRightDown = (jsCRiPS.mouseRightDown || (e.button === jsCRiPS.MOUSE_RIGHT));
};

jsCRiPS.mouseUp = function (e) {
    jsCRiPS.mouseLeftDown = (jsCRiPS.mouseLeftDown && (e.button !== jsCRiPS.MOUSE_LEFT));
    jsCRiPS.mouseRightDown = (jsCRiPS.mouseRightDown && (e.button !== jsCRiPS.MOUSE_RIGHT));
};
// TODO ダブルクリックをクリックと認識していいか？
jsCRiPS.mouseClick = function (e) {
    jsCRiPS.leftClick = (jsCRiPS.leftClick || (e.button === jsCRiPS.MOUSE_LEFT));
    jsCRiPS.rightClick = (jsCRiPS.rightClick || (e.button === jsCRiPS.MOUSE_RIGHT));
};

jsCRiPS.mouseDoubleClick = function (e) {
    jsCRiPS.wclick = true;
};

jsCRiPS.keys = {};
jsCRiPS.recentPressKey = -1;
document.addEventListener('keydown', jsCRiPS.keyDown);
document.addEventListener('keyup', jsCRiPS.keyUp);

jsCRiPS.mx = -1;
jsCRiPS.my = -1;
jsCRiPS.MOUSE_LEFT = 0;
jsCRiPS.MOUSE_RIGHT = 2;
jsCRiPS.mouseLeftDown = false;
jsCRiPS.mouseRightDown = false;
jsCRiPS.leftClick = false;
jsCRiPS.rightClick = false;
jsCRiPS.wclick = false;
document.addEventListener('mousemove', jsCRiPS.mouseMove);
document.addEventListener('mousedown', jsCRiPS.mouseDown);
document.addEventListener('mouseup', jsCRiPS.mouseUp);
document.addEventListener('click', jsCRiPS.mouseClick);
document.addEventListener('dblclick', jsCRiPS.mouseDoubleClick);

// キー・マウス入力に関する命令
function key() {
    return jsCRiPS.recentPressKey;
}

function keyDown(keyCode) {
    return isPressing(keyCode);
}

function isPressing(keyCode) {
    return jsCRiPS.keys[keyCode] ? jsCRiPS.keys[keyCode] : false;
}

function mouseX() {
    return jsCRiPS.mx;
}

function mouseY() {
    return jsCRiPS.my;
}

function mouseClicked() {
    var ret = (jsCRiPS.leftClick || jsCRiPS.rightClick);
    jsCRiPS.leftClick = jsCRiPS.rightClick = false;
    return ret;
}

function leftMouseClicked() {
    var ret = jsCRiPS.leftClick;
    jsCRiPS.leftClick = false;
    return ret;
}

function rightMouseClicked() {
    var ret = jsCRiPS.rightClick;
    jsCRiPS.rightClick = false;
    return ret;
}

function doubleClick() {
    var ret = jsCRiPS.wclick;
    jsCRiPS.wclick = false;
    return ret;
}

function mouseDown() {
    return (jsCRiPS.mouseLeftDown || jsCRiPS.mouseRightDown);
}

function leftMouseDown() {
    return (mouseDown() && jsCRiPS.mouseLeftDown);
}

function rightMouseDown() {
    return (mouseDown() && jsCRiPS.mouseRightDown);
}


/* global swal*/
function input(msg) {
    jsCRiPS.th = Thread.create(function () {    //  入力待ち用にスレッドを生成
        while (!jsCRiPS.inputted) {
            Thread.sleep(1);
        }
        Thread.sleep(200); // Input用ウィンドウが消えるのを待つ
        jsCRiPS.inputted = false;
    });

    swal({
            title: msg ? msg : 'An input!',
            type: 'input',
            allowEscapeKey: false,
            closeOnConfirm: false
        },
        function (inputValue) {
            if (inputValue === '') {
                swal.showInputError('You need to write something!');
                return false;
            }
            jsCRiPS.inputText = inputValue;
            println('INPUT [' + jsCRiPS.inputText + ']');
            jsCRiPS.inputted = true;             // th.kill(); 本当はこうしたい
            swal.close();
        }
    );

}

// 亀描画用データ
jsCRiPS.kameMotions = [
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