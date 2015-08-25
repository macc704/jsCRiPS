var car = new createImageTurtle("img/car.gif");
{ // アニメーションループ
    var i = 0;
    while (true) {
        sleep(0.2);
        { // 1コマの処理
            if ((i % 2) == 0) {
                car.show();
            } else {
                car.hide();
            }
        }
        i++;
        update();
    }
}