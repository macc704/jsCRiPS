//各教科の点数を設定する
var japanese = 49; //国語
var mathematics = 72; //数学
var english = 25; //英語

//３教科の合計点を求める
var total = japanese + mathematics  + english;
//３教科の平均を求める
var average = total / 3.0; //平均を計算する

//平均を四捨五入する
average = average * 10;
if ((average % 10) >= 5) { //１の位が５以上なら
    average = average + 10; //繰り上げる
}
var result = parseInt(average / 10);//var型のaverageをint型に型変換して、resultに代入する

//四捨五入した平均を表示する
println(result);