var t = createTurtle();
var length = 50;// １辺の長さ

{// 図形を描く　（8回繰り返す）
  var i = 1;
  while (i <= 8) {

    if (i % 2 == 0) {// 偶数なら
      {// 四角形を書く
        var j = 1;
        while (j <= 4) {
          t.fd(length);
          t.lt(90);

          j++;// jを1増やす([j = j + 1] の省略形)
        }
      }
    } else {// 奇数なら
      {// 三角形を書く
        var j = 1;
        while (j <= 3) {
          t.fd(length);
          t.lt(120);

          j++;// jを1増やす([j = j + 1] の省略形)
        }
      }
    }

    {// 次の図形を書く位置に移動する
      t.up();
      t.rt(135);
      t.fd(length);
      t.rt(180);
      t.down();
    }
  
    i++;// jを1増やす([i = i + 1] の省略形)
  }
}