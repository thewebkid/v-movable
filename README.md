# v-movable
A vue component or component wrapper that makes an element movable and its movements can be customized.

## Installation
`npm install --save v-movable;`

### Initialize in main.js
`import movable from "v-movable";`

`Vue.use(movable);`




### Options (element attributes)
- **className**: _String_ - css classes space delimited 
- **tagName**: _String_ - div, span, etc. [not functional yet]
- **posTop/posLeft**: initial coordinate
- **onstart**: _handler_ - fires immediately after the pointerdown event on the element
- **onmove**: _handler_ - fires continuously while moving
- **oncomplete**: _handler_ - fires after the pointerup event on the element 
- **target**: _String (vue ref)_ - ref to element other than the component (e.g., wrap modal title in movable, and set target to the modal-body element ref)
- **bounds**: _{x:[min,max],y:[min,max]_}. Both x and y default to [-Infinity,Infinity]. Set to [min,max] ([0,0] to restrict the axis)
- **vertical**: _[min, max]_ - constrain movement to y axis within min and max provided. Shorthand for bounds="{x:[0,0],y:[min,max]}"
- **vertical**: _[min, max]_ - constrain movement to x axis within min and max provided. Shorthand for bounds="{y:[0,0],x:[min,max]}" 
- **grid**: _Int_ - defaults to 1. snap to grid size in pixels.

### Events (prefer over attrib handlers above)
- **@start**: fires immediately after the pointerdown event on the element
- **@move**: fires continuously while moving
- **@complete**: fires after the pointerup event on the element 

### Usage

    <template>
      <div>
         <movable/>
         <div class="testmove" ref="someTarget">
           <movable class="modaltitle" target="someTarget">modal behavior</movable>`
           <span>not movable</span>
         </div>
         <movable class="testmove" posTop="444" :grid="20"><span>grid:20</span></movable>
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


### Disclaimer
This is in alpha. I have bugs.