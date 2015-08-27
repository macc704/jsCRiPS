var t = createTurtle();
drawRectangle();

// 四角形を描く
function drawRectangle() {
    for (var i = 0; i < 4; i++) {
        t.fd(50);
        t.rt(90);
    }
}