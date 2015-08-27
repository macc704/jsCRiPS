var t = createTurtle();

drawBigRectangle();
drawSmallRectangle();

// 一辺100の大きな四角形を書く
function drawBigRectangle() {
    for (var i = 0; i < 4; i++) {
        t.fd(100);
        t.rt(90);
    }
}

// 一辺20の小さな四角形を書く
function drawSmallRectangle() {
    for (var i = 0; i < 4; i++) {
        t.fd(20);
        t.rt(90);
    }
}