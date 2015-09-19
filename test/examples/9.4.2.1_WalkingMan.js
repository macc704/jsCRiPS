var man1 = createImageTurtle("img/man1.gif");
var man2 = createImageTurtle("img/man2.gif");
var man3 = createImageTurtle("img/man3.gif");
var man4 = createImageTurtle("img/man4.gif");
var man5 = createImageTurtle("img/man5.gif");
var man6 = createImageTurtle("img/man6.gif");
var man7 = createImageTurtle("img/man7.gif");
var man8 = createImageTurtle("img/man8.gif");
{ // c//1番以外のアニメーション用画像を消す
    man2.hide();
    man3.hide();
    man4.hide();
    man5.hide();
    man6.hide();
    man7.hide();
    man8.hide();
}
{ // アニメーションループ
    var i = 0;
    while (true) {
        jsleep(0.1);
        { // 一コマの処理を行う
            if ((i % 8) == 0) {
                man1.looks(man1);
            } else if ((i % 8) == 1) {
                man1.looks(man2);
            } else if ((i % 8) == 2) {
                man1.looks(man3);
            } else if ((i % 8) == 3) {
                man1.looks(man4);
            } else if ((i % 8) == 4) {
                man1.looks(man5);
            } else if ((i % 8) == 5) {
                man1.looks(man6);
            } else if ((i % 8) == 6) {
                man1.looks(man7);
            } else if ((i % 8) == 7) {
                man1.looks(man8);
            }
        }
        i++;
        update();
    }
}