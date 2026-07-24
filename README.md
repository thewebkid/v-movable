# v-movable [![npm version](https://badge.fury.io/js/v-movable.svg)](https://badge.fury.io/js/v-movable) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A **Vue 3** component that makes any element movable — drag, snap to a grid, clamp to bounds, lock an axis, and read back rich move state. It wraps the [`lit-movable`](https://github.com/thewebkid/lit-movable) web component under the hood, so you get a battle-tested engine with a clean, idiomatic Vue API.

You only ever write `<v-movable>`. The custom element is registered for you — no Lit, no `isCustomElement` config, no extra setup in your app.

**[Live Demo](https://www.thewebkid.com/modules/v-movable)**

## Installation

```bash
npm i v-movable
```

`vue@^3` is a peer dependency. `lit-movable` is a regular dependency (installed automatically).

### Register globally

```js
// main.js
import { createApp } from 'vue';
import VMovable from 'v-movable';
import App from './App.vue';

createApp(App).use(VMovable).mount('#app');
// <v-movable> is now available everywhere
```

### Or import locally

```vue
<script setup>
import { VMovable } from 'v-movable';
</script>
```

## Basic usage

```vue
<template>
  <v-movable class="box" :left="40" :top="40">
    <span>drag me</span>
  </v-movable>
</template>

<style>
.box { width: 120px; height: 120px; background: #333; color: #fff; }
</style>
```

The component positions itself absolutely (`display:block; position:absolute` is applied to the host). Give it a size with your own class/style.

## Two-way coordinates with `v-model`

```vue
<script setup>
import { ref } from 'vue';
const x = ref(50);
const y = ref(40);
</script>

<template>
  <v-movable v-model:left="x" v-model:top="y" class="box">
    <span>{{ Math.round(x) }}, {{ Math.round(y) }}</span>
  </v-movable>
</template>
```

During an active drag the engine owns the position; `v-model` updates are emitted to you but not pushed back into the element mid-gesture (this avoids feedback against the drag math). Between gestures, setting `x` / `y` repositions the element.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `left` / `top` | Number | Initial / `v-model` coordinate (px). Set **before** `boundsX`/`boundsY` when both change in one update. |
| `grid` | Number | Snap increment in px (default `1`). |
| `boundsX` / `boundsY` | String | **Relative** `"min,max"` offsets from the current left/top. `"null"` locks that axis. See the bounds model below. |
| `axis` | `"x"` \| `"y"` | Lock the orthogonal axis to the current position. |
| `disabled` | Boolean | Disable dragging. |
| `shiftBehavior` | Boolean | With open bounds, holding **Shift** constrains to the dominant axis. |
| `eventsOnly` | Boolean | Fire events but do not reposition the target. |
| `targetSelector` | String | CSS selector for the element that moves (default: the `<v-movable>` host itself). |
| `dragAfterDist` | Number | Pointer travel (px) before a drag starts (default `0`). |

## Events

All events carry lit-movable's plain **move-state** object:

```
{ coords, startCoord, moveDist, totalDist, mouseCoord, clickOffset,
  posTop, posLeft, pctX, pctY, isMoving }
```

| Event | When |
| --- | --- |
| `@movestart` | Drag begins (after `dragAfterDist` is exceeded). |
| `@move` | Continuously while moving. |
| `@moveend` | Pointer released. |
| `@update:left` / `@update:top` | `v-model` coordinate updates during `@move`. |

```vue
<v-movable @movestart="onStart" @move="onMove" @moveend="onEnd" />
```

## Bounds model (read this)

`boundsX` / `boundsY` are **deltas from the element's current position**, not absolute `style.left`/`top` ranges:

```
absoluteMin = currentLeft + min
absoluteMax = currentLeft + max
```

So a knob already at `left: 85` that must stay inside `[0, 160]`:

```vue
<!-- WRONG — parses as [85, 245] -->
<v-movable :left="85" boundsX="0,160" />

<!-- RIGHT — deltas from 85 → absolute [0,160] -->
<v-movable :left="85" boundsX="-85,75" />
```

Recipe for "stay inside `[0, size]`" while at `(left, top)`:

```js
const boundsX = `${-left},${size - left}`;
const boundsY = `${-top},${size - top}`;
```

**Gotchas (inherited from lit-movable):**

1. **Set `left`/`top` before `boundsX`/`boundsY`** in the same render — bounds re-parse against the current position.
2. **Don't rewrite bounds on every `@move`.** The resolved range is absolute after first parse; re-applying a relative string mid-drag shifts the clamp. Sync bounds on `@movestart`/`@moveend`.
3. **`"null"` locks an axis** to its current coordinate (it is not "no bounds").

## Slots

- **default** — content (wrapped in a full-size box so the host always has a hit area).
- **`handle`** — optional drag handle. When present, only the handle starts a drag.

```vue
<v-movable>
  <template #handle><div class="titlebar">drag from here</div></template>
  <div>not grabbable</div>
</v-movable>
```

## Examples

### Move a parent (modal title)

```vue
<template>
  <div id="dialog" style="position:absolute;width:220px;border:1px solid #57c">
    <v-movable target-selector="#dialog">
      <template #handle><div class="titlebar">Title</div></template>
    </v-movable>
    <div class="body">Body is not a handle.</div>
  </div>
</template>
```

### Horizontal only

```vue
<v-movable axis="x" boundsX="-50,250"><div>Horizontal</div></v-movable>
<!-- equivalent -->
<v-movable boundsX="-50,250" boundsY="null"><div>Horizontal</div></v-movable>
```

### Grid + Shift

```vue
<v-movable :grid="50" shift-behavior><div>Snap 50px (hold Shift)</div></v-movable>
```

### Constrained box

Clamped to a 200×200 parent. At `(100,100)`, `"-100,100"` → absolute `[0,200]`.

```vue
<div style="position:relative;width:200px;height:200px;border:1px solid green">
  <v-movable :left="100" :top="100" boundsX="-100,100" boundsY="-100,100">
    <div>box</div>
  </v-movable>
</div>
```

## Migrating from 0.x (Vue 2)

| 0.x | 1.0 |
| --- | --- |
| `<movable>` (Vue 2, directive-based) | `<v-movable>` (Vue 3, wraps `lit-movable`) |
| `:bounds="{x:[min,max],y:[min,max]}"` | `boundsX="min,max"` / `boundsY="min,max"` (strings) |
| `vertical="[min,max]"` | `axis="y"` + `boundsY="min,max"` |
| `horizontal="[min,max]"` | `axis="x"` + `boundsX="min,max"` |
| `posTop` / `posLeft` props | `top` / `left` (with `v-model:top` / `v-model:left`) |
| `@start` / `@move` / `@complete` | `@movestart` / `@move` / `@moveend` |
| `shiftKey` | `shift-behavior` |
| `target` (Vue ref name) | `target-selector` (CSS selector) |

The package name stays **`v-movable`**. The build is now Vite (bili is gone).

## Local development

```bash
git clone https://github.com/thewebkid/v-movable.git
cd v-movable
npm i
npm run dev      # demo app
npm test         # web-test-runner (real browser drags)
npm run build    # vite lib build → dist/
```

## License

MIT
