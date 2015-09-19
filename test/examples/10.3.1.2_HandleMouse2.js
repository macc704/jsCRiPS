var car = createImageTurtle("img/car.gif");// 車を生成

{// アニメーションループ
    while (true) {
        // --- 待つ ---
        jsleep(0.1);

        {// 一コマの処理をする
            // 車をマウスの位置に移動する
            car.warp(mouseX(), mouseY());
        }

        // --- 再描画 ---
        update();
    }
}