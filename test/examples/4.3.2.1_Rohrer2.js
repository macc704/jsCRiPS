var height; //身長
var weight; //体重
var rohrer; //ローレル指数

println("身長を入力してください");
height = input();
println("体重を入力してください");
weight = input();

//ローレル指数を求める
rohrer = weight * 10000000 / height / height / height;

//ローレル指数を表示する
println("ローレル指数は" + rohrer + "です。");

//体型に対するコメントを提示する
if (rohrer < 100) {
    println("やせすぎですね。");
}
if (rohrer >= 100 && rohrer < 115) {
    println("やせていますね。");
}
if (rohrer >= 115 && rohrer < 145) {
    println("普通ですね。");
}
if (rohrer >= 145 && rohrer < 160) {
    println("太っていますね。");
}
if (rohrer >= 160) {
    println("太りすぎですね。");
}