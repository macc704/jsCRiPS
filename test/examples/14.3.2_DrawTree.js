var t = createTurtle();
canvasSize(500,500);
t.warp(250,400);

drawY(50);

function drawY(length) {
  
  if (length < 5) {// 再帰の終点
    return;
  }
  
  t.fd(length);// 幹を描く
  
  // 左の枝を描く
  t.lt(30);
  t.fd(length / 2);
  drawY(length / 2);
  t.bk(length / 2);
  t.rt(30);
  
  // 右の枝を描く
  t.rt(30);
  t.fd(length / 2);
  drawY(length / 2);
  t.bk(length / 2);
  t.lt(30);
  
  t.bk(length);// 幹の根元に戻る
  
}