var car = createImageTurtle("img/car.gif"); // 車を生成

{// アニメーションループ
    while (true) {
        // --- 待つ ---
        jsleep(0.025);

        { // 一コマの処理をする
            {// 左キーの処理
                if (keyDown(37)) { // 左
                    var x = car.getX();
                    var y = car.getY();
                    car.warp(x - 5, y);
                }
            }
            {// 上キーの処理
                if (keyDown(38)) { // 上
                    var x = car.getX();
                    var y = car.getY();
                    car.warp(x, y - 5);
                }
            }
        }
        // --- 再描画 ---
        update();
    }
}