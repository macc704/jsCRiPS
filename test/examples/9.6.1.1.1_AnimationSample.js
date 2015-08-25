var text = new createTextTurtle("注目->");
var number = new createTextTurtle("");
var car = createImageTurtle("img/car.gif");
{ // 初期化
    number.warp(200, 100);
    car.hide();
}
{ // アニメーションループ
    var i = 10;
    while (true) {
        sleep(1);
        { // 一コマの処理
            number.text(i);
            if (i == 3) {
                number.color("red");
            }
            if (i <= 0) {
                text.looks(car);
                number.text("ぼかーん!!");
            }
        }
        i--;
        update();
    }
}