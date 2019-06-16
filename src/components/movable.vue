<template>
  <component :is="tag" :move-disabled="disabled"
             :style="position"
             class="--movable-base" :class="cssClass"
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
      cssClass(){
        let obj = {};
        let c = this.className;
        if (typeof c==='object'){
          obj = c;
        }else if (typeof c==='string'){
          c.split(' ').forEach(cn=>obj[cn]=true);
        }
        if (this.isMoving){
          obj['is-moving']=true;
        }
        return obj;
      },
      px(){
        return v => `${v}px`;
      },
      position(){
        return this['events-only'] ? {}: {top:this.px(this.top),left:this.px(this.left)}
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
        let moveArgs = {
          reposition:this.reposition,
          directiveInit:this.directiveInit,
          eventBroker:this.eventBroker
        };
        const availArgs = ['bounds','onstart','oncomplete',
          'onmove', 'grid', 'vertical','horizontal','disabled','events-only'];
        availArgs.filter(a => vm[a] !== undefined)
          .forEach(prop => moveArgs[prop] = vm[prop]);
        if (this.target){
          if (this.target ==='parent'){
            moveArgs.target = vm.$el.parentElement;
          }else {
            moveArgs.target = vm.$parent.$refs[this.target];
          }
        }
        this.moveArgs = moveArgs;
      },
      eventBroker({name,args}){
        this.$emit(name, args);
      },
      directiveInit(rpcFn){
        this.rpcFunc = rpcFn
      },
      reposition(pos){
        if (typeof pos === 'object') {
          //console.log({pos});
          if (this.moveArgs.target && !this['events-only']) {
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
    props: ['tagName', 'target', 'bounds', 'onstart', 'oncomplete', 'onmove',
      'posTop', 'posLeft', 'className', 'grid', 'vertical','horizontal','disabled'],
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
