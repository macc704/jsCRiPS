var t = createTurtle();

// 家を描く
//タートルを動かす処理
drawRoof(); // 屋根を描く
drawWall(); // 壁を描く
drawWindow(); // 窓を描く

// 屋根を描く
function drawRoof() {
    drawRegularPolygon(3, 80); // 三角形を描く
}

// 壁を描く
function drawWall() {
    t.rt(90); // 向きを調節する
    drawRegularPolygon(4, 80);// 四角形を描く
    t.lt(90);// 向きを上向きに戻す
}

// 窓を描く
function drawWindow() {
    // 窓を描く位置まで移動する
    moveToWindowLocation(22);

    // 窓を描く
    t.rt(90);
    for (var i = 0; i < 4; i++) {
        drawRegularPolygon(4, 16);
        t.fd(16 * 2 + 4);
        t.rt(90);
    }
    t.lt(90);
}

// 指定された角数の正多角形を描く
function drawRegularPolygon(n, size) {
    // 向きを調節する
    var angle = 360 / n;
    t.rt(angle - 90);

    // 多角形を描く
    for (var i = 0; i < n; i++) {
        t.fd(size);
        t.rt(angle);
    }

    // 向きを上向きに戻す
    t.lt(angle - 90);
}

// 窓を描く位置まで移動する
function moveToWindowLocation(length) {
    moveTurtle(90, 22);// 右へ
    moveTurtle(180, 22);// 下へ
}

// 指定された方向に（ペンを上げて）移動する
function moveTurtle(direction, distance) {
    t.up();
    t.rt(direction);
    t.fd(distance);
    t.lt(direction);
    t.down();
}