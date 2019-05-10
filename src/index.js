import Vue from 'vue';
import movable from './components/movable.vue';
export default {
  install(Vue) {
    Vue.component("movable", movable);
  }
};