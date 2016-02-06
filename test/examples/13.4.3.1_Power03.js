test(2, 2, 4);
test(2, 3, 8);
test(2, 4, 16);
test(3, 3, 27);


function test(base, exp, expected) {
    var answer = calculatePower(base, exp);
    var result = "";
    if (answer == expected) {
        result = "PASS";
    } else {
        result = "FAIL";
    }
    println("calculatePower(" + base + ", " + exp + ") = " + answer + ", 判定: " + result);
}

// 累乗を計算する
function calculatePower(base, exponent) {
    var power = 1;// 累乗数の初期値を、数の0乗（1）に設定する

    // 累乗を計算する
    var i = 0;
    while (i < exponent) {
        power = power * base;
        i++;
    }

    return power;
}