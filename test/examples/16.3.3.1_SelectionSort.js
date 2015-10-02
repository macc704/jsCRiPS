canvasSize(400, 500);
var 最小値候補 = createListTurtle(true, "最小値候補");
var 未処理束 = createListTurtle(true, "未処理束");
var 検索済束 = createListTurtle(true, "検索済束");
var 並替済束 = createListTurtle(true, "並替済束");
{	//c//初期位置に設定する
    最小値候補.warpByTopLeft(60, 50);
    最小値候補.setBgColor("#ff99cc");
    未処理束.warpByTopLeft(60, 150);
    未処理束.setBgColor("#3366ff");
    検索済束.warpByTopLeft(60, 250);
    検索済束.setBgColor("#00cc99");
    並替済束.warpByTopLeft(60, 350);
    並替済束.setBgColor("#ffff00");
    update();
}
{	//カードを追加する
    var i = 0;
    while (i < 8) {
        未処理束.addLast(createCardTurtle(random(100)));
        update();
        i++;
    }
}
{	//並び替える
    while (未処理束.getSize() > 0) {
        {	//最小値を検索する
            {	//未処理束の一番上を最小値候補に
                最小値候補.addLast(未処理束.getObjectAtCursor());
                update();
            }
            while (未処理束.getSize() > 0) {
                if (未処理束.getObjectAtCursor().getNumber() < 最小値候補.getObjectAtCursor().getNumber()) {
                    {	//最小値候補を引いたカードと入れ替え，古い最小値候補は検索済み束へ
                        検索済束.addLast(最小値候補.getObjectAtCursor());
                        update();
                        最小値候補.addLast(未処理束.getObjectAtCursor());
                        update();
                    }
                } else {
                    {	//引いたカードを検索済み束へ
                        検索済束.addLast(未処理束.getObjectAtCursor());
                        update();
                    }
                }

            }
            {	//検索済み束を元に戻す
                検索済束.moveAllTo(未処理束);
                update();
            }
        }
        {	//見つけた最小値を並替済み束へ移動する
            並替済束.addLast(最小値候補.getObjectAtCursor());
            update();
        }
    }
}