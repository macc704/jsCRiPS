// 西暦を和暦に変換する

// アプリケーションの開始を知らせる
println("西暦和暦変換プログラムを開始します");

{// 西暦を和暦に変換する
    var year;
    var japaneseYear;

    // 西暦を入力する
    year = input("西暦を入力してください");

    // 西暦を和暦に変換する
    if (year >= 1989) {
        japaneseYear = "平成" + (year - 1988);
    } else if (year >= 1926) {
        japaneseYear = "昭和" + (year - 1925);
    } else {
        japaneseYear = "不明";
    }

    // 変換結果を出力する
    println(year + "年は" + japaneseYear + "年です.");
}

// アプリケーションの終了を知らせる
println("西暦和暦変換プログラムを終了します");