var t = createTurtle(); //　タートルを生成する

var x; // 変数xを宣言する
x = 50; // 変数xに値50を代入する

{// 屋根を書く
    t.rt(30); // 30度右に回る
    t.fd(x); // x歩前に進む
    t.rt(120);
    t.fd(x);
    t.rt(120);
    t.fd(x);
}

{// 本体を書く
    t.lt(90);
    t.fd(x);
    t.lt(90);
    t.fd(x);
    t.lt(90);
    t.fd(x);
    t.lt(90);
    t.fd(x);
}