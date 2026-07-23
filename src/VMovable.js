import { defineComponent, h, ref, watch } from 'vue';
import 'lit-movable';

/**
 * Props that must be assigned as DOM *properties* on <movable-el>, not attributes.
 * lit-movable implements these as setter functions (posLeft/posTop write target.style;
 * bounds parse from current position), and its boolean converters treat the string
 * "false" as falsy — so attribute binding would be wrong. Property binding is required.
 */
const PROPERTY_PROPS = [
  'posLeft',
  'posTop',
  'boundsX',
  'boundsY',
  'axis',
  'grid',
  'disabled',
  'shiftBehavior',
  'eventsOnly',
  'targetSelector',
  'dragAfterDist',
];

// <movable-el> is an inline custom element whose shadow <slot> generates no box,
// so the engine's shadow-root pointerdown only fires when the pointer hits real
// (sized) content. Guarantee a hit area: the host gets display:block, and default
// content is wrapped in a block box that fills the host. Consumers still control
// size/position via their own class/style (merged after these base styles).
const CONTENT_CLASS = 'v-movable-content';

export const VMovable = defineComponent({
  name: 'VMovable',
  inheritAttrs: false,
  props: {
    left: { type: Number, default: undefined },
    top: { type: Number, default: undefined },
    grid: { type: Number, default: undefined },
    boundsX: { type: String, default: undefined },
    boundsY: { type: String, default: undefined },
    axis: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    shiftBehavior: { type: Boolean, default: false },
    eventsOnly: { type: Boolean, default: false },
    targetSelector: { type: String, default: undefined },
    dragAfterDist: { type: Number, default: undefined },
  },
  emits: ['update:left', 'update:top', 'movestart', 'move', 'moveend'],
  setup(props, { emit, attrs, slots }) {
    const el = ref(null);
    // During an active gesture lit-movable owns the target position. Emitting
    // update:left/top would feed the same value back down through pos* and
    // conflict with the engine's drag math, so v-model is emit-only mid-drag.
    let dragging = false;

    const setProp = (name, value) => {
      if (el.value && value !== undefined) {
        el.value[name] = value;
      }
    };

    watch(
      () => props.left,
      (v) => {
        if (!dragging) setProp('posLeft', v);
      }
    );
    watch(
      () => props.top,
      (v) => {
        if (!dragging) setProp('posTop', v);
      }
    );

    const onMoveStart = (e) => {
      dragging = true;
      emit('movestart', e.detail);
    };
    const onMove = (e) => {
      const s = e.detail;
      emit('update:left', s.posLeft);
      emit('update:top', s.posTop);
      emit('move', s);
    };
    const onMoveEnd = (e) => {
      dragging = false;
      emit('moveend', e.detail);
    };

    return () => {
      const propBindings = {
        posLeft: props.left,
        posTop: props.top,
        grid: props.grid,
        boundsX: props.boundsX,
        boundsY: props.boundsY,
        axis: props.axis,
        disabled: props.disabled,
        shiftBehavior: props.shiftBehavior,
        eventsOnly: props.eventsOnly,
        targetSelector: props.targetSelector,
        dragAfterDist: props.dragAfterDist,
      };

      // Force DOM-property assignment (".prop") instead of attribute binding.
      const elProps = { ref: el };
      for (const name of PROPERTY_PROPS) {
        const value = propBindings[name];
        if (value !== undefined) elProps[`.${name}`] = value;
      }

      // Forward arbitrary attrs (class, style, data-*, aria-*) as attributes.
      for (const [key, value] of Object.entries(attrs)) {
        if (!(key in elProps)) elProps[key] = value;
      }

      // Base structural box so the host hit-tests. Self-movers need an absolute
      // box; but with an external targetSelector the host is just a handle wrapper
      // inside another element — keep it in flow (block) so it stacks/paints in
      // its container instead of creating an out-of-flow layer. Consumer style
      // (attrs.style) is merged after and can override.
      const baseStyle = props.targetSelector
        ? 'display:block;'
        : 'display:block;position:absolute;';
      elProps.style = elProps.style ? `${baseStyle}${elProps.style}` : baseStyle;

      elProps.onMovestart = onMoveStart;
      elProps.onMove = onMove;
      elProps.onMoveend = onMoveEnd;

      // Forward the named `handle` slot to the web component's `slot="handle"`.
      const children = [];
      if (slots.handle) {
        const handleVNodes = slots.handle();
        handleVNodes.forEach((vnode) => {
          vnode.props = { ...(vnode.props || {}), slot: 'handle' };
        });
        children.push(...handleVNodes);
      }
      // Always render the content box so the host has a hit area even with no
      // default slot content; the engine's shadow pointerdown needs a box inside.
      children.push(
        h(
          'div',
          { class: CONTENT_CLASS, style: 'display:block;width:100%;height:100%;' },
          slots.default ? slots.default() : []
        )
      );

      return h('movable-el', elProps, children);
    };
  },
});

export default VMovable;
