{// ウインドウを移動, 大きさ調整
    canvasSize(480, 300);
}

// バックグラウンド画像を用意する
var bg = createImageTurtle("img/bg.jpg");

// アニメーション用画像を用意する
var man1 = createImageTurtle("img/man1.gif");
var man2 = createImageTurtle("img/man2.gif");
var man3 = createImageTurtle("img/man3.gif");
var man4 = createImageTurtle("img/man4.gif");
var man5 = createImageTurtle("img/man5.gif");
var man6 = createImageTurtle("img/man6.gif");
var man7 = createImageTurtle("img/man7.gif");
var man8 = createImageTurtle("img/man8.gif");

{ // 準備
    man1.warp(240, 200);
    man2.hide();
    man3.hide();
    man4.hide();
    man5.hide();
    man6.hide();
    man7.hide();
    man8.hide();
}

{// アニメーションループ
    var i = 0;
    while (true) {

        // --- 待つ ---
        jsleep(0.1); // 0.1秒

        { // 一コマの処理
            // 背景を動かす
            var x = bg.getX();
            var y = bg.getY();
            bg.warp(x - 2, y);
            if (i % 8 == 0) {
                man1.looks(man1);
            } else if (i % 8 == 1) {
                man1.looks(man2);
            } else if (i % 8 == 2) {
                man1.looks(man3);
            } else if (i % 8 == 3) {
                man1.looks(man4);
            } else if (i % 8 == 4) {
                man1.looks(man5);
            } else if (i % 8 == 5) {
                man1.looks(man6);
            } else if (i % 8 == 6) {
                man1.looks(man7);
            } else if (i % 8 == 7) {
                man1.looks(man8);
            }
        }

        // --- 再描画する ---
        i++;
        update();

    }
}
