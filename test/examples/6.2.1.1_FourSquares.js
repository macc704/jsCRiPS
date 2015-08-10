var t = createTurtle();

{ // 窓を描く
  var j = 1;
  while (j <= 4) {
  { // 四角形を描く
    var i = 1;
    while (i <= 4) {
      t.fd(50);
      t.rt(90);
      i++;
    }
  }
  t.rt(90);
  j++;
}
}