var listMap = function () {
    var objects = [];
    var findByKey = function (key) {
        var found = [];
        for (var i = 0; i < objects.length; i++) {
            if (objects[i]['key'] == key)
                return objects[i];
        }
        return null;
    }
    this.put = function (key, value, index) {
        var obj = findByKey(key);
        if (obj)
            obj.list.push(value);
        else {
            var list = [];
            list.push(value);
            if (index == null)
                objects.push({ key: key, list: list });
            else
                objects.splice(index, 0, { key: key, list: list });
        }
    }
    this.get = function (key) {
        return findByKey(key);
    }
    this.forEach = function (delegate) {
        objects.forEach(function (obj) {
            delegate(obj.key, obj.list);
        });
    }
}

module.exports = new function () {
    this.ListMap = function () {
        return new listMap();
    }
};