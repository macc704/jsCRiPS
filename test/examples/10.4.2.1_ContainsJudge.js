var car = createImageTurtle("img/car.gif");// 車を生成

{// アニメーションループ
    while (true) {
        // --- 待つ ---
        jsleep(0.1);

        {// 一コマの処理をする
            // 車がマウスの位置に含まれている場合の処理
            if (car.contains(mouseX(), mouseY())) {
                car.small(5);// 車を小さくする
            }
        }

        // --- 再描画 ---
        update();
    }
}