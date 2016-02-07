println("factorial(1) = " + factorial(1));
println("factorial(2) = " + factorial(2));
println("factorial(3) = " + factorial(3));
println("factorial(4) = " + factorial(4));
println("factorial(5) = " + factorial(5));

function factorial(n) {
    var result;
    if (n == 1) {
        result = 1;
    } else {
        result = n * factorial(n - 1);
    }
    return result;
}