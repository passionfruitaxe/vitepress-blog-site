# commit阶段

`Renderer`工作阶段被称为`commit`阶段

不同于`render`阶段可以被打断，`commit`阶段一旦开始就会执行到结束

在不同的环境下会使用不同的`Renderer`，本章将用Web开发最常见的`ReactDOM`来讲解

主要分为三个子阶段

- **`BeforeMutation`**

  主要任务是：

  - 为`mutation`阶段做准备，包括
    - 执行`getSnapshotBeforeUpdate`生命周期
    - 计算布局
    - 准备更新队列

- **`Mutation`**

  主要任务是：

  - 进行DOM元素的增、删、改

- **`Layout`**

  主要任务是：

  - 执行某些特殊情况下的回调



每一个子阶段还要再细分为三个阶段：（xxx表示上面三个子阶段）

- **`commitXXXEffects()`**

- **`commitXXXEffects_begin()`**

  向下遍历到第一个满足如下条件之一的"`fiberNode`"

  - 当前`fiberNode`的子`fiberNode`不包含"该子阶段对应的`flags`"，即当前`fiberNode`是包含该子阶段对应flag的层级最低的`fiberNode`
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
> 删除DOM元素

`DOM3 Events`规范中有一个`DOM API`: `MutationObserver`

在`commit`的`Mutation`阶段可以推断应该是操作`DOM`的行为

> 18.2.0版本的源码中不存在commitMutationEffects_begin()和commitMutationEffects_complete()方法，由commitMutationEffects直接调用commitMutationEffectsOnFiber，在这个函数中再调用recursivelyTraverseMutationEffects
>
> 所谓commitMutationEffects_begin和commitMutationEffects_complete方法是recursivelyTraverseMutationEffects方法的两个代码段

- **删除`DOM`节点**

  在`render`阶段的`beginWork`执行`reconcile`操作时添加了一个`fiberNode.deletions`数组，`Mutation`阶段将遍历这个数组，并执行`commitDeletionEffects()`方法删除DOM元素

  > 完整逻辑比较复杂，删除DOM元素还需要考虑很多逻辑
  >
  > - 子树中所有组件的unmount逻辑
  > - 子树中所有ref属性的卸载操作
  > - 子树所有Effect相关Hook（比如useLauoutEffects回调）的执行

- **插入、移动DOM元素**

```ts
function recursivelyTraverseMutationEffects(
  root: FiberRoot,
  parentFiber: Fiber,
  lanes: Lanes,
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

对于不同的`fiberNode.tag`有不同的处理方法，以`HostComponent`的`Placement`举例：

> 这里先介绍两个函数
>
> getHostParentFiber()
>
> 从当前fiberNode向上遍历，获取第一个类型为HostComponent、HostRoot、HostPortal三者之一的祖先fiberNode，其对应DOM元素是"执行DOM操作的目标元素的父级DOM元素"
>
> getHostSibling()
>
> 向上寻找需要insertBefore(node, before)函数需要的before节点

对于每一个节点，先调用`getHostParentFiber()`获取父级DOM元素，再调用`getHostSibling()`获取最低层级的无`Placement flag`的真实DOM元素

接下来的行为很简单，调用`insertOrAppendPlacementNode(finishedWork, before, parent)`

`Mount`场景：

- 如果`before`节点存在，则将目标DOM元素插入`before`之前
- 如果`before`节点不存在，则将目标DOM元素作为父DOM的最后一个元素插入

`Update`场景：

- 如果`before`节点存在，则将目标DOM元素移至`before`之前

- 如果`before`节点不存在，则将目标DOM元素移至同级最后

- 更新DOM元素

  > 书上写执行DOM元素更新是在commitWork()中，实际在18.2.0源码中更新部分内联在commitMutationEffectOnFiber里，最终执行的commitUpdate()为更新操作

  在`render`阶段的`completeWork`中，所有"变化属性的`[key, value]`"会保存在`fiberNode.updateQueue`，最终在`commitUpdate`中调用

  - `updateProperty`——不存在`updatePayload/updateQueue`
  - `updatePropertiesWithDiff`——存在`updatePayload/updateQueue`

  遍历并改变对于属性：

  - style属性变化
  - innerHTML
  - 直接文本节点的变化
  - 其他元素属性

## Layout

> Answer-1(3)
>
> OffscreenComponent的显隐逻辑

> 在18.2.0源码中同样不存在commitLayoutEffects_begin()和commitLayoutEffects_complete()，都是在commitLayoutEffects()中直接调用commitLayoutEffectsOnFiber()

对于不同的`fiberNode.tag`有不同的处理方法：

- 对于`OffscreenComponen`t，执行`OffscreenComponent`的显隐操作
- 对于`ClassComponent`，执行`componentDidMount/Update`方法
- 对于`FC`，执行`useLayoutEffect`的`callback`

`HostComponent`类型的`fiberNode.updateQueue`最终会在`Mutation`阶段处理，但除了`HostComponent`类型外，其他类型`fiberNode`也存在`updateQueue`

- `ClassComponent`：`this.setState(dispatch, callback)`中的`callback`
- `HostRoot`：执行`React.DOM.render(element, container, callback)`中的`callback`

这两种情况下产生的`callback`会在`commitLayoutEffectOnFiber`中执行



