var t = createTurtle();

{ // （円を）10個描く
  var j = 1;
  while (j <= 10) {
    { // 円を描く
      var i = 1;
      while (i <= 360) {
        t.fd(1);
        t.rt(j);
        i = i + j;
      }
    }
    j = j + 1;
  }
}