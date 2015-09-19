var car = createImageTurtle("img/car.gif");// 車を生成

{// アニメーションループ
    while (true) {
        // --- 待つ ---
        jsleep(0.1);

        { // 一コマの処理をする
            // 左マウスボタンが押されている時の処理
            if (leftMouseDown()) {
                car.warp(mouseX(), mouseY());// 車をマウスの位置に移動
            }
        }

        // --- 再描画 ---
        update();
    }
}
