// 西暦を和暦に変換する

showTitle();
convertYear();
showEndTitle();

// 西暦を和暦に変換する
function convertYear() {
    var year = inputYear();
    var japaneseYear = convertToJapaneseYear(year);
    showResult(year, japaneseYear);
}

// 西暦を入力する
function inputYear() {
    var year = input("西暦を入力してください");
    return year;
}

// 西暦を和暦に変換する
function convertToJapaneseYear(year) {
    var japaneseYear;
    if (year >= 1989) {
        japaneseYear = "平成" + (year - 1988);
    } else if (year >= 1926) {
        japaneseYear = "昭和" + (year - 1925);
    } else {
        japaneseYear = "不明";
    }
    return japaneseYear;
}

// 変換結果を出力する
function showResult(year, japaneseYear) {
    println(year + "年は" + japaneseYear + "年です.");
}

// アプリケーションの開始を知らせる
function showTitle() {
    println("西暦和暦変換プログラムを開始します");
}

// アプリケーションの終了を知らせる
function showEndTitle() {
    println("西暦和暦変換プログラムを終了します");
}