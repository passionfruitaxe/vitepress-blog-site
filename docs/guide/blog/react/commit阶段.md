# commit 阶段

`Renderer`工作阶段被称为`commit`阶段

不同于`render`阶段可以被打断，`commit`阶段一旦开始就会执行到结束

在不同的环境下会使用不同的`Renderer`，本章将用 Web 开发最常见的`ReactDOM`来讲解

主要分为三个子阶段

- **`BeforeMutation`**

  主要任务是：

  - 为`mutation`阶段做准备，包括
    - 执行`getSnapshotBeforeUpdate`生命周期
    - 计算布局
    - 准备更新队列

- **`Mutation`**

  主要任务是：

  - 进行 DOM 元素的增、删、改

- **`Layout`**

  主要任务是：

  - 执行某些特殊情况下的回调

每一个子阶段还要再细分为三个阶段：（xxx 表示上面三个子阶段）

- **`commitXXXEffects()`**

- **`commitXXXEffects_begin()`**

  向下遍历到第一个满足如下条件之一的"`fiberNode`"

  - 当前`fiberNode`的子`fiberNode`不包含"该子阶段对应的`flags`"，即当前`fiberNode`是包含该子阶段对应 flag 的层级最低的`fiberNode`
  - 当前`fiberNode`不存在子`fiberNode`，即当前`fiberNode`是叶子节点

  然后会执行下面的函数

- **`commitXXXEffects_complete()`**

  执行"`flags`对应操作"，包含三个步骤

  - 对当前的`fiberNode`执行"`flags`"对应操作，即执行`commitXXXEffectsOnFiber()`
  - 如果当前`fiberNode`存在兄弟`fiberNode`，则对兄弟`fiberNode`执行`commitXXXEffect_begin()`
  - 如果不存在兄弟`fiberNode`，则对父`fiberNode`执行`commitXXXEffects_complete()`

在实际源码中，只有`BeforeMutation`阶段是符合的，其余两个阶段都有些出入，简单来说：

`BeforeMutation`阶段存在三个子阶段——`commitBeforeMutationEffects()`、`_begin()`、`_complete`

`Mutation`和`Layout`阶段都只有——`commitXXXEffects()`

> Question-1:
>
> 部分子阶段都有一些“特有的操作”，具体哪个阶段是什么？

## BeforeMutation

> Answer-1(1)：
>
> 这个阶段没有"特有的操作"

`BeforeMutation`阶段的目的是为`Mutation`阶段做准备

主要工作发生在`commitBeforeMutationEffects_complete`中的`commitBeforeMutationEffectsOnFiber`中

对于不同的`fiberNode.tag`有不同的处理方法

- `FunctionComponent`：如果存在`Update flag`，进入`commitUseEffectEventMount()`
- `ClassComponent`：更新组件实例的`props`和`state`，执行`getSnapShotBeforeUpdate`生命周期
- `HostRoot`：执行`clearContainer(finishedWork.stateNode.container)`，清空`HostRoot`挂载的内容，方便`Mutation`阶段渲染

## Mutation

> Answer-1(2)：
>
> 删除 DOM 元素

`DOM3 Events`规范中有一个`DOM API`: `MutationObserver`

在`commit`的`Mutation`阶段可以推断应该是操作`DOM`的行为

> 18.2.0 版本的源码中不存在 commitMutationEffects_begin()和 commitMutationEffects_complete()方法，由 commitMutationEffects 直接调用 commitMutationEffectsOnFiber，在这个函数中再调用 recursivelyTraverseMutationEffects
>
> 所谓 commitMutationEffects_begin 和 commitMutationEffects_complete 方法是 recursivelyTraverseMutationEffects 方法的两个代码段

- **删除`DOM`节点**

  在`render`阶段的`beginWork`执行`reconcile`操作时添加了一个`fiberNode.deletions`数组，`Mutation`阶段将遍历这个数组，并执行`commitDeletionEffects()`方法删除 DOM 元素

  > 完整逻辑比较复杂，删除 DOM 元素还需要考虑很多逻辑
  >
  > - 子树中所有组件的 unmount 逻辑
  > - 子树中所有 ref 属性的卸载操作
  > - 子树所有 Effect 相关 Hook（比如 useLauoutEffects 回调）的执行

- **插入、移动 DOM 元素**

```ts
function recursivelyTraverseMutationEffects(
  root: FiberRoot,
  parentFiber: Fiber,
  lanes: Lanes
) {
  // commitMutationEffects_begin()
  const deletions = parentFiber.deletions;
  if (deletions !== null) {
    for (let i = 0; i < deletions.length; i++) {
      const childToDelete = deletions[i];
      try {
        commitDeletionEffects(root, parentFiber, childToDelete);
      } catch (error) {
        captureCommitPhaseError(childToDelete, parentFiber, error);
      }
    }
  }

  // commitMutationEffects_complete()
  const prevDebugFiber = getCurrentDebugFiberInDEV();
  if (parentFiber.subtreeFlags & MutationMask) {
    let child = parentFiber.child;
    while (child !== null) {
      setCurrentDebugFiberInDEV(child);
      commitMutationEffectsOnFiber(child, root, lanes);
      child = child.sibling;
    }
  }
  setCurrentDebugFiberInDEV(prevDebugFiber);
}
```

`recursivelyTraverseMutationEffects`会在`commitMutationEffectsOnFiber`中调用

简而言之，这部分代码会"递归的遍历"（正如`recursivelyTraverseMutationEffects`名字）`fiberNode`，为`fiberNode`兑现其`flags`

![img_v2_3d46928c-c82f-47f2-b8c7-80a1f442127l](/images/1.6.png)

<br>

对于不同的`fiberNode.tag`有不同的处理方法，以`HostComponent`的`Placement`举例：

> 这里先介绍两个函数
>
> getHostParentFiber()
>
> 从当前 fiberNode 向上遍历，获取第一个类型为 HostComponent、HostRoot、HostPortal 三者之一的祖先 fiberNode，其对应 DOM 元素是"执行 DOM 操作的目标元素的父级 DOM 元素"
>
> getHostSibling()
>
> 向上寻找需要 insertBefore(node, before)函数需要的 before 节点

对于每一个节点，先调用`getHostParentFiber()`获取父级 DOM 元素，再调用`getHostSibling()`获取最低层级的无`Placement flag`的真实 DOM 元素

接下来的行为很简单，调用`insertOrAppendPlacementNode(finishedWork, before, parent)`

`Mount`场景：

- 如果`before`节点存在，则将目标 DOM 元素插入`before`之前
- 如果`before`节点不存在，则将目标 DOM 元素作为父 DOM 的最后一个元素插入

`Update`场景：

- 如果`before`节点存在，则将目标 DOM 元素移至`before`之前

- 如果`before`节点不存在，则将目标 DOM 元素移至同级最后

- 更新 DOM 元素

  > 书上写执行 DOM 元素更新是在 commitWork()中，实际在 18.2.0 源码中更新部分内联在 commitMutationEffectOnFiber 里，最终执行的 commitUpdate()为更新操作

  在`render`阶段的`completeWork`中，所有"变化属性的`[key, value]`"会保存在`fiberNode.updateQueue`，最终在`commitUpdate`中调用

  - `updateProperty`——不存在`updatePayload/updateQueue`
  - `updatePropertiesWithDiff`——存在`updatePayload/updateQueue`

  遍历并改变对于属性：

  - style 属性变化
  - innerHTML
  - 直接文本节点的变化
  - 其他元素属性

## Layout

> Answer-1(3)
>
> OffscreenComponent 的显隐逻辑

> 在 18.2.0 源码中同样不存在 commitLayoutEffects_begin()和 commitLayoutEffects_complete()，都是在 commitLayoutEffects()中直接调用 commitLayoutEffectsOnFiber()

对于不同的`fiberNode.tag`有不同的处理方法：

- 对于`OffscreenComponen`t，执行`OffscreenComponent`的显隐操作
- 对于`ClassComponent`，执行`componentDidMount/Update`方法
- 对于`FC`，执行`useLayoutEffect`的`callback`

`HostComponent`类型的`fiberNode.updateQueue`最终会在`Mutation`阶段处理，但除了`HostComponent`类型外，其他类型`fiberNode`也存在`updateQueue`

- `ClassComponent`：`this.setState(dispatch, callback)`中的`callback`
- `HostRoot`：执行`React.DOM.render(element, container, callback)`中的`callback`

这两种情况下产生的`callback`会在`commitLayoutEffectOnFiber`中执行
