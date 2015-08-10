// 4匹のカメを生成
var kameTaro = createTurtle();
var kameJiro = createTurtle();
var kameSaburo = createTurtle();
var kameShiro = createTurtle();

{// 亀三郎と亀四郎は後ろに下がる
  kameSaburo.bk(100);
  kameShiro.bk(100);
}

{// アニメーションする
  var i = 0;
  while (i < 360) {

    {// 亀太郎は右回り
      kameTaro.rt(1);
      kameTaro.fd(1);
    }

    { // 亀次郎は左回り
      kameJiro.lt(1);
      kameJiro.fd(1);
    }

    { // 亀三郎は右回り
      kameSaburo.rt(1);
      kameSaburo.fd(1);
    }

    {// 亀四郎は左回り
      kameShiro.lt(1);
      kameShiro.fd(1);
    }

    i++;
  }
}