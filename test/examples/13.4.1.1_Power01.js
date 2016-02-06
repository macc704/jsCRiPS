println("calculatePower(" + 2 + ", " + 2 + ") = " + calculatePower(2, 2));
println("calculatePower(" + 2 + ", " + 3 + ") = " + calculatePower(2, 3));
println("calculatePower(" + 2 + ", " + 4 + ") = " + calculatePower(2, 4));
println("calculatePower(" + 3 + ", " + 3 + ") = " + calculatePower(3, 3));


// 累乗を計算する
function calculatePower(base,exponent) {
    var power = 1;// 累乗数の初期値を、数の0乗（1）に設定する

    // 累乗を計算する
    var i = 0;
    while (i < exponent) {
        power = power * base;
        i++;
    }

    return power;
}