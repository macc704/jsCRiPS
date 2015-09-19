canvasSize(1100,500);
var holder = createListTurtle(true);
holder.warpByTopLeft(50,200);
{	//アニメーション用画像を用意する
    var i = 1;
    while(i <= 8){
        holder.addLast(createImageTurtle((("img/man" + i) + ".gif")));
        i++;
    }
}
var man = createTurtle();
while(true){
    jsleep(0.1);
    {	//1コマの処理
        holder.moveCursorToNext();
        man.looks(holder.getObjectAtCursor());
    }
    update();
}