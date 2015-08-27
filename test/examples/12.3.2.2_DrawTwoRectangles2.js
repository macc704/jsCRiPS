var t = createTurtle();

drawRectangle(100);
drawRectangle(20);

// 一辺がsizeの四角形を書く
function drawRectangle(size) {
    for (var i = 0; i < 4; i++) {
        t.fd(size);
        t.rt(90);
    }
}