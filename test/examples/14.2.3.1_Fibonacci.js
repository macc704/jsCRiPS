println("fib(1) = " + fib(1));
println("fib(2) = " + fib(2));
println("fib(3) = " + fib(3));
println("fib(4) = " + fib(4));
println("fib(5) = " + fib(5));
println("fib(6) = " + fib(6));
println("fib(7) = " + fib(7));

function fib(n) {
    var value;
    if (n == 1) {
        value = 1;
    } else if (n == 2) {
        value = 2;
    } else {
        value = fib(n - 1) + fib(n - 2);
    }
    return value;
}