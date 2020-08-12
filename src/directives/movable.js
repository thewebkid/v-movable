import Vue from 'vue';

let shift = false;

//region utils
const pxVal = v => isFinite(v) ? Number(v) : Number(v.replace(/[^0-9.\-]/g,''));
const childOf = (pid, child) => {
  while(child.getAttribute('moveid') !== pid){
    child = child.parentElement;
    if (!child || child.tagName === 'BODY'){
      return false;
    }
  }
  return true;
};

const getClickOffset = event => {
  const coords = { x: event.pageX, y: event.pageY };
  const off = event.target.getBoundingClientRect();
  return {
    x: coords.x - (off.left + document.body.scrollLeft),
    y: coords.y - (off.top + document.body.scrollTop)
  };
};

const guid = ()=> 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  const r = Math.random() * 16 | 0;
  const v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});
//endregion

Vue.directive('movable',{
  update(el,binding){

    if (el.getAttribute('moveid')){
      return;//don't continuously rebind
    }

    let args = binding.value;
    if (!!args.disabled){
      return;
    }
    let shiftBehavior = !!args.shiftKey;
    let grid = args.grid || 1;
    let bounds = args.bounds || null;
    const directionalBounds = v => Array.isArray(v) ? v : !isNaN(Number(v)) ?
      [Math.min(0,Number(v)), Math.max(0,Number(v))] : [-Infinity, Infinity];
    if (args.vertical){
      bounds = {
        x:[0,0],
        y:directionalBounds(args.vertical)
      }
    } else if (args.horizontal){
      bounds = {
        y:[0,0],
        x:directionalBounds(args.horizontal)
      }
    }
    let actualBounds = { left: null, top: null };
    let target = args.target || el;
    target.style.touchAction = 'none';
    let moveId = guid();
    let targetId = 'target' + moveId;
    target.setAttribute('moveid',targetId);
    el.setAttribute('moveid', moveId);

    let onstart = args.onstart;
    let onmove = args.onmove;
    let oncomplete = args.oncomplete;
    let moveObj = {};
    let isMoving;
    let pointerId;
    const pointerEvents = window.MSPointerEvent ?
        { start:'MSPointerDown',move:'MSPointerMove',end:'MSPointerUp'} : //IE, grr
      window.PointerEvent ?
        { start:'pointerdown',move:'pointermove',end:'pointerup'} ://most everyone
      'ontouchstart' in document.documentElement ?
        { start:'touchstart',move:'touchmove',end:'touchend'} :
        { start:'mousedown',move:'mousemove',end:'mouseup'};//safari. grr
    const init = () => {
      setBounds();
      const halt=etarget=>
        etarget.getAttribute('move-disabled') || etarget.getAttribute('moveid') === targetId || !childOf(moveId, etarget) || isMoving;

      if (window.PointerEvent || window.MSPointerEvent) {
        document.body.addEventListener(pointerEvents.start, (event) => {
          if (halt(event.target)) {
            return;
          }
          document.body.setPointerCapture(event.pointerId);
          event.preventDefault();
          event.stopPropagation();
          if (event.pointerId !== undefined) {
            pointerId = event.pointerId;
          }
          moveInit(event);
          document.body.addEventListener(pointerEvents.end, unbind, false);
          document.body.addEventListener(pointerEvents.move, function (evt) {
            if (pointerId !== undefined && evt.pointerId === pointerId) {
              motionHandler(evt);
            }
          }, false);
        }, false);
      }
      else {
        const start = (event)=> {
          if (halt(event.target)) {
            return;
          }
          event.preventDefault();
          event.stopImmediatePropagation();
          moveInit(event);
          document.body.addEventListener(pointerEvents.end, unbind, false);
          document.body.addEventListener(pointerEvents.move, motionHandler, false);
        };
        target.addEventListener(pointerEvents.start,  start, false)
      }
    };

    function setBounds(newBounds) {
      bounds = newBounds || bounds;
      if (!bounds) {
        actualBounds.left = [0 - Infinity, Infinity];
        actualBounds.top = [0 - Infinity, Infinity];
        return;
      }
      let css = {
        left: pxVal(target.style.left) || 0,
        top: pxVal(target.style.top) || 0
      };
      if (bounds.x) {
        actualBounds.left = [css.left + bounds.x[0], css.left + bounds.x[1]];
      } else {
        actualBounds.left = [0 - Infinity, Infinity];
      }
      if (bounds.y) {
        actualBounds.top = [css.top + bounds.y[0], css.top + bounds.y[1]];
      } else {
        actualBounds.top = [0 - Infinity, Infinity];
      }
    }
    //#endregion


    //#region event handlers
    const moveInit = event => {
      moveObj.mouseCoord = getCoord(event);
      moveObj.startCoord = { x: pxVal(target.style.left), y: pxVal(target.style.top) };
      if (isNaN(moveObj.startCoord.x)) moveObj.startCoord.x = 0;
      if (isNaN(moveObj.startCoord.y)) moveObj.startCoord.y = 0;
      moveObj.moveDist = { x: 0, y: 0 };
      moveObj.totalDist = { x: 0, y: 0 };
      moveObj.clickOffset = getClickOffset(event);
      moveObj.css = { top: moveObj.startCoord.y, left: moveObj.startCoord.x };
      moveObj.maxX = actualBounds.left[0] + actualBounds.left[1];
      moveObj.maxY = actualBounds.top[0] + actualBounds.top[1];
      isMoving = true;
      args.reposition(true);
      args.eventBroker({name:'start',args:moveObj});
      if (onstart) {
        onstart(moveObj);
      }
    };

    const motionHandler = function (evt) {
      evt.stopPropagation();

      let newCoord = getCoord(evt);
      moveObj.moveDist = {
        x: newCoord.x - moveObj.mouseCoord.x,
        y: newCoord.y - moveObj.mouseCoord.y
      };
      moveObj.mouseCoord = newCoord;

      moveObj.totalDist = {
        x: moveObj.totalDist.x + moveObj.moveDist.x,
        y: moveObj.totalDist.y + moveObj.moveDist.y
      };
      moveObj.css.top = moveObj.totalDist.y;
      moveObj.css.left = moveObj.totalDist.x;
      moveObj.gridCss = {
        left: (Math.round(moveObj.totalDist.x / grid) * grid) + moveObj.startCoord.x,
        top: (Math.round(moveObj.totalDist.y / grid) * grid) + moveObj.startCoord.y
      };
      moveObj.css = moveObj.gridCss;
      const isInfinite = bounds => bounds === undefined || (Array.isArray(bounds) && bounds[0]<-99999 && bounds[1] > 99999);
      if (shiftBehavior && evt.shiftKey && (bounds === null || isInfinite(bounds.x) && isInfinite(bounds.y))){
        let {x,y} = moveObj.totalDist;
        if (Math.abs(x) > Math.abs(y)){
          moveObj.css.top = moveObj.startCoord.y;
        }else{
          moveObj.css.left = moveObj.startCoord.x;
        }
      }else {
        moveObj.css.top = Math.min(Math.max(actualBounds.top[0], moveObj.css.top), actualBounds.top[1]);
        moveObj.css.left = Math.min(Math.max(actualBounds.left[0], moveObj.css.left), actualBounds.left[1]);
      }
      moveObj.pctX = Math.max(actualBounds.left[0], moveObj.css.left) / moveObj.maxX;
      moveObj.pctY = Math.max(actualBounds.top[0], moveObj.css.top) / moveObj.maxY;
      args.reposition(moveObj.css);

      if (onmove) {
        onmove(moveObj);
      }
      args.eventBroker({name:'move',args:moveObj});
    };

    const unbind = (evt) => {
      pointerId = null;
      isMoving = false;
      document.body.removeEventListener(pointerEvents.move, motionHandler);
      moveEnd(evt);
    };

    const moveEnd = (event) => {
      document.body.removeEventListener(pointerEvents.end, unbind);
      if (oncomplete)
        oncomplete(moveObj);
      isMoving = moveObj.isMoving = false;
      args.reposition(false);
      args.eventBroker({name:'complete',args:moveObj});
      if (event) {
        event.preventDefault();
      }
    };
    //#endregion

    const getCoord =  (evt) => {
      let coord = {};
      coord.x = evt.pageX;
      coord.y = evt.pageY;
      return coord;
    };

    const rpcCall = (action,arg) => {
      console.log({rpc:{action,arg}})
      if (action === 'shift'){
        shift=arg;
      }
    };

    init();

    args.directiveInit(rpcCall);
  }
});
