# v-movable

## Installation
npm install --save v-movable;


### Usage
`<movable/>`

### Options (as attributes)
- className: (css classes space delimited)
- tagname: (div, span, etc)
- posTop/posLeft: initial coordinate
- onstart: handler
- onmove: handler
- oncomplete: handler
- target: a vue ref for an element other than the component (e.g., wrap modal title in movable, and set target to the modal-body element ref)
- bounds: an object with x and y props. Both x and y default to [-Infinity,Infinity]. Set to [min,max] ([0,0] to restrict the axis)
- grid: defaults to 1. snap to grid size in pixels.

### Disclaimer
This is in alpha.