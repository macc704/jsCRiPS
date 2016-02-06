test(2, 2);
test(2, 3);
test(2, 4);
test(3, 3);


function test(base, exp) {
    println("calculatePower(" + base + ", " + exp + ") = " + calculatePower(base, exp));
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