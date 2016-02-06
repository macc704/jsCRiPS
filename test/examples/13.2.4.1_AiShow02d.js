var aishow = judge("木村拓哉", "工藤静香");
println("相性は" + aishow + "です");


function judge(name1, name2) {
    var x = name1.hashCode() + name2.hashCode();
    x = x % 100;
    if (x > 80) {
        return "ばっちり";
    } else {
        return "そこそこ";
    }
}