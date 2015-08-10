var kameTaro = createTurtle();
var kameJiro = createTurtle();
{ // アニメーションをする
  var i = 0;
  while (i < 360) {
    { // 亀太郎は右回り
      kameTaro.rt(1);
      kameTaro.fd(1);
    }
    { // 亀次郎は左回り
      kameJiro.lt(1);
      kameJiro.fd(1);
    }
    i++;
  }
}