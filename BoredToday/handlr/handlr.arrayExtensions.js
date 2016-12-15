Array.prototype.contains = function (val, expr) {
    for (var i = 0; i < this.length; i++) {
        if (expr && expr(this[i], val))
            return true;
        if (!expr && this[i] === val)
            return true;
    }
    return false;
}
Array.prototype.sum = function (expr) {
    var sum = 0;
    for (var i = 0; i < this.length; i++) {
        if (expr)
            sum += expr(this[i]);
        else
            sum += this[i];
    }
    return sum;
}