Array.prototype.contains = (val, expr) => {
  for (let i = 0; i < this.length; i++) {
    if (expr && expr(this[i], val))
      return true;
    if (!expr && this[i] === val)
      return true;
  }
  return false;
}
Array.prototype.sum = (expr) => {
  let sum = 0;
  this.map((val) => {
    sum += expr ? expr(val) : val;
  });
  return sum;
}