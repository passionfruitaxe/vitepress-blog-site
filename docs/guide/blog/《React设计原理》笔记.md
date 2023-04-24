# 《React 设计原理》笔记

本篇博客可能需要搭配`[卡颂]《React设计原理》电子工业出版社`观看，主要是梳理一下流程中的细节部分，不会大篇幅的谈书中内容

React 总共分为三个板块：Reconciler、Renderer、Scheduler

Reconciler 工作阶段称为 render 阶段

Renderer 工作阶段称为 commit 阶段

Scheduler 工作阶段称为 schedule 阶段

## render 阶段

主要分为两个部分，beginWork 和 completeWork，在 render 阶段中我们要根据此时组件是首次挂载还是更新做出不同的应对策略

**mount 时:**

beginWork:

创建子 fiberNode，并将已创建的 fiberNode 连接成 fiberTree

completeWork:

为 fiberNode 生成对应的 DOM 对象，并初始化属性，形成完整的离层 DOM 树

**update 时:**

beginWork:

判断节点能否进行复用，如果不能复用则进行调和，为生成的子 fiberNode 标记副作用 flags

completeWork:

标记删除“更新前有，更新后无”的属性，标记更新“update 流程前后发生改变的属性”，并进行 flag 冒泡

接下来我们随着一个样例讲一下细节：

```html
<!-- dom结构大概是这样 -->
<App>
  <div>
    "Hello"
    <span></span>
  </div>
</App>
```

![1.1](/images\1.1.png)

fiberNode 的创建是以深度优先算法创建的，在递归的递阶段执行 beginWork，归阶段执行 completeWork

已知存在全局变量**workInProgress**表示正在处理的 fiberNode[初始值为 HostRootFiber]，简称**wip**

mount 阶段执行流程如下：（update 阶段 beginWork 会判断能否复用原来的 fiberNode）

1. HostRootFiber beginWork（创建 App fiberNode）
2. App fiberNode beginWork（创建 div fiberNode）
3. div fiberNode beginWork（创建"Hello" fiberNode、span fiberNode）
4. "Hello" fiberNode beginWork（叶子元素）
5. "Hello" fiberNode completeWork
6. span fiberNode beginWork（叶子元素）
7. span fiberNode completeWork
8. div fiberNode completeWork
9. App fiberNode completeWork
10. HostRootFiber completeWork

这里给出一段书上定义：

> （P92-93）
>
> 在 mount 流程中，其首先通过 createInstance 方法创建"fiberNode 对应的 DOM 元素"，然后执行 appendAllChildren 方法，将下一层 DOM 元素插入“createInstance 方法创建的 DOM 元素"中，具体逻辑为：
>
> 1. 从当前 fiberNode 向下遍历，将遍历到的第一层 DOM 元素类型（HostComponent、HostText）通过 appendChild 方法插入 parent 末尾
> 2. 对兄弟 fiberNode 执行步骤 1
> 3. 如果没有兄弟 fiberNode，则对父 fiberNode 的兄弟执行步骤 1
> 4. 当遍历流程回到最初步骤 1 所在层或者 parent 所在层时中止

![1.1](/images\1.1.png)

我们还是以这个图举例，第一次执行的 completeWork 为"Hello" fiberNode completeWork，执行流程如下：

1. 创建"Hello" fiberNode 对应的 DOM 元素
2. 执行 appendAllChildren 方法，此时他是叶子节点，无下一层 DOM 元素。设置"Hello" DOM Element 属性
3. 接下来是 span fiberNode 执行 beginWork 和 completeWork
4. div fiberNode 执行 completeWork，创建 div fiberNode 对应的 DOM 元素，将"Hello"和 span 插入 div fiberNode 对应的 DOM 元素中。设置 div DOM Element 属性
5. App fiberNode 同理

执行结束后形成了一颗离层 DOM 树

flag 冒泡是因为 Renderer 需要对“被标记的 fiberNode 对应的 DOM 元素”执行“flags 对应的 DOM 操作”，所以经由如下操作可将 flag 冒泡一层：

```ts
let subtreeFlags = NoFlags;
subtreeFlags |= child.subtreeFlags;
subtreeFlags |= child.flags;
completedWork.subtreFlags |= subtreeFlags;
```

completeWork 的 update 阶段稍有不同，他会进行两次遍历：

1. 第一次遍历，标记删除“更新前有，更新后无”的属性
2. 第二次遍历，标记更新“update 流程前后发生改变”的属性

所有的变化都会保存到 fiberNode.updaeQueue 中并且该 fiberNode 会标记 Update
