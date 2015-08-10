var kameTaro = createTurtle();
var kameJiro = createTurtle();
var kameSaburo = createTurtle();
var kameShiro = createTurtle();
  { // 亀三郎と亀四郎は後ろに下がる
    kameSaburo.bk(100);
    kameShiro.bk(100);
  }
  { // 亀太郎は右回り
    var i = 0;
    while (i < 360) {
      kameTaro.rt(1);
      kameTaro.fd(1);
      i++;
    }
  }
  { // c//亀次郎は左回り
    var i = 0;
    while (i < 360) {
      kameJiro.lt(1);
      kameJiro.fd(1);
      i++;
    }
  }
  { // c//亀三郎は右回り
    var i = 0;
    while (i < 360) {
      kameSaburo.rt(1);
      kameSaburo.fd(1);
      i++;
    }
  }
  { // c//亀四郎は左回り
    var i = 0;
    while (i < 360) {
      kameShiro.lt(1);
      kameShiro.fd(1);
      i++;
    }
  }