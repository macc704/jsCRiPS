var aishow = judge("木村拓哉", "工藤静香");
if (aishow == true) {
    println("相性ばっちり！");
} else {
    println("努力次第．．．");
}


function judge(name1, name2) {
    var x = name1.hashCode() + name2.hashCode();
    x = x % 100;
    if (x > 80) {
        return true;
    } else {
        return false;
    }
}