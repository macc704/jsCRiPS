var taro = createTextTurtle("");// 文字(太郎)を生成

{// アニメーションループ
    while (true) {
        // --- 待つ ---
        jsleep(0.1);

        { // 一コマの処理をする
            var keycode = key(); // 今押されているキーを取得する
            taro.text(keycode); // 押されているキー番号を文字にして表示する
        }

        // --- 再描画 ---
        update();
    }
}