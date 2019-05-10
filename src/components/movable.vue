<template>
  <component :is="tag" :style="{top:px(top),left:px(left)}" class="v-movable" :class="className" v-movable="moveArgs"><slot></slot></component>
</template>

<script>
  import '../directives/movable';

  export default {
    data: () => {
      return {
        tag:'div',
        top:0,
        left:0,
        moveArgs:{}
      };
    },
    computed:{
      px(){
        return v => `${v}px`;
      }
    },
    name: 'movable',
    methods:{
      reposition(pos){
        //console.log({pos});
        if (this.moveArgs.target){
          this.moveArgs.target.style.left = pos.left + 'px';
          this.moveArgs.target.style.top = pos.top + 'px';
          return;
        }
        this.top = pos.top;
        this.left = pos.left;
      }
    },
    props: ['tagName', 'target', 'bounds', 'onstart', 'oncomplete', 'onmove', 'posTop', 'posLeft', 'className','grid'],
    mounted(){
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
      let moveArgs = {reposition:this.reposition };
      ['bounds','onstart','oncomplete','onmove','grid'].forEach(prop => {
        if (vm[prop]){
          moveArgs[prop] = vm[prop];
        }
      });
      if (this.target){
        moveArgs.target = vm.$parent.$refs[this.target];
      }
      this.moveArgs = moveArgs;
    }
  };
</script>
<style scoped>
  .v-movable{
    position:absolute;
  }
</style>