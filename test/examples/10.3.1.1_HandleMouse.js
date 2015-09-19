var car = createImageTurtle("img/car.gif");// 車を生成

{// アニメーションループ
    while (true) {
        // --- 待つ ---
        jsleep(0.1);

        {// 一コマの処理をする
            // 車をマウスの位置に移動する
            var mx = mouseX();// マウスのx座標を取得する
            var my = mouseY();// マウスのy座標を取得する
            car.warp(mx, my);
        }

        // --- 再描画 ---
        update();
    }
}