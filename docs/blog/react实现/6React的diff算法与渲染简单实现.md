#### React为节点的各种情况设置了标记。

#### 本文目前只简单实现Placement、Update和Deletion情况处理。

```js
export const NoFlags = /*                      */ 0b000000000000000000;
export const PerformedWork = /*                */ 0b000000000000000001;

// 插入
export const Placement = /*                    */ 0b000000000000000010;
// 更新
export const Update = /*                       */ 0b000000000000000100;
// 插入和更新
export const PlacementAndUpdate = /*           */ 0b000000000000000110;
// 删除
export const Deletion = /*                     */ 0b000000000000001000;
//...其它标记类型
```

## react首次渲染或更新的两个主要步骤

##### 1.在协调子节点时通过diff算法给每个标签打上标记。

##### 2.在commit渲染页面时通过标记对节点进行相应的操作。

## diff算法

### diff算法的前置设计

1. 只对同级元素进行`Diff`。如果一个`DOM节点`在前后两次更新中跨越了层级，不进行复用。

2. 两个不同类型的元素会产生出不同的树。如果元素由`div`变为`p`，React会销毁`div`及其子孙节点，并新建`p`及其子孙节点。

3. 对同一层级的子节点，开发者可以通过 key 来暗示哪些子元素在不同的渲染下能保持稳定。

### 代码思路

diff算法的时间复杂度为O(n)。

假设老节点为oldfiber链表，新节点为newchildern数组。

##### 首先进行一轮遍历寻找能复用的节点，没有时立即停止遍历。

##### 根据oldfiber和newchildern的情况分为三种情况处理

##### 1.只剩下oldfiber，这些节点都需删除，

##### 2.只剩下newchildern，，这些节点都需插入，

##### 3.oldfiber和newchildern都剩下，需要更详细的比较节点是删除，新增还是移动位置了。

### 代码实现

```js
function reconcileChildren(returnFiber, children) {
    if (!children) {
        return
    }
    // children可能只有一个，或是个对象,这里统一转换为数组
    const newChildren = Array.isArray(children) ? children : [children];
    //true则是更新，false是初次渲染
    const shouldTrackSideEffects = !!returnFiber.alternate;
    //老节点的链表头
    let oldFiber = returnFiber.alternate && returnFiber.alternate.child;
    //记录上一个节点,留作遍历时，next指向当前兄弟节点
    let previousNewFiber = null
    // 记录位置的下标
    let newIndex = 0;
    // 记录上次插入位置
    let lastPlacedIndex = 0;

    //第一轮遍历：从头遍历，找到不能复用的节点 这个循环就立即停止
    //将oldFiber和newChildren比较
    for (; oldFiber && newIndex < newChildren.length; newIndex++) {
        const newChild = newChildren[newIndex];
        if (newChild === null) {
            continue;
        }
        
        const same = sameNode(newChild, oldFiber);
        if (!same) {
            // 如果不相同，退出遍历
            break;
        }

        // 如果相同，复用，flags为更新
        const newFiber = createFiber(newChild, returnFiber);
        Object.assign(newFiber, {
            alternate: oldFiber,
            stateNode: oldFiber.stateNode,
            flags: Update,
        });
		// 计算节点的插入位置
        lastPlacedIndex = placeChild(
            newFiber,
            lastPlacedIndex,
            newIndex,
            shouldTrackSideEffects
        );
		// 构建新的fiber链表
        if (previousNewFiber === null) {
            returnFiber.child = newFiber;
        } else {
            previousNewFiber.sibling = newFiber;
        }

        previousNewFiber = newFiber;
        oldFiber = oldFiber.sibling;
    }

    // 如果新节点遍历完了，那么剩余的oldFiber都是要删除的
    if (newIndex === newChildren.length) {
        deleteRemainingChildren(returnFiber, oldFiber);
        return;
    }
    //更新时：没有老节点了，剩余的新节点要插入进去
    //初次渲染时：只走这边
    if (!oldFiber) {
        for (; newIndex < newChildren.length; newIndex++) {
            const newChild = newChildren[newIndex];
            if (newChild === null) {
                continue;
            }
            const newFiber = createFiber(newChild, returnFiber);

            lastPlacedIndex = placeChild(
                newFiber,
                lastPlacedIndex,
                newIndex,
                shouldTrackSideEffects
            );

            if (previousNewFiber === null) {
                returnFiber.child = newFiber;
            } else {
                previousNewFiber.sibling = newFiber;
            }

            previousNewFiber = newFiber;
        }
        return;
    }

    // oldfiber还有 newChildren也还没遍历完
    // oldFiber构建成一个map表，遍历newChildren，并查找是否在oldFiber存在。
    const existingChildren = mapRemainingChildren(oldFiber);
    for (; newIndex < newChildren.length; newIndex++) {
        const newChild = newChildren[newIndex];
        if (newChild === null) {
            continue;
        }
        const newFiber = createFiber(newChild, returnFiber);
        lastPlacedIndex = placeChild(
            newFiber,
            lastPlacedIndex,
            newIndex,
            shouldTrackSideEffects
        );
	   //如果找到老节点，说明可以复用，标记为更新，
       //实际上React里应该是插入和更新,这里只实现了更新。
        let matchedFiber = existingChildren.get(newFiber.key || newFiber.index);
        if (matchedFiber) {
            //从map里删除已经找到的节点
            existingChildren.delete(newFiber.key || newFiber.index);
            Object.assign(newFiber, {
                alternate: matchedFiber,
                stateNode: matchedFiber.stateNode,
                flags: Update,
            });
        }

        if (previousNewFiber === null) {
            returnFiber.child = newFiber;
        } else {
            previousNewFiber.sibling = newFiber;
        }

        previousNewFiber = newFiber;
    }
	//更新阶段
    //能复用的节点已经通过上次遍历确认完，那么剩下的老节点也都是要删除的
    if (shouldTrackSideEffects) {
        existingChildren.forEach((child) => deleteChild(returnFiber, child));
    }
}

```

### 上述主流程涉及的一些函数

#### sameNode:确认节点能否复用

```js
function sameNode(a, b) {
    return !!(a && b && a.key === b.key && a.type && b.type);
}
```

#### placeChild：判断新节点要插入的位置

```js
function placeChild(
    newFiber,
    lastPlacedIndex,
    newIndex,
    shouldTrackSideEffects  //true则是更新，false是初次渲染
) {
    newFiber.index = newIndex;
    // 初次渲染
    if (!shouldTrackSideEffects) {
        return lastPlacedIndex;
    }

    const current = newFiber.alternate;

    if (current) {
        const oldIndex = current.index;
        if (oldIndex < lastPlacedIndex) {
            // move
            newFiber.flags = Placement;
            return lastPlacedIndex;
        } else {
            return oldIndex;
        }
    } else {
        // 新增节点
        newFiber.flags = Placement;
        return lastPlacedIndex;
    }
}
```

#### mapRemainingChildren:构建oldFiber的map表

```js
function mapRemainingChildren(currentFirstChild) {
    const existingChildren = new Map();
    let existingChild = currentFirstChild;
    while (existingChild) {
        existingChildren.set(
            existingChild.key || existingChild.index,
            existingChild
        );
        existingChild = existingChild.sibling;
    }
    return existingChildren;
}
```

#### deleteRemainingChildren:将待删除的子节点加入deletions中

```js
// 删除节点链表,头结点是currentFirstChild
function deleteRemainingChildren(returnFiber, currentFirstChild) {
    let childToDelete = currentFirstChild;
    // 遍历链表，依次加入deletions
    while (childToDelete) {
        deleteChild(returnFiber, childToDelete);
        childToDelete = childToDelete.sibling;
    }
}

// commit阶段提交的是新fiber
function deleteChild(returnFiber, childToDelete) {
    if (returnFiber.deletions) {
        returnFiber.deletions.push(childToDelete);
    } else {
        returnFiber.deletions = [childToDelete];
    }
}
```

## commit阶段

##### 在页面渲染时根据不同标记处理节点

```js
function commitWorker(wip) {
    if (!wip) {
        return;
    }
    const { flags, stateNode } = wip;
    let parentNode = getParentNode(wip);
	// 插入节点
    if (flags & Placement && stateNode) {
        let hasSiblingNode = foundSiblingNode(wip, parentNode);
        if (hasSiblingNode) {
            parentNode.insertBefore(stateNode, hasSiblingNode);
        } else {
            parentNode.appendChild(wip.stateNode);
        }
    }
    // 更新节点属性
    if (flags & Update && stateNode) {
        updateNode(stateNode, wip.alternate.props, wip.props);
    }
   // 删除节点
    if (wip.deletions) {
        commitDeletion(wip.deletions, stateNode || parentNode);
    }
    // 深度优先渲染下个节点
    commitWorker(wip.child)
    commitWorker(wip.sibling)
}
```

#### getParentNode：获取父节点

```js
function getParentNode(wip) {
    let parent = wip.return;
    while (parent) {
        //函数组件stateNode为null，要继续往上找
        if (parent) {
            return parent.stateNode;
        }
        parent = parent.return;
    }
}
```

#### foundSiblingNode：找插入节点的位置

```js
function foundSiblingNode(fiber, parentNode) {
    let siblingHasNode = fiber.sibling;
    let node = null;
    while (siblingHasNode) {
        node = siblingHasNode.stateNode;
        if (node && parentNode.contains(node)) {
            return node;
        }
        siblingHasNode = siblingHasNode.sibling;
    }
    return null;
}
```

#### updateNode：复用节点，更新属性

```js
function updateNode(node, prevVal, nextVal) {
    Object.keys(prevVal)
        .forEach((k) => {
            if (k === "children") {
                // 有可能是文本
                if (isStringOrNumber(prevVal[k])) {
                    node.textContent = "";
                }
            } else if (k.slice(0, 2) === "on") {
                const eventName = k.slice(2).toLocaleLowerCase();
                // 移除之前的事件监听
                node.removeEventListener(eventName, prevVal[k]);
            } else {
                // 之前的属性可能在新的节点力不存在了，先统一清空
                if (!(k in nextVal)) {
                    node[k] = "";
                }
            }
        });

    Object.keys(nextVal)
        .forEach((k) => {
            if (k === "children") {
                // 有可能是文本
                if (isStringOrNumber(nextVal[k])) {
                    node.textContent = nextVal[k] + "";
                }
            } else if (k.slice(0, 2) === "on") {
                const eventName = k.slice(2).toLocaleLowerCase();
                node.addEventListener(eventName, nextVal[k]);
            } else {
                node[k] = nextVal[k];
            }
        });
}
```

#### commitDeletion:删除不再存在的老节点

```js
function commitDeletion(deletions, parentNode) {
    for (let i = 0; i < deletions.length; i++) {
        const deletion = deletions[i];
        parentNode.removeChild(getStateNode(deletion));
    }
}

function getStateNode(fiber) {
    let tem = fiber;
    while (!tem.stateNode) {
      tem = tem.child;
    }
    return tem.stateNode;
  }
```