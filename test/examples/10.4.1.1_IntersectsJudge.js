var car = createImageTurtle("img/car.gif");// 車を生成
var man = createImageTurtle("img/man1.gif");// 男を生成
car.warp(200, 200);// 車を移動

{// アニメーションループ
    while (true) {

        // --- 待つ ---
        jsleep(0.1);

        { // 一コマの処理をする
            {// マウスが押されていた時の処理
                if (mouseDown()) {
                    car.warp(mouseX(), mouseY());// 車をマウスの位置に移動
                }
            }
            { // どらえもんが車に当たっていた時の処理
                if (man.intersects(car)) {
                    man.small(5);// 男を小さくする
                }
            }
        }

        // --- 再描画 ---
        update();
    }
}