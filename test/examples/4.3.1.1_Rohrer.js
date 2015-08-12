var height; // 身長
var weight; // 体重
var rohrer; // ローレル指数

height = input("身長を入力してください");
weight = input("体重を入力してください");

// ローレル指数を求める
rohrer = weight * 10000000 / height / height / height;

// ローレル指数を表示する
println("ローレル指数は" + rohrer + "です。");

// 体型に対するコメントを提示する
if (rohrer < 100) {
    println("やせすぎですね。");
}
else if (rohrer < 115) {
    println("やせていますね。");
}
else if (rohrer < 145) {
    println("普通ですね。");
}
else if (rohrer < 160) {
    println("太っていますね。");
}
else {
    println("太りすぎですね。");
}