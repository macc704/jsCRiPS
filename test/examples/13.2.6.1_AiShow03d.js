if (judge("木村拓哉", "工藤静香")) {
    println("相性ばっちり！");
} else {
    println("努力次第．．．");
}

function judge(name1, name2) {
    if (countAishow(name1, name2) > 80) {
        return true;
    } else {
        return false;
    }
}

function countAishow(name1, name2) {
    var x = name1.hashCode() + name2.hashCode();
    x = x % 100;
    return x;
}