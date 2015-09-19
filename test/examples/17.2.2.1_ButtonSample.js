// ボタンを作る
var helloButton = createButtonTurtle("押してください！");

// アニメションループ
while (true) {
    jsleep(0.025);

    if (helloButton.isClicked()) {// helloButtonがクリックされたら
        println("押されました");
    } else {// 何もクリックされていなかったら
        // 何もしない
    }

    update();
}