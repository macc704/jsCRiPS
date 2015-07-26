var t = createTurtle();// タートルを生成する

var length;//1辺の長さ
var smallHouseLength;//小さい家の1辺の長さ
var rightAngle;//直角

length = 100;//1辺の長さを100に設定する
rightAngle = 90;//直角を90度に設定する

//屋根を書く
t.rt(30); //30度右に回る
t.fd(length); //x歩前に進む
t.rt(120);
t.fd(length);
t.rt(120);
t.fd(length);

//本体を書く
t.lt(rightAngle);
t.fd(length);
t.lt(rightAngle);
t.fd(length);
t.lt(rightAngle);
t.fd(length);
t.lt(rightAngle);
t.fd(length);

//小さい家を書く位置まで移動する
t.up();
t.lt(rightAngle * 2);
t.fd(length * 2);
t.lt(rightAngle);
t.down();

//小さい家の長さを設定する
smallHouseLength = length / 2;

//小さい家の屋根を書く
t.rt(30);
t.fd(smallHouseLength);
t.rt(120);
t.fd(smallHouseLength);
t.rt(120);
t.fd(smallHouseLength);

//小さい家の本体を書く
t.lt(rightAngle);
t.fd(smallHouseLength);
t.lt(rightAngle);
t.fd(smallHouseLength);
t.lt(rightAngle);
t.fd(smallHouseLength);
t.lt(rightAngle);
t.fd(smallHouseLength);