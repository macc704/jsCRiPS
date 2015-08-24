var t = createTurtle(); //　タートルを生成する

var length;// 1辺の長さ
var rightAngle;// 直角

length = 50;// 1辺の長さを50に設定する
rightAngle = 90;// 直角を90度に設定する

{// 屋根を書く
    t.rt(30); // 30度右に回る
    t.fd(length); // x歩前に進む
    t.rt(120);
    t.fd(length);
    t.rt(120);
    t.fd(length);
}

{// 本体を書く
    t.lt(rightAngle);
    t.fd(length);
    t.lt(rightAngle);
    t.fd(length);
    t.lt(rightAngle);
    t.fd(length);
    t.lt(rightAngle);
    t.fd(length);
}