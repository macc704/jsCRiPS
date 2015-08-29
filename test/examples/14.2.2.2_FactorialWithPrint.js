print("factorial(5, 0) = " + factorial(5, 0));

function factorial(n, indentCount) {
    printStart(n, indentCount);
    var result;
    if (n == 1) {
        result = 1;
    } else {
        result = n * factorial(n - 1, indentCount + 1);
    }
    printEnd(result, indentCount);
    return result;
}

function printStart(length, indentCount) {
    makeIndent(indentCount);
    println("factorial(" + length + ", " + indentCount + ")");
}

function printEnd(result, indentCount) {
    makeIndent(indentCount);
    println("// return " + result);
}

function makeIndent(indentCount) {
    for (var i = 0; i < indentCount; i++) {
        print("\t");
    }
}