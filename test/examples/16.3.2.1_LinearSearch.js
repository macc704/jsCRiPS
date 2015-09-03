canvasSize(400,400);
var 最小値候補 = createListTurtle(true,"最小値候補");
var 未処理束 = createListTurtle(true,"未処理束");
var 検索済束 = createListTurtle(true,"検索済束");
{	//c//初期位置に移動する
    最小値候補.warp(200,100);
    最小値候補.setBgColor("#ff99cc");
    未処理束.warp(200,200);
    未処理束.setBgColor("#3366ff");
    検索済束.warp(200,300);
    検索済束.setBgColor("#00cc99");
    update();
}
{	//カードを追加する
    var i = 0;
    while(i < 8){
        未処理束.addLast(createCardTurtle(random(100)));
        update();
        i++;
    }
}
{	//検索をする
    最小値候補.addLast(未処理束.getObjectAtCursor());
    while(未処理束.getSize() > 0){
        if(未処理束.getObjectAtCursor().getNumber() < 最小値候補.getObjectAtCursor().getNumber()){
            検索済束.addLast(最小値候補.removeAtCursor());
            update();
            最小値候補.addLast(未処理束.removeAtCursor());
            update();
        }else {
            検索済束.addLast(未処理束.removeAtCursor());
            update();
        }

    }
    検索済束.moveAllTo(未処理束);
    検索済束.removeAll();
    update();
}