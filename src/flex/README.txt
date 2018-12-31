# Flex Layout

## Basic process

The render tree contains multiple independent flex layout trees, consisting out of nested flex containers.
Layout can be performed independently on these.

Every flex container that in itself is not a flex item (or a disabled flex item) is a flex tree root.
Every flex container that is a flex item itself is not a flex tree root.

A layout operation is always done on a complete flex layout tree, starting at the flex tree root.

The basic layout process involves:
- Performing layout on all child items.
- Layouting the main axis, positioning and resizing the items.
- Layouting the cross axis, positioning and resizing the items.

Resizing the sub items may re-layout the complete item recursively.

## Optimization

Instead of naively performing complete re-layout every frame, we try to minimize work where possible, reusing results from the previous flex tree's layout where possible.

The basic idea is that, when a flex tree branch contains no changes since the last layout, the previous layout result could be reused. Usually, there are many branches that, by itself, don't have changes.

But due to the nature of flex layout, those 'unchanged' branches may still be affected when they need to be shrunk, grown or stretched by the parent flex container. The idea behind this optimization is to keep an array of the resizing operations on a container as performed during the previous layout, and check if they are identical to the newly seen resize operations. If they match, we can reuse the previously calculated layout positions/sizes, not only for the container but also for the *complete* branch!

### Data attributes needed for the optimization:

FlexContainer
- recalc : Number
  0 = no re-layout required, and none of the (flex layout tree) descendants have changes.
  1 = must be relayout, because itself or any descendant contains changes
- baseMainAxisSize : Number
  The main axis size after last 'clean' layout of this container (before applying any grow/shrink/stretch from the parent).
- baseCrossAxisSize : Number
  The cross axis size after last 'clean' layout of this container.
- resizeHistory: Number[]
  The history of applied resizeMainAxis / resizeCrossAxis operations caused by grow/shrink/stretch from ancestors. In case of resizeMainAxis, the crossAxisSize result from the subsequent cross axis layout is stored.
  The array contains only numbers for efficiency reasons. The operations are stored in tuples:
  - 0/1: 0 = main axis resize, 1 = cross axis resize
  - new size
  - [only in case of main axis resize: the new expected cross axis]
- resizeHistoryPointer: Number
  Used in the algorithm to keep track of the current resize step that should be compared (more details later).

### Flex Container Layout Recursive Algorithm

Implemented in FlexLayout._layout().

#### Layout phase

If the recalc flag is at 0, then subtree layout can be completely skipped (at least for now).
The resizeHistoryPointer must be set to 0.

If the recalc flag is > 0, then:
First, all children are re-layout (child._layout()) (container flex items) or reset to initial values (leaf flex items).
Perform layout on main axis and cross axis. This may cause (main/cross) axis resizes on descendants, even resulting in re-layout of those branches. Set baseMainAxisSize and crossMainAxisSize.

##### resizeMainAxis/resizeCrossAxis(newSize)
If recalc is 1:
 Directly perform the operation itself.
 Add the new operation in the resizeHistory and increase the pointer.
If recalc is 0:
 Check if it matches the currently pointed-to operation.
 - If so, directly set the resulting value (and possibly cross axis as well), without re-layouting. Increase pointer.
 - If not so:
   - Perform layout after all, including any children (this._layout())
   - Re-apply all of the resize operations one by one, so that the children pointers are increased as they should.
   - set recalc to 1, so that next resize is performed directly.
   - Now redo resize as if recalc was 1.

#### Finalization
Finally, we should have a tree with recalced layout for everything marked 'recalc 1', directly followed by some 'recalc 0 branch' root containers (that are pointing after the final item in the resize history).

We now must:
- traverse the complete 'recalc' tree, resetting the 1 to 0. Update layout coords. Traverse to all children.
- when encountering a '0' item, we must check whether the resize history has been completely traversed:
  - If so, we don't have to do anything; only set the layout position (xy) The dimensions can't have changed so don't necessarily need to be applied. Stop traversing.
  - If not so, we may be dealing with a shrink/grow/stretch that occurred during the previous layout but not during this one (shrink disabled, root detached etc.). We cut back the resizeHistory to the current length. Then main/cross axis size is reset to baseMainAxisSize and crossMainAxisSize, and then all resize steps up to now. This makes the direct children step through them as well. The layout coords should be updated. Then, traverse the subtree as children/descendants must be rechecked and may even have the recalc flag now set.
- Cut the resizeHistory down to the current pointer if necessary.
- We reset the resizeHistoryPointer to 0.