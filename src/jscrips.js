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
jsCRiPS.tCanvas = {};    // Turtle描画用Canvas
jsCRiPS.lCanvas = {};   // 軌跡描画用Canvas


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
        t.warp(x + t.getWidth() / 2, y + t.getHeight() / 2);
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
    // TODO ListTurtleには非対応、対応させようとすると色々ものすごくめんどくさい
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
        var ctx = jsCRiPS.tCanvas.getContext('2d');
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

// TODO parentCheckすべき？(親がいる場合、要素が移動したら移動元から同じ要素をremoveしていた)
// TOOD 座標は左上を基準にすべき？
function createListTurtle(autoHide, name) {
    var t = createObjectTurtle();
    t.name = name;

    t.list = [];
    t.cursor = 0;
    t.bgColor = "white";

    t.actualWidth = 0;
    t.actualHeight = 0;
    t.width = t.height = 0; // ListTurtleではwidthとheightを追加幅として扱う

    t.nameWidth = 0;
    if (typeof name !== 'undefined') {
        var ctx = jsCRiPS.tCanvas.getContext('2d');
        ctx.font = jsCRiPS.FONT_SIZE + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        t.nameWidth = ctx.measureText(t.name).width;
    }

    // override
    t.getWidth = function () {
        t.resize();
        return t.width + t.actualWidth;
    };

    t.getHeight = function () {
        t.resize();
        return t.height + t.actualHeight;
    };

    t.scale = function (n) {
        t.resize();
        t.width = t.actualWidth * n - t.actualWidth;
        t.height = t.actualHeight * n - t.actualHeight;
    };


    // 追加と削除
    t.add = function (x, obj) {
        if (typeof obj !== 'undefined') { // add(n,obj)の場合
            obj.show(!autoHide);
            if (x < 0 || t.list.length < x) {
                println("[ add(" + x + "," + obj + ") ]挿入位置が不適切なので末尾に追加しました。");
                t.list.push(obj);
            } else {
                t.list.splice(x, 0, obj);
            }
        } else {    // add(obj)の場合
            x.show(!autoHide);
            t.list.push(x);
        }
    };

    t.addLast = function (obj) {
        t.add(obj);
    };

    t.addFirst = function (obj) {
        obj.show(!autoHide);
        t.list.unshift(obj);
    };

    t.addAll = function (that) {
        for (var i = 0; i < that.length; i++) {
            that[i].show(!autoHide);
        }
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
                return null;
            }
        }
        return t.list.splice(trgIdx, 1)[0];
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
        return t.remove(t.cursor);
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
        var width = jsCRiPS.LIST_MARGIN;
        var maxHeight = 0;
        if (t.list.length !== 0) {
            for (var i = 0; i < t.list.length; i++) {
                var obj = t.list[i];
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
            if ((t.nameWidth + jsCRiPS.LIST_MARGIN * 2) > t.actualWidth) {
                t.actualWidth = t.nameWidth + jsCRiPS.LIST_MARGIN * 2;
            }
            t.actualHeight += jsCRiPS.FONT_SIZE + jsCRiPS.LIST_MARGIN;
        }
    };

    // override
    t.draw = function (ctx) {
        t.resize();
        var x = t.x - t.actualWidth / 2, y = t.y - t.actualHeight / 2;
        var wr = t.getWidth() / t.actualWidth, hr = t.getHeight() / t.actualHeight;
        // 背景色と外枠
        t.drawScalableObject(ctx, t, wr, hr, function () {
            ctx.fillStyle = t.bgColor;
            ctx.fillRect(x, y, t.actualWidth, t.actualHeight);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            ctx.strokeRect(x, y, t.actualWidth, t.actualHeight);
        });
        x += jsCRiPS.LIST_MARGIN;
        y += jsCRiPS.LIST_MARGIN;
        // ListTurtleの名前
        if (typeof t.name !== 'undefined') {
            ctx.font = jsCRiPS.FONT_SIZE + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'black';
            t.drawScalableObject(ctx, t, wr, hr, function () {
                ctx.fillText(t.name, x + ctx.measureText(t.name).width / 2, y);
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
                drawCursorRect(x, y, t.angle);
            }
            x += jsCRiPS.LIST_MARGIN + obj.width;
        }

        function drawListElem(ctx, t, obj) {
            t.drawScalableObject(ctx, t, wr, hr, function () {
                obj.draw(ctx);
            });
        }

        function drawCursorRect(x, y) {
            t.drawScalableObject(ctx, t, wr, hr, function () {
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
    var margin2 = +jsCRiPS.CARD_MARGIN * 2;
    // 描画関係
    resize();
    // override
    function resize() {
        var ctx = jsCRiPS.tCanvas.getContext('2d');
        ctx.font = t._fontsize + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        t.width = ctx.measureText(str).width + margin2;
        t.height = t._fontsize + margin2;
    }

    // override
    t.draw = function (ctx) {
        var self = this;
        ctx.font = t._fontsize + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = self.penColor;
        ctx.strokeStyle = self.penColor;
        var defaultWidth = ctx.measureText(str).width + margin2;
        var defaultHeight = self._fontsize + margin2;

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
    var ctx = jsCRiPS.tCanvas.getContext('2d');
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
    var ctx = jsCRiPS.lCanvas.getContext('2d');
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
    var tc = jsCRiPS.tCanvas;
    var lc = jsCRiPS.lCanvas;
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
        println('ERROR [ ' + e + ' ]');
    }
    jsCRiPS.mth = Thread.create(function () {
    }); // これらが無いと最初のprint系でjoinし続ける？
    jsCRiPS.th = Thread.create(function () {
    });

    jsCRiPS.tCanvas = document.getElementById('turtleCanvas');
    jsCRiPS.lCanvas = document.getElementById('locusCanvas');
    if (!jsCRiPS.tCanvas.getContext || !jsCRiPS.lCanvas.getContext) { // 毎回チェックするのは面倒なのでここで一度だけチェックする
        println('ERROR [ 必要なCanvasがありません ]');
        return;
    }

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


// イベント関係
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

// テキストタートルのローマテーブル
// http://echokoda.y0r.net/wp/wp-content/uploads/2010/04/RomaMSIME.txt の重複[fu],[ffu]を削除
var romanConverter = {
    '-' : 'ー',
    '~' : '〜',
    '.' : '。',
    ',' : '、',
    'z/' : '・',
    'z.' : '…',
    'z,' : '‥',
    'zh' : '←',
    'zj' : '↓',
    'zk' : '↑',
    'zl' : '→',
    'z-' : '〜',
    'z[' : '『',
    'z]' : '』',
    '[' : '「',
    ']' : '」',
    'vva' : 'っゔぁ',
    'vvi' : 'っゔぃ',
    'vvu' : 'っゔ',
    'vve' : 'っゔぇ',
    'vvo' : 'っゔぉ',
    'vvya' : 'っゔゃ',
    'vvyi' : 'っゔぃ',
    'vvyu' : 'っゔゅ',
    'vvye' : 'っゔぇ',
    'vvyo' : 'っゔょ',
    'kkya' : 'っきゃ',
    'kkyi' : 'っきぃ',
    'kkyu' : 'っきゅ',
    'kkye' : 'っきぇ',
    'kkyo' : 'っきょ',
    'ggya' : 'っぎゃ',
    'ggyi' : 'っぎぃ',
    'ggyu' : 'っぎゅ',
    'ggye' : 'っぎぇ',
    'ggyo' : 'っぎょ',
    'ssya' : 'っしゃ',
    'ssyi' : 'っしぃ',
    'ssyu' : 'っしゅ',
    'ssye' : 'っしぇ',
    'ssyo' : 'っしょ',
    'ssha' : 'っしゃ',
    'sshi' : 'っし',
    'sshu' : 'っしゅ',
    'sshe' : 'っしぇ',
    'ssho' : 'っしょ',
    'zzya' : 'っじゃ',
    'zzyi' : 'っじぃ',
    'zzyu' : 'っじゅ',
    'zzye' : 'っじぇ',
    'zzyo' : 'っじょ',
    'ttya' : 'っちゃ',
    'ttyi' : 'っちぃ',
    'ttyu' : 'っちゅ',
    'ttye' : 'っちぇ',
    'ttyo' : 'っちょ',
    'ccha' : 'っちゃ',
    'cchi' : 'っち',
    'cchu' : 'っちゅ',
    'cche' : 'っちぇ',
    'ccho' : 'っちょ',
    'ccya' : 'っちゃ',
    'ccyi' : 'っちぃ',
    'ccyu' : 'っちゅ',
    'ccye' : 'っちぇ',
    'ccyo' : 'っちょ',
    'ddya' : 'っぢゃ',
    'ddyi' : 'っぢぃ',
    'ddyu' : 'っぢゅ',
    'ddye' : 'っぢぇ',
    'ddyo' : 'っぢょ',
    'ttsa' : 'っつぁ',
    'ttsi' : 'っつぃ',
    'ttse' : 'っつぇ',
    'ttso' : 'っつぉ',
    'ttha' : 'ってゃ',
    'tthi' : 'ってぃ',
    'tt\'i' : 'ってぃ',
    'tthu' : 'ってゅ',
    'tthe' : 'ってぇ',
    'ttho' : 'ってょ',
    'tt\'yu' : 'ってゅ',
    'ddha' : 'っでゃ',
    'ddhi' : 'っでぃ',
    'dd\'i' : 'っでぃ',
    'ddhu' : 'っでゅ',
    'ddhe' : 'っでぇ',
    'ddho' : 'っでょ',
    'dd\'yu' : 'っでゅ',
    'ttwa' : 'っとぁ',
    'ttwi' : 'っとぃ',
    'ttwu' : 'っとぅ',
    'ttwe' : 'っとぇ',
    'ttwo' : 'っとぉ',
    'tt\'u' : 'っとぅ',
    'ddwa' : 'っどぁ',
    'ddwi' : 'っどぃ',
    'ddwu' : 'っどぅ',
    'ddwe' : 'っどぇ',
    'ddwo' : 'っどぉ',
    'dd\'u' : 'っどぅ',
    'hhya' : 'っひゃ',
    'hhyi' : 'っひぃ',
    'hhyu' : 'っひゅ',
    'hhye' : 'っひぇ',
    'hhyo' : 'っひょ',
    'bbya' : 'っびゃ',
    'bbyi' : 'っびぃ',
    'bbyu' : 'っびゅ',
    'bbye' : 'っびぇ',
    'bbyo' : 'っびょ',
    'ppya' : 'っぴゃ',
    'ppyi' : 'っぴぃ',
    'ppyu' : 'っぴゅ',
    'ppye' : 'っぴぇ',
    'ppyo' : 'っぴょ',
    'ffa' : 'っふぁ',
    'ffi' : 'っふぃ',
    'ffe' : 'っふぇ',
    'ffo' : 'っふぉ',
    'ffya' : 'っふゃ',
    'ffyu' : 'っふゅ',
    'ffyo' : 'っふょ',
    'hhwa' : 'っふぁ',
    'hhwi' : 'っふぃ',
    'hhwe' : 'っふぇ',
    'hhwo' : 'っふぉ',
    'hhwyu' : 'っふゅ',
    'mmya' : 'っみゃ',
    'mmyi' : 'っみぃ',
    'mmyu' : 'っみゅ',
    'mmye' : 'っみぇ',
    'mmyo' : 'っみょ',
    'rrya' : 'っりゃ',
    'rryi' : 'っりぃ',
    'rryu' : 'っりゅ',
    'rrye' : 'っりぇ',
    'rryo' : 'っりょ',
    'xxn' : 'っん',
    'xxa' : 'っぁ',
    'xxi' : 'っぃ',
    'xxu' : 'っぅ',
    'xxe' : 'っぇ',
    'xxo' : 'っぉ',
    'lla' : 'っぁ',
    'lli' : 'っぃ',
    'llu' : 'っぅ',
    'lle' : 'っぇ',
    'llo' : 'っぉ',
    'llyi' : 'っぃ',
    'xxyi' : 'っぃ',
    'llye' : 'っぇ',
    'xxye' : 'っぇ',
    'yye' : 'っいぇ',
    'kka' : 'っか',
    'kki' : 'っき',
    'kku' : 'っく',
    'kke' : 'っけ',
    'kko' : 'っこ',
    'xxka' : 'っヵ',
    'xxke' : 'っヶ',
    'llka' : 'っヵ',
    'llke' : 'っヶ',
    'gga' : 'っが',
    'ggi' : 'っぎ',
    'ggu' : 'っぐ',
    'gge' : 'っげ',
    'ggo' : 'っご',
    'ssa' : 'っさ',
    'ssi' : 'っし',
    'ssu' : 'っす',
    'sse' : 'っせ',
    'sso' : 'っそ',
    'cca' : 'っか',
    'cci' : 'っし',
    'ccu' : 'っく',
    'cce' : 'っせ',
    'cco' : 'っこ',
    'qqa' : 'っくぁ',
    'qqi' : 'っくぃ',
    'qqu' : 'っく',
    'qqe' : 'っくぇ',
    'qqo' : 'っくぉ',
    'kkwa' : 'っくぁ',
    'kkwi' : 'っくぃ',
    'kkwe' : 'っくぇ',
    'kkwo' : 'っくぉ',
    'ggwa' : 'っぐぁ',
    'zza' : 'っざ',
    'zzi' : 'っじ',
    'zzu' : 'っず',
    'zze' : 'っぜ',
    'zzo' : 'っぞ',
    'jja' : 'っじゃ',
    'jji' : 'っじ',
    'jju' : 'っじゅ',
    'jje' : 'っじぇ',
    'jjo' : 'っじょ',
    'jjya' : 'っじゃ',
    'jjyi' : 'っじぃ',
    'jjyu' : 'っじゅ',
    'jjye' : 'っじぇ',
    'jjyo' : 'っじょ',
    'tta' : 'った',
    'tti' : 'っち',
    'ttu' : 'っつ',
    'ttsu' : 'っつ',
    'tte' : 'って',
    'tto' : 'っと',
    'dda' : 'っだ',
    'ddi' : 'っぢ',
    'ddu' : 'っづ',
    'dde' : 'っで',
    'ddo' : 'っど',
    'xxtu' : 'っっ',
    'xxtsu' : 'っっ',
    'lltu' : 'っっ',
    'lltsu' : 'っっ',
    'hha' : 'っは',
    'hhi' : 'っひ',
    'hhu' : 'っふ',
    'ffu' : 'っふ',
    'hhe' : 'っへ',
    'hho' : 'っほ',
    'bba' : 'っば',
    'bbi' : 'っび',
    'bbu' : 'っぶ',
    'bbe' : 'っべ',
    'bbo' : 'っぼ',
    'ppa' : 'っぱ',
    'ppi' : 'っぴ',
    'ppu' : 'っぷ',
    'ppe' : 'っぺ',
    'ppo' : 'っぽ',
    'mma' : 'っま',
    'mmi' : 'っみ',
    'mmu' : 'っむ',
    'mme' : 'っめ',
    'mmo' : 'っも',
    'xxya' : 'っゃ',
    'llya' : 'っゃ',
    'yya' : 'っや',
    'wwyi' : 'っゐ',
    'xxyu' : 'っゅ',
    'llyu' : 'っゅ',
    'yyu' : 'っゆ',
    'wwye' : 'っゑ',
    'xxyo' : 'っょ',
    'llyo' : 'っょ',
    'yyo' : 'っよ',
    'rra' : 'っら',
    'rri' : 'っり',
    'rru' : 'っる',
    'rre' : 'っれ',
    'rro' : 'っろ',
    'xxwa' : 'っゎ',
    'llwa' : 'っゎ',
    'wwa' : 'っわ',
    'wwi' : 'っうぃ',
    'wwe' : 'っうぇ',
    'wwo' : 'っを',
    'wwha' : 'っうぁ',
    'wwhi' : 'っうぃ',
    'wwhu' : 'っう',
    'wwhe' : 'っうぇ',
    'wwho' : 'っうぉ',
    'va' : 'ゔぁ',
    'vi' : 'ゔぃ',
    'vu' : 'ゔ',
    've' : 'ゔぇ',
    'vo' : 'ゔぉ',
    'vya' : 'ゔゃ',
    'vyi' : 'ゔぃ',
    'vyu' : 'ゔゅ',
    'vye' : 'ゔぇ',
    'vyo' : 'ゔょ',
    'kya' : 'きゃ',
    'kyi' : 'きぃ',
    'kyu' : 'きゅ',
    'kye' : 'きぇ',
    'kyo' : 'きょ',
    'gya' : 'ぎゃ',
    'gyi' : 'ぎぃ',
    'gyu' : 'ぎゅ',
    'gye' : 'ぎぇ',
    'gyo' : 'ぎょ',
    'sya' : 'しゃ',
    'syi' : 'しぃ',
    'syu' : 'しゅ',
    'sye' : 'しぇ',
    'syo' : 'しょ',
    'sha' : 'しゃ',
    'shi' : 'し',
    'shu' : 'しゅ',
    'she' : 'しぇ',
    'sho' : 'しょ',
    'zya' : 'じゃ',
    'zyi' : 'じぃ',
    'zyu' : 'じゅ',
    'zye' : 'じぇ',
    'zyo' : 'じょ',
    'tya' : 'ちゃ',
    'tyi' : 'ちぃ',
    'tyu' : 'ちゅ',
    'tye' : 'ちぇ',
    'tyo' : 'ちょ',
    'cha' : 'ちゃ',
    'chi' : 'ち',
    'chu' : 'ちゅ',
    'che' : 'ちぇ',
    'cho' : 'ちょ',
    'cya' : 'ちゃ',
    'cyi' : 'ちぃ',
    'cyu' : 'ちゅ',
    'cye' : 'ちぇ',
    'cyo' : 'ちょ',
    'dya' : 'ぢゃ',
    'dyi' : 'ぢぃ',
    'dyu' : 'ぢゅ',
    'dye' : 'ぢぇ',
    'dyo' : 'ぢょ',
    'tsa' : 'つぁ',
    'tsi' : 'つぃ',
    'tse' : 'つぇ',
    'tso' : 'つぉ',
    'tha' : 'てゃ',
    'thi' : 'てぃ',
    't\'i' : 'てぃ',
    'thu' : 'てゅ',
    'the' : 'てぇ',
    'tho' : 'てょ',
    't\'yu' : 'てゅ',
    'dha' : 'でゃ',
    'dhi' : 'でぃ',
    'd\'i' : 'でぃ',
    'dhu' : 'でゅ',
    'dhe' : 'でぇ',
    'dho' : 'でょ',
    'd\'yu' : 'でゅ',
    'twa' : 'とぁ',
    'twi' : 'とぃ',
    'twu' : 'とぅ',
    'twe' : 'とぇ',
    'two' : 'とぉ',
    't\'u' : 'とぅ',
    'dwa' : 'どぁ',
    'dwi' : 'どぃ',
    'dwu' : 'どぅ',
    'dwe' : 'どぇ',
    'dwo' : 'どぉ',
    'd\'u' : 'どぅ',
    'nya' : 'にゃ',
    'nyi' : 'にぃ',
    'nyu' : 'にゅ',
    'nye' : 'にぇ',
    'nyo' : 'にょ',
    'ny' : 'んy',
    'hya' : 'ひゃ',
    'hyi' : 'ひぃ',
    'hyu' : 'ひゅ',
    'hye' : 'ひぇ',
    'hyo' : 'ひょ',
    'bya' : 'びゃ',
    'byi' : 'びぃ',
    'byu' : 'びゅ',
    'bye' : 'びぇ',
    'byo' : 'びょ',
    'pya' : 'ぴゃ',
    'pyi' : 'ぴぃ',
    'pyu' : 'ぴゅ',
    'pye' : 'ぴぇ',
    'pyo' : 'ぴょ',
    'fa' : 'ふぁ',
    'fi' : 'ふぃ',
    'fe' : 'ふぇ',
    'fo' : 'ふぉ',
    'fya' : 'ふゃ',
    'fyu' : 'ふゅ',
    'fyo' : 'ふょ',
    'hwa' : 'ふぁ',
    'hwi' : 'ふぃ',
    'hwe' : 'ふぇ',
    'hwo' : 'ふぉ',
    'hwyu' : 'ふゅ',
    'mya' : 'みゃ',
    'myi' : 'みぃ',
    'myu' : 'みゅ',
    'mye' : 'みぇ',
    'myo' : 'みょ',
    'rya' : 'りゃ',
    'ryi' : 'りぃ',
    'ryu' : 'りゅ',
    'rye' : 'りぇ',
    'ryo' : 'りょ',
    'n\'' : 'ん',
    'nn' : 'ん',
    'n' : 'ん',
    'xn' : 'ん',
    'a' : 'あ',
    'i' : 'い',
    'u' : 'う',
    'wu' : 'う',
    'e' : 'え',
    'o' : 'お',
    'xa' : 'ぁ',
    'xi' : 'ぃ',
    'xu' : 'ぅ',
    'xe' : 'ぇ',
    'xo' : 'ぉ',
    'la' : 'ぁ',
    'li' : 'ぃ',
    'lu' : 'ぅ',
    'le' : 'ぇ',
    'lo' : 'ぉ',
    'lyi' : 'ぃ',
    'xyi' : 'ぃ',
    'lye' : 'ぇ',
    'xye' : 'ぇ',
    'ye' : 'いぇ',
    'ka' : 'か',
    'ki' : 'き',
    'ku' : 'く',
    'ke' : 'け',
    'ko' : 'こ',
    'xka' : 'ヵ',
    'xke' : 'ヶ',
    'lka' : 'ヵ',
    'lke' : 'ヶ',
    'ga' : 'が',
    'gi' : 'ぎ',
    'gu' : 'ぐ',
    'ge' : 'げ',
    'go' : 'ご',
    'sa' : 'さ',
    'si' : 'し',
    'su' : 'す',
    'se' : 'せ',
    'so' : 'そ',
    'ca' : 'か',
    'ci' : 'し',
    'cu' : 'く',
    'ce' : 'せ',
    'co' : 'こ',
    'qa' : 'くぁ',
    'qi' : 'くぃ',
    'qu' : 'く',
    'qe' : 'くぇ',
    'qo' : 'くぉ',
    'kwa' : 'くぁ',
    'kwi' : 'くぃ',
    'kwe' : 'くぇ',
    'kwo' : 'くぉ',
    'gwa' : 'ぐぁ',
    'za' : 'ざ',
    'zi' : 'じ',
    'zu' : 'ず',
    'ze' : 'ぜ',
    'zo' : 'ぞ',
    'ja' : 'じゃ',
    'ji' : 'じ',
    'ju' : 'じゅ',
    'je' : 'じぇ',
    'jo' : 'じょ',
    'jya' : 'じゃ',
    'jyi' : 'じぃ',
    'jyu' : 'じゅ',
    'jye' : 'じぇ',
    'jyo' : 'じょ',
    'ta' : 'た',
    'ti' : 'ち',
    'tu' : 'つ',
    'tsu' : 'つ',
    'te' : 'て',
    'to' : 'と',
    'da' : 'だ',
    'di' : 'ぢ',
    'du' : 'づ',
    'de' : 'で',
    'do' : 'ど',
    'xtu' : 'っ',
    'xtsu' : 'っ',
    'ltu' : 'っ',
    'ltsu' : 'っ',
    'na' : 'な',
    'ni' : 'に',
    'nu' : 'ぬ',
    'ne' : 'ね',
    'no' : 'の',
    'ha' : 'は',
    'hi' : 'ひ',
    'hu' : 'ふ',
    'fu' : 'ふ',
    'he' : 'へ',
    'ho' : 'ほ',
    'ba' : 'ば',
    'bi' : 'び',
    'bu' : 'ぶ',
    'be' : 'べ',
    'bo' : 'ぼ',
    'pa' : 'ぱ',
    'pi' : 'ぴ',
    'pu' : 'ぷ',
    'pe' : 'ぺ',
    'po' : 'ぽ',
    'ma' : 'ま',
    'mi' : 'み',
    'mu' : 'む',
    'me' : 'め',
    'mo' : 'も',
    'xya' : 'ゃ',
    'lya' : 'ゃ',
    'ya' : 'や',
    'wyi' : 'ゐ',
    'xyu' : 'ゅ',
    'lyu' : 'ゅ',
    'yu' : 'ゆ',
    'wye' : 'ゑ',
    'xyo' : 'ょ',
    'lyo' : 'ょ',
    'yo' : 'よ',
    'ra' : 'ら',
    'ri' : 'り',
    'ru' : 'る',
    're' : 'れ',
    'ro' : 'ろ',
    'xwa' : 'ゎ',
    'lwa' : 'ゎ',
    'wa' : 'わ',
    'wi' : 'うぃ',
    'we' : 'うぇ',
    'wo' : 'を',
    'wha' : 'うぁ',
    'whi' : 'うぃ',
    'whu' : 'う',
    'whe' : 'うぇ',
    'who' : 'うぉ'
};
