import { VMovable } from './VMovable.js';

export { VMovable };

// Default plugin: app.use(VMovable) registers <v-movable> globally.
export default {
  install(app) {
    app.component('v-movable', VMovable);
  },
};
