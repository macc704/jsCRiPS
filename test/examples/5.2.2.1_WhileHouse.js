var t = createTurtle();

{// 屋根を書く
  t.rt(30);
  var i = 1;
  while (i <= 3) {
    t.fd(50);
    t.rt(120);
    i = i + 1;
  }
  t.lt(30);// 上向きに戻す
}

{// 本体を書く
  var i = 1;
  while (i <= 4) {
    t.rt(90);
    t.fd(50);
    i = i + 1;
  }
}