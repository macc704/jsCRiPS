var t = createTurtle();

var pictureNumber;// 絵の番号

{// ユーザから入力を受け取る
    pictureNumber = input("書きたい絵の番号を入力してください。(1.家, 2.星)");
}

if (pictureNumber == 1) {// 入力された番号が1ならば
    {// c//家を書く

        var length = 50;// 1辺の長さ
        var rightAngle = 90;// 直角

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
    }

} else {// 入力された番号が1以外ならば
    {// c//星を書く

        var length = 100;// 1辺の長さ
        var angle = 144;// 星を書くときに曲がる角度

        {// 星を書く
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
    }

}