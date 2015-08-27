var t = createTurtle();

// 一辺の長さの入力を受け取る
var inputLength = input("一辺の長さを入力してください");

drawRectangle(inputLength);// 入力された長さを一辺の長さとして四角形を描く

// 四角形を描く
function drawRectangle(length) {
    for (var i = 0; i < 4; i++) {
        t.fd(length);
        t.rt(90);
    }
}