var car = createImageTurtle("img/car.gif");// 車を生成

{// アニメーションループ
    while (true) {

        // --- 待つ ---
        jsleep(0.1);

        {// 一コマの処理をする
            {// 左マウスボタンがクリックされた時の処理
                if (leftMouseClicked()) {
                    car.warp(mouseX(), mouseY());// 車をマウスの位置に移動
                }
            }
            { // 右マウスボタンがダブルクリックされた時の処理
                if (rightMouseClicked() && doubleClick()) {
                    car.show(!car.isShow());// 車を(現す/隠す)
                }
            }
        }

        // --- 再描画 ---
        update();
    }
}