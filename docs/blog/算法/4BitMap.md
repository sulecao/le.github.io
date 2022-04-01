问题：已知有n整个整数，这些整数的范围是[0, 100]，

请你设计一种数据结构，使用数组存储这些数据，并提供两种方法，分别是addMember 和 isExist。

#### 方案一：数组直接存储，遍历查找

```js
function FindClass() {
    let datas = [];

    // 加入一个整数 member
    this.addMember = function (member) {
        datas.push(member);
    };

    // 判断member是否存在
    this.isExist = function (member) {
        for (var i = 0; i < datas.length; i++) {
            if (datas[i] == member) {
                return true;
            }
        }
        return false;
    };
}
```

#### 方案二：数字作为数组索引存储，查到时速度快，但会占用更多的内存

```js
function FindClass() {
    let datas = [];

    this.addMember = function (member) {
        datas[member] = true;
    };

    this.isExist = function (member) {
        return !!datas[member];
    };
}
```

#### 方案三：bitmap

##### 前置知识： 位运算

###### 按位与 &

相同二进制位的数字都是1，则结果为1，其它情况都为0

如1 & 5 = 1

```js
二进制    整数
0 0 1     1
1 0 1     5

0 0 1     1
```

###### 按位或 |

相同二进制位的数字都是0，则结果为0，其它情况都为1

如1 | 5 = 5

```js
二进制    整数
0 0 1     1
1 0 1     5

1 0 1     5
```

###### 左移 <<

二进制向左移动 n 位，在后面添加 n 个0，**运算优先级大于按位与 &和按位或 |**
如3<<1 = 6

```text
二进制   整数
0 1 1    3

1 1 0    6
```

##### 关于问题，可以用二进制的0和1表示数字是否存在

比如: 00001001 表示0和3存在，它代表的十进制数是9

```js
0 0 0 0 1 0 0 1 //二进制
7 6 5 4 3 2 1 0 //对应的数字是否存在
```

一个整数是32位，可以表示0~31是否存在。

则可以建立以下数组，相比直接用长度为320的数组保存320个数字是否存在，空间省去了十分之一。

```
datas[0]  表示0~31存在与否
datas[1]  表示32~63存在与否
....
datas[9]  表示288~319存在与否
```

#### BitMap实现

```js
function BitMap(size) {
    let datas = new Array(size).fill(0);

    this.addMember = function (member) {
        let index = Math.floor(member / 32) //在数组的索引，如2在数组索引为0的位置。
        let bit = member % 32 //在二进制数的位置，如2在bit的索引为2的位置。
        datas[index] = datas[index] | 1 << bit // 1<<2为00100， xx0xx|00100为xx1xx
    };s

    this.isExist = function (member) {
        let index = Math.floor(member / 32)
        let bit = member % 32
        return (datas[index] & 1 << bit) !== 0 // 1<<2为00100， xxxxx&00100为00100或00000
    };
}
```
