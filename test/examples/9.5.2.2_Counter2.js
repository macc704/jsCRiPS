var counter = new createTextTurtle("繰り返し数");
{ //
    var i = 0;
    while (true) {
        jsleep(0.1);
        { // 処理
            counter.text("現在の繰り返し数は" + i);
        }
        i++;
        update();
    }
}