var car = createImageTurtle("img/car.gif");
{ // アニメーションループ
    while (true) {
        sleep(0.1);
        { // 処理
            car.rt(5);
        }
        update();
    }
}