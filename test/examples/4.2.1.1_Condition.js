var t = createTurtle();

var pictureNumber;// 絵の番号

println("書きたい絵の番号を入力してください。(1.家, 2.星)");

pictureNumber = input();

if (pictureNumber == 1) {   // 入力された番号が1ならば家を書く

    var length; // 1辺の長さ
    var rightAngle; // 直角

    length = 50;    // 1辺の長さを50に設定する
    rightAngle = 90;    // 直角を90度に設定する

    // 屋根を書く
    t.rt(30); // 30度右に回る
    t.fd(length); // x歩前に進む
    t.rt(120);
    t.fd(length);
    t.rt(120);
    t.fd(length);

    // 本体を書く
    t.lt(rightAngle);
    t.fd(length);
    t.lt(rightAngle);
    t.fd(length);
    t.lt(rightAngle);
    t.fd(length);
    t.lt(rightAngle);
    t.fd(length);

} else {    // 入力された番号が1以外ならば星を書く

    var length; // 1辺の長さ
    var angle;  // 星を書くときに曲がる角度

    length = 100;   // 1辺の長さを100に設定する
    angle = 144;    // 曲がる角度を144度に設定する

    // 星を書く
    t.rt(18);
    t.fd(length);
    t.rt(angle);
    t.fd(length);
    t.rt(angle);
    t.fd(length);
    t.rt(angle);
    t.fd(length);
    t.rt(angle);
    t.fd(length);

}