var input = new createInputTurtle();
input.warp(30, 30);
// 表示用テキスト
var text = createTextTurtle("ここに文字が表示されます");
text.fontsize(14);
 
while (true) {
	jsleep(0.025);// 待つ

	// エンターキーが押されたら
	if (key() == 13) {
		text.text(input.text());// 表示用テキストの内容を入力ボックスの内容に変える
		input.clearText();// 表示用テキストの内容をリセットする
	}
 
update();// 再描画する
}