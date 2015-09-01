canvasSize(1100,500);
var turtle0 = createTurtle();
var turtle1 = createTurtle();
var turtle2 = createTurtle();
var turtle3 = createTurtle();
{	//c//初期位置に移動する
    turtle0.warp(100,100);
    turtle1.warp(100,200);
    turtle2.warp(200,100);
    turtle3.warp(200,200);
}
{	//for
    var i = 0;
    while(i < 360){
        {	//一コマの処理をする
            turtle0.fd(1);
            turtle0.rt(1);
            turtle1.fd(1);
            turtle1.rt(1);
            turtle2.fd(1);
            turtle2.rt(1);
            turtle3.fd(1);
            turtle3.rt(1);
            i++;
        }
    }
}