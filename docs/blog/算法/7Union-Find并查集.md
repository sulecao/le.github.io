# Union-Find并查集

## 并查集的作用

并查集主要用来解决集合类的问题，集合间的连通性问题

## 并查集的实现

主要有两个操作

find：查询节点所在的集合

merge：合并两个节点所在的集合

### 方案A:quick find

用数组存储每个索引对应的集合，数组的值就是集合的名称代表。

时间复杂度

查找：O(1)

合并：O(n)

```js
function Unionfind(n) {
    this.data = new Array(n)
    //初始化每个节点的值为自己，每个不同的值都是一个集合
    for (let i = 0; i < n; i++) {
        this.data[i] = i
    }
}

// 查找所在集合
Unionfind.prototype.find = function (i) {
    return this.data[i]
}

// 合并集合
Unionfind.prototype.merge = function (x, y) {
    let UnionX = this.data[x]
    let UnionY = this.data[y]
    if (UnionX == UnionY) {
        return
    }
    // 数组内：集合为X的节点都变成Y
    for (let i = 0; i < this.data.length; i++) {
        this.data[i] == UnionX && (this.data[i] = UnionY)
    }
}
```

### 方案B:quick union

将各个集合抽象成倒着的树，每个儿子节点指向父亲节点，根节点指向自己

即根节点```data[i] = i```，儿子节点```data[i] = fatherIndex```

![image.png](https://upload-images.jianshu.io/upload_images/17012856-cebfd0e32a53548d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```js
function Unionfind(n) {
    this.data = new Array(n)
    //倒着的树，儿子指向父亲。根节点指向自己
    //初始时都是独立的树，都是根节点，都指向自己
    for (let i = 0; i < n; i++) {
        this.data[i] = i
    }
}

// 查找所在集合，需要一直查，直到指向自己
Unionfind.prototype.find = function (i) {
    let root = i
    while (this.data[root] !== root) {
        root = this.data[root]
    }
    return root
}

// 合并集合
Unionfind.prototype.merge = function (x, y) {
    let UnionX = this.find(x)
    let UnionY = this.find(y)
    if (UnionX == UnionY) {
        return
    }
    // 集合X的root指向y集合根节点，所有的节点都挂到y节点上了，y节点的根节点称为两个集合的根节点
    this.data[x] = UnionY
}
```

### 方案B的优化

一：带权合并

在执行merge时，上个实现是无规则的将两个树合并成一个。

我们可以优化：挂载时将少的节点树挂到多的节点树上，这样合并后较少的节点多个一个父级。（另一种思路是将树高低的合入树高高的）

二：路径压缩

树的合并极端情况下会合并成为一个链表，查找根节点遍历次数很多，
可以在每次find操作时，直接将遇到的节点都指向根节点，减少后面查找根节点的遍历次数。

路径压缩示意图：

![image.png](https://upload-images.jianshu.io/upload_images/17012856-f9e05640df1c95e7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```js
function Unionfind(n) {
    this.data = new Array(n)
    // 增加一个以i为根节点的树的节点数量，初始都为1
    this.treeSize = new Array(n).fill(1)
    for (let i = 0; i < n; i++) {
        this.data[i] = i
    }
}

// 查找所在集合，需要一直查，直到指向自己
Unionfind.prototype.find = function (i) {
    let root = i
    while (this.data[root] !== root) {
        root = this.data[root]
    }
    //路径压缩：将遍历时遇到的各层节点都直接指向根节点
    while (this.data[i] !== root) {
        let t = i
        i = this.data[i]
        this.data[t] = root
    }
    return root
}

// 合并集合
Unionfind.prototype.merge = function (x, y) {
    let UnionX = this.find(x)
    let UnionY = this.find(y)
    if (UnionX == UnionY) {
        return
    }
    // 带权合并：
    // 挂载时将少的节点树挂到多的节点树上，这样较少的节点多一个父级
    if (this.treeSize[UnionX] < this.treeSize[UnionY]) {
        this.data[UnionX] = UnionY
        this.treeSize[y] = this.treeSize[x] + this.treeSize[y]
    } else {
        this.data[UnionY] = UnionX
        this.treeSize[x] = this.treeSize[x] + this.treeSize[y]
    }
}
```
