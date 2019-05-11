<template>
  <div id="app">
    <div class="testmove" ref="someTarget">
      <movable class="modaltitle" target="someTarget">modal behavior</movable>
      <span>not movable</span>
    </div>
    <movable class="testmove" posTop="444" :grid="20"><span>grid:20</span></movable>
    <movable class="testmove" posLeft="444" :bounds="{x:[0,0]}"><span>bounds:only y</span></movable>
    <movable class="testmove" posTop="444" posLeft="444" :bounds="{y:[0,0]}"><span>bounds:only x</span></movable>
  </div>
</template>

<script>
  import movable from './components/movable';
  export default {
    name: 'app',
    components:{movable}
  }
</script>

<style>
  body{
    padding:0;
    margin:0;
    font-family: Helvetica,Arial;
  }
  .movable{
    cursor: pointer;
  }
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
