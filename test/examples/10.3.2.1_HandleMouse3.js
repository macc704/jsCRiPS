var car = createImageTurtle("img/car.gif");// 車を生成

{// アニメーションループ
    while (true) {
        // -- 待つ　---
        jsleep(0.1);

        { // 一コマの処理をする
            // マウスがクリックされた時の処理
            if (mouseClicked()) {
                car.warp(mouseX(), mouseY());// 車をマウスの位置に移動
            }
        }

        // --- 再描画 ---
        update();
    }
}