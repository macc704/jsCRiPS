
    var th = {};
    var Thread = Concurrent.Thread;
    var moveStep = 2;
    var sleepTime = 10;
    var rotateStep = 5;

    var Turtle = (function () {

        var Turtle = function () {
            this.x = 100.0;
            this.y = 100.0;

            //  dx = sin(angle), dy = -cos(angle)
            this.dx = 0.0;
            this.dy = 0.0;

            // Turtle animation rubber line
            this.rx = this.x;
            this.ry = this.y;
            this.rubber = false; // 何に使ってる…？

            this.angle = -90.0;

            this.show = true;

            this.penDown = true;
            this.penColor = "black";

            this.kameColor = "green";

            this.size = 10;
        };

        var p = Turtle.prototype;
        p.fd = function (d) {	// 使ってない、関数実装サンプル
            th = Thread.create(function (d) {

            }, d)
        };
        return Turtle;
    })();

    var ttl = new Turtle();


    function fd(d) {
        if (d < 0) bk(-d);
        else th = Thread.create(function (d) {
            var xx = ttl.x, yy = ttl.y;
            ttl.rubber = ttl.penDown;
            ttl.dx = Math.cos(deg2rad(ttl.angle));
            ttl.dy = Math.sin(deg2rad(ttl.angle));
            setRxRy(ttl);
            for (var i = 0; i < d; i += moveStep) {
                ttl.x = xx + ttl.dx * i;
                ttl.y = yy + ttl.dy * i;
                draw(ttl);
                setRxRy(ttl);
                sleep(sleepTime);
            }
            ttl.x = xx + ttl.dx * d;
            ttl.y = yy + ttl.dy * d;
            draw(ttl);
        }, d);
        // TODO if penDown then save Line
    }

    function bk(d) {
        if (d < 0) fd(-d);
        else th = Thread.create(function (d) {
            var xx = ttl.x, yy = ttl.y;
            ttl.rubber = ttl.penDown;
            ttl.dx = Math.cos(deg2rad(ttl.angle));
            ttl.dy = Math.sin(deg2rad(ttl.angle));
            setRxRy(ttl);
            for (var i = 0; i < d; i += moveStep) {
                ttl.x = xx - ttl.dx * i;
                ttl.y = yy - ttl.dy * i;
                draw(ttl);
                setRxRy(ttl);
                sleep(sleepTime);
            }
            ttl.x = xx - ttl.dx * d;
            ttl.y = yy - ttl.dy * d;
            draw(ttl);
        }, d);
        // TODO if penDown then save Line
    }


    function rt(deg) {
        if (deg < 0) lt(-deg);
        else th = Thread.create(function (deg) {
            var tmpAngle = ttl.angle;
            var tmpPendown = ttl.penDown;
            up();
            for (var i = 0; i < deg; i += rotateStep) {
                draw(ttl);
                ttl.angle += rotateStep;
                sleep(sleepTime);
            }
            ttl.angle = tmpAngle + deg;
            ttl.penDown = tmpPendown;
            drawTurtle(ttl);
        }, deg);
    }

    function lt(deg) {
        if (deg < 0) rt(-deg);
        else th = Thread.create(function (deg) {
            var tmpAngle = ttl.angle;
            var tmpPendown = ttl.penDown;
            up();
            for (var i = 0; i < deg; i += rotateStep) {
                draw(ttl);
                ttl.angle -= rotateStep;
                sleep(sleepTime);
            }
            ttl.angle = tmpAngle - deg;
            ttl.penDown = tmpPendown;
            drawTurtle(ttl);
        }, deg);
    }

    function up(){
        ttl.penDown = false;
    }

    function down(){
        ttl.penDown = true;
    }

    function color(c){
        ttl.penColor = c;
    }

    /* 描画関連 */

    function draw(t) {
        if (t.show)drawTurtle(t);
        if (t.penDown) drawLine(t);
    }

    function drawTurtle(t) {
        var canvas = document.getElementById('turtleCanvas');
        if (!canvas.getContext)return;
        var w = canvas.width;
        var h = canvas.height;
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);

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
        if (!canvas.getContext)return;
        var ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.moveTo(t.rx, t.ry);
        ctx.lineTo(t.x, t.y);
        ctx.closePath();
        ctx.strokeStyle = t.penColor;
        ctx.stroke();
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
        Thread.sleep(t)
    }


    // /* 実行部分 */
    // function start() {
    //     main();
    // }

