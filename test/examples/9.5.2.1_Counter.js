var counter = createTextTurtle("繰り返し数");
{ // アニメーションループ
    var i = 0;
    while (true) {
        jsleep(0.1);
        { // 処理
            counter.text(i);
        }
        i++;
        update();
    }
}