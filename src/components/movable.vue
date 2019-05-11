<template>
  <component :is="tag" :move-disabled="disabled"
             :style="{top:px(top),left:px(left)}"
             class="--movable-base" :class="className"
             v-movable="moveArgs">
    <slot></slot>
  </component>
</template>

<script>
  import Vue from 'vue';
  import '../directives/movable';

  export default {
    data: () => {
      return {
        tag:'div',
        top:0,
        left:0,
        moveArgs:{},
        isMoving:false,
        rpcFunc:function(){}
      };
    },
    computed:{
      px(){
        return v => `${v}px`;
      }
    },
    name: 'movable',
    methods:{
      init(){
        let vm = this;
        if (vm['tagName']){
          this.tag = this.tagName;
        }
        if (vm['posTop']){
          this.top = Number(this.posTop);
        }
        if (vm['posLeft']){
          this.left = Number(this.posLeft);
        }
        let moveArgs = { reposition:this.reposition, directiveInit:this.directiveInit };
        const availArgs = ['bounds','onstart','oncomplete',
          'onmove', 'grid', 'vertical','horizontal','disabled'];
        availArgs.filter(a => vm[a] !== undefined)
          .forEach(prop => moveArgs[prop] = vm[prop]);
        if (this.target){
          moveArgs.target = vm.$parent.$refs[this.target];
        }
        this.moveArgs = moveArgs;
      },
      directiveInit(rpcFn){
        this.rpcFunc = rpcFn
      },
      reposition(pos){
        if (typeof pos === 'object') {
          //console.log({pos});
          if (this.moveArgs.target) {
            this.moveArgs.target.style.left = pos.left + 'px';
            this.moveArgs.target.style.top = pos.top + 'px';
            return;
          }
          this.top = pos.top;
          this.left = pos.left;
        }
        else{
          this.isMoving = pos;
        }
      },
      parentPos(k,v){
        let vm = this;
        if (vm.isMoving){
          return;
        }
        Vue.nextTick().then(()=>{
          vm[k] = Number(v);
        });
      }
    },
    props: ['tagName', 'target', 'bounds',
      'onstart', 'oncomplete', 'onmove',
      'posTop', 'posLeft', 'className',
      'grid', 'vertical','horizontal','disabled'],
    mounted(mnt){
      this.init();
    },
    watch:{
      posTop(pt){
        this.parentPos('top',pt);
      },
      disabled(disable){
        this.moveArgs.disabled = true;
        this.rpcFunc({disable:true})
      },
      posLeft(pl){
        this.parentPos('left',pl);
      }
    }
  };
</script>
<style scoped>
  .--movable-base{
    position:absolute;
    cursor:pointer;
  }
</style>