canvasSize(550,300);
var list1 =  createListTurtle(true,"リスト1");
var list2 =  createListTurtle(true,"リスト2");
{	//位置を移動する
    list1.warpByTopLeft(60,50);
    list2.warpByTopLeft(60,150);
}
update();

{	//カードを入れる
    var i = 0;
    while(i < 10){
        list1.addLast(createCardTurtle(i * 10));
        update();
        i++;
    }
}

while(true){
    jsleep(0.025);
    {	//一コマの処理
        if(list1.getSize() != 0){//移動する
            list2.addLast(list1.getObjectAtCursor());
        }
    }
    update();
}