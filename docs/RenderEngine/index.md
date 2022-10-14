# Render Engine


The most important Lightning component is the *WebGL 2d Render Engine*. Its purpose is to convert the defined and changed [Render Tree](RenderTree.md) to a series of WebGL commands as fast as possible.


Lightning subscribes to `requestAnimationFrame` for drawing the Render Tree frame. The actions that are executed, are:

1. [Locate Updated Branches](#Locate-Updated-Branches)
2. [Populate Coordinate Buffers](#Populate-Coordinate-Buffers)
3. [Draw Textures](#Draw-Textures)

## Locate Updated Branches


Generally, if the Render Tree has changed since the last frame was rendered, the changed branches are *immediately* tagged as `hasUpdates`.


Drawing a frame starts with executing the following actions:

1. Traverse the *updated* branches
2. Recalculate the render coordinates
of these branches
3. Skip the branches without updates


This workflow prevents a slow creation of large applications with many sections.


Other Lightning features that contribute to a good rendering performance, are:

* No rendering of invisible parts
(see [Rendering](Elements/Rendering.md) for details)
* Detection of out-of-screen branches, which enables the creation of (nearly) infinite, high-performance scrolling lists
* No re-rendering when no changes are detected, which almost 'nullifies' resource usage and power consumption

## Populate Coordinate Buffers


This step involves the following actions:

1. Traverse all visible and on-screen branches
2. Gather the textures to be drawn (including their coordinates)
3. Upload these textures to the GPU in a memory buffer

## Draw Textures


Finally, the textures are drawn using WebGL commands.


The result is an updated canvas filled with the current state of
the Render Tree.