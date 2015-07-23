// 引数が使えない？
// Chromeで使えない？
// メンバ変数？が使えない？


//turtleList = [];
//blocking = 0;
//
//
var Turtle = (function () {

    var Turtle = function () {
        this.x = 50;
        this.y = 50;
        this.size = 10;
    };

    var p = Turtle.prototype;
    p.fd = function (d) {
        Concurrent.Thread.create(function () {
            for (var i = 0; i < 50; i += 3) {
                drawTurtle(t);
                this.y -= 3;
                alert(this.y);
                sleep(3);
            }
            this.y -= d % 3;
            drawTurtle(this);
            sleep(1);
        })
    };
    return Turtle;
})();

var t = new Turtle();
t.x = 100;
t.y = 200;

function main() {

    console.log('x');
    fd(100);
    yield 0;
    console.log('y');    
    fd(100);
    //yield 0;    
    console.log('z');    

    // var t2 = new Turtle();
    // t2.fd(50);
}

function fd(d) {
    Concurrent.Thread.create(function (d) {
        for (var i = 0; i < d; i += 3) {
            drawTurtle(t);
            t.y -= 3;
            sleep(100);
        }
        //t.y += d % 3;
        drawTurtle(t);
        // sleep(1);
    }, d);
}

function damefd(d) {
    Concurrent.Thread.create(function () {
        for (var i = 0; i < d; i += 3) {
            drawTurtle(t);
            t.y -= step;
            sleep(3);
        }
        t.y += d % 3;
        drawTurtle(t);
        // sleep(1);
    })
}

function start() {
    main();
    //var f = draw();
    //setInterval(function () {
    //    f.next()
    //}, 1000);
}

function drawTurtle(tt) {
    //  alert(tt.y);
    var canvas = document.getElementById('tCanvas');
    if (!canvas.getContext)return;
    var w = canvas.width;
    var h = canvas.height;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(tt.x, tt.y, 10, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();
}

//function draw() {
//
//    var canvas = document.getElementById('tCanvas');
//    if (!canvas.getContext)return;
//    var w = canvas.width;
//    var h = canvas.height;
//    var ctx = canvas.getContext('2d');
//    var p = 0;
//    while (true) {
//        /*            ctx.clearRect(0, 0, w, h);
//         ctx.beginPath();
//         ctx.arc(p, p, 10, 0, Math.PI * 2, true);
//         ctx.fill();
//         ctx.closePath();
//         p += 10;
//         */
//        fd();
//        yield 0;
//    }
//}

window.onload = start();