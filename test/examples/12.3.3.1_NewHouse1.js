var t = createTurtle();

drawTriangle(100);
t.rt(90);
drawRectangle(100);

// 三角形を書く
function drawTriangle(size) {
    t.rt(30);
    for (var i = 0; i < 3; i++) {
        t.fd(size);
        t.rt(120);
    }
    t.lt(30);
}

// 四角形を書く
function drawRectangle(size) {
    for (var i = 0; i < 4; i++) {
        t.fd(size);
        t.rt(90);
    }
}