# v-movable [![npm version](https://badge.fury.io/js/v-movable.svg)](https://badge.fury.io/js/v-movable) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
A vue component or component wrapper that makes an element movable and its movements can be customized.

[Live Demo](http://thewebkid.com/modules/v-movable)

## Installation
    npm i --save v-movable

### Initialize in main.js
    import movable from "v-movable";
    Vue.use(movable);

### Options (element attributes)
- **posTop/posLeft**: initial coordinate
- **target**: _String (vue ref)_ - ref to element other than the component (e.g., wrap modal title in movable, and set target to the modal-body element ref)
- **bounds**: _{x:[min,max],y:[min,max]_}. Both x and y default to [-Infinity,Infinity]. Set to [min,max] ([0,0] to restrict the axis)
- **vertical**: _[min, max]_ - constrain movement to y axis within min and max provided. Shorthand for bounds="{x:[0,0],y:[min,max]}"
- **horizontal**: _[min, max]_ - constrain movement to x axis within min and max provided. Shorthand for bounds="{y:[0,0],x:[min,max]}"
- **grid**: _Int_ - defaults to 1. snap to grid size in pixels.
- **shiftKey** _Bool_ - any truthy value enables shift key to constrain movement to either x or y axis (whichever is greater). Setting any bounds option automatically disables shift key behavior.
- **disabled**: _Bool_ - disables moving

### Events
- **@start**: fires immediately after the pointerdown event on the element
- **@move**: fires continuously while moving
- **@complete**: fires after the pointerup event on the element

### Usage
```html
    <template>
      <div style="position:relative; margin:50px;">
         <div class="testmove" ref="parentEl">
           <movable class="modaltitle" target="parentEl">modal behavior</movable>`
           <span>not movable</span>
         </div>
         <movable class="testmove" posTop="444" :grid="20"><span>grid:20</span></movable>
         <movable class="testmove" posTop="222" posLeft="222" shiftKey="true"><span>Shift Key Behavior</span></movable>
         <movable class="testmove" posLeft="444" :bounds="{x:[0,0]}"><span>bounds:only y</span></movable>
         <movable class="testmove" posTop="444" posLeft="444" :bounds="{y:[0,0]}"><span>bounds:only x</span></movable>
       </div>
    </template>
    <style>
      .testmove {
        display:block;
        position: absolute;
        top: 0;
        height: 150px;
        width: 150px;
        margin: 200px;
        background: #333;
        color: white;
      }
      .modaltitle {
        background: blue;
        display:block;
        width:100%;
        color: white;
      }
    </style>
```


