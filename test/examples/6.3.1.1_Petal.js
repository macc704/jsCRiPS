var t = createTurtle();

{// 花びらを描く
  {// 円弧を描く
    var i = 1;
    while (i <= 120) {
      t.rt(1);
      t.fd(1);
      i++;
    }
  }
  
  {// 次の円弧の角度へ
    t.rt(60);
  }
  
  {// 円弧を描く
    var i = 1;
    while (i <= 120) {
      t.rt(1);
      t.fd(1);
      i++;
    }
  }
}