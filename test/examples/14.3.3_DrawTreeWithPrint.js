var t = createTurtle();

canvasSize(500, 500);
t.warp(250, 400); // 木を描く位置まで移動する

drawY(50, 0);


// Yを描く
function drawY(length, indentCount) {
    printStart(length, indentCount);

    if (length < 5) {// 再帰の終点
        printEnd(indentCount);
        return;
    }

    t.fd(length);// 幹を描く

    // 左の枝を描く
    t.lt(30);
    t.fd(length / 2);
    drawY(length / 2, indentCount + 1);
    t.bk(length / 2);
    t.rt(30);

    // 右の枝を描く
    t.rt(30);
    t.fd(length / 2);
    drawY(length / 2, indentCount + 1);
    t.bk(length / 2);
    t.lt(30);

    t.bk(length);// 幹の根元に戻る

    printEnd(indentCount);
}

function printStart(length, indentCount) {
    makeIndent(indentCount);
    println("drat.wY(" + length + ", " + indentCount + ")");
}

function printEnd(indentCount) {
    makeIndent(indentCount);
    println("//");
}

function makeIndent(indentCount) {
    for (var i = 0; i < indentCount; i++) {
        print("\t");
    }
}