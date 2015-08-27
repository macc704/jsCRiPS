var t = createTurtle();

drawRegularPolygon(3, 100);
t.rt(90);
drawRegularPolygon(4, 100);


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