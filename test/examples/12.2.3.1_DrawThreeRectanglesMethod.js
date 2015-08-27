var t = createTurtle();

// 四角形を３つ描く
for (var i = 0; i < 3; i++) {
    drawRectangle();// 四角形を描く
    move();// 次の描く位置まで移動する
}


// 四角形を描く
function drawRectangle() {
    for (var i = 0; i < 4; i++) {
        t.fd(50);
        t.rt(90);
    }
}

// 次の描く位置まで移動する
function move() {
    t.up();
    t.rt(90);
    t.fd(60);
    t.lt(90);
    t.down();
}