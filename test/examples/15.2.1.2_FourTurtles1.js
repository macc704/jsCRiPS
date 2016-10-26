canvasSize(400,400);
var turtles = createListTurtle();
turtles.warpByTopLeft(100,300);
{	//c//タートルを4匹作成する
    var i = 0;
    while(i < 4){
        turtles.add(createTurtle());
        i++;
    }
}
{	//c//初期位置に移動する
    turtles.get(0).warp(100,100);
    turtles.get(1).warp(100,200);
    turtles.get(2).warp(200,100);
    turtles.get(3).warp(200,200);
}
{	//for
    var i = 0;
    while(i < 360){
        {	//for
            var j = 0;
            while(j < 4){
                {	//一コマの処理
                    turtles.moveCursorToNext();
                    turtles.getObjectAtCursor().fd(1);
                    turtles.getObjectAtCursor().rt(1);
                    j++;
                }
            }
        }
        i++;
    }
}