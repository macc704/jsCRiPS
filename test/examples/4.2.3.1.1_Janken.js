var t = createTurtle();

var handNumber;// じゃんけんの手

// じゃんけんの手は　1をグー,2をチョキ,3をパーとする
handNumber = random(3) + 1; // random(3)は0から2までの値を発生するので1を足す

if (handNumber == 1) {
    {// c//グーを書く
        t.fd(30);

        t.lt(30);
        t.fd(25);
        t.rt(60);
        t.fd(25);
        t.rt(150);
        t.fd(30);
        t.lt(180);
        t.fd(20);

        t.fd(20);
        t.rt(90);
        t.fd(20);
        t.rt(90);
        t.fd(20);
        t.lt(90);
        t.fd(5);

        t.lt(90);
        t.fd(20);
        t.rt(90);
        t.fd(20);
        t.rt(90);
        t.fd(20);
        t.lt(90);
        t.fd(5);

        t.lt(90);
        t.fd(20);
        t.rt(90);
        t.fd(20);
        t.rt(90);
        t.fd(20);
        t.lt(90);
        t.fd(5);

        t.lt(90);
        t.fd(20);
        t.rt(90);
        t.fd(20);
        t.rt(90);
        t.fd(20);

        t.fd(65);
    }

} else if (handNumber == 2) {
    {// c//チョキを書く

        t.fd(30);

        t.lt(30);
        t.fd(25);
        t.rt(60);
        t.fd(25);
        t.rt(150);
        t.fd(30);
        t.lt(180);
        t.fd(30);

        t.lt(15);
        t.fd(80);
        t.rt(105);
        t.fd(20);
        t.rt(75);
        t.fd(80);
        t.lt(75);

        t.lt(75);
        t.fd(80);
        t.rt(75);
        t.fd(20);
        t.rt(105);
        t.fd(80);
        t.fd(20);
        t.lt(105);
        t.fd(5);

        t.lt(90);
        t.fd(20);
        t.rt(90);
        t.fd(20);
        t.rt(90);
        t.fd(20);
        t.lt(90);
        t.fd(5);

        t.lt(90);
        t.fd(20);
        t.rt(90);
        t.fd(20);
        t.rt(90);
        t.fd(20);

        t.fd(65);
    }

} else if (handNumber == 3) {
    {// c//パーを書く

        t.fd(30);

        t.lt(30);
        t.fd(80);
        t.rt(120);
        t.fd(20);
        t.rt(60);
        t.fd(40);
        t.lt(150);
        t.fd(15);

        t.fd(80);
        t.rt(90);
        t.fd(20);
        t.rt(90);
        t.fd(80);
        t.lt(90);
        t.fd(5);

        t.lt(90);
        t.fd(80);
        t.rt(90);
        t.fd(20);
        t.rt(90);
        t.fd(80);
        t.lt(90);
        t.fd(5);

        t.lt(90);
        t.fd(80);
        t.rt(90);
        t.fd(20);
        t.rt(90);
        t.fd(80);
        t.lt(90);
        t.fd(5);

        t.lt(90);
        t.fd(80);
        t.rt(90);
        t.fd(20);
        t.rt(90);
        t.fd(80);

        t.fd(75);
    }

} else { // 1,2,3以外の場合

    println("不正な数です。");

}