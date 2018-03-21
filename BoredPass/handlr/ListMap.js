export default class ListMap {
  constructor() {
    this.objects = [];
  }
  findByKey(key) {
    var found = [];
    for (var i = 0; i < this.objects.length; i++) {
      if (this.objects[i]['key'] == key)
        return this.objects[i];
    }
    return null;
  }
  put(key, value, index) {
    var obj = this.findByKey(key);
    if (obj)
      obj.list.push(value);
    else {
      var list = [];
      list.push(value);
      if (index == null)
        this.objects.push({ key: key, list: list });
      else
        this.objects.splice(index, 0, { key: key, list: list });
    }
  }
  get(key) {
    return this.findByKey(key);
  }
  forEach(delegate) {
    this.objects.forEach((obj) => {
      delegate(obj.key, obj.list);
    });
  }
}
