var car = new createImageTurtle("img/car.gif");// 車を生成

{// アニメーションループ
    while (true) {
        // --- 待つ ---
        jsleep(0.025);

        {// 一コマの処理をする
            // 左キーが押されていたら，車を動かす
            var x = car.getX();
            var y = car.getY();
            if (key() == 37) { // 左
                car.warp(x - 5, y);
            }
        }

        // --- 再描画 ---
        update();
    }
}