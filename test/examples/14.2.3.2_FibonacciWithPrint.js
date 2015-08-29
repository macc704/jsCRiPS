print("fib(5, 0) = " + fib(5, 0));

function fib(n, indentCount) {
    printStart(n, indentCount);
    var value;
    if (n == 1) {
        value = 1;
    } else if (n == 2) {
        value = 2;
    } else {
        value = fib(n - 1, indentCount + 1) + fib(n - 2, indentCount + 1);
    }
    printEnd(value, indentCount);
    return value;
}

function printStart(length, indentCount) {
    makeIndent(indentCount);
    println("fib(" + length + ", " + indentCount + ")");
}

function printEnd(result, indentCount) {
    makeIndent(indentCount);
    println("// return " + result);
}

function makeIndent(indentCount) {
    for (i = 0; i < indentCount; i++) {
        print("\t");
    }
}