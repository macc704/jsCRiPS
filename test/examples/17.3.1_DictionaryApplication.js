canvasSize(700, 500);

// 入力ボックス
var input = createInputTurtle();
input.toJapaneseMode();
input.warpByTopLeft(30, 30);

// 出力結果
var result = createImageTurtle("img/notfound.jpg");
result.size(100, 100);
result.warpByTopLeft(30, 60);

// 辞書の読みを入れておく入れ物
var keys = createListTurtle(true);
keys.warpByTopLeft(30, 200);
keys.addLast(createCardTurtle("りんご"));
keys.addLast(createCardTurtle("いちご"));
keys.addLast(createCardTurtle("すいか"));
keys.addLast(createCardTurtle("みかん"));

// 辞書の内容（絵）を入れておく入れ物
var values = createListTurtle(true);
values.warpByTopLeft(30, 250);
values.addLast(createImageTurtle("img/apple.jpg"));
values.addLast(createImageTurtle("img/strawberry.jpg"));
values.addLast(createImageTurtle("img/wm.jpg"));
values.addLast(createImageTurtle("img/orange.jpg"));
values.addLast(createImageTurtle("img/notfound.jpg"));

//検索ボタン
var button = createButtonTurtle("検索！");
button.warpByTopLeft(200, 30);

while (true) {
    jsleep(0.025);// 待つ

    if (button.isClicked()) {
        //検索する
        var key = input.text();
        for (var i = 0; i < keys.getSize(); i++) {// １つずつ調べる
            keys.setCursor(i);
            if (keys.getObjectAtCursor().getText() === key) {// 見つかった
                values.setCursor(i);
                result.looks(values.getObjectAtCursor());
                input.clearText();
            }
        }
    }

    update();// 再描画する
}