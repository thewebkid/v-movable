import { defineComponent as h, ref as m, watch as c, h as v } from "vue";
import "lit-movable";
const S = [
  "posLeft",
  "posTop",
  "boundsX",
  "boundsY",
  "axis",
  "grid",
  "disabled",
  "shiftBehavior",
  "eventsOnly",
  "targetSelector",
  "dragAfterDist"
], B = "v-movable-content", M = h({
  name: "VMovable",
  inheritAttrs: !1,
  props: {
    left: { type: Number, default: void 0 },
    top: { type: Number, default: void 0 },
    grid: { type: Number, default: void 0 },
    boundsX: { type: String, default: void 0 },
    boundsY: { type: String, default: void 0 },
    axis: { type: String, default: void 0 },
    disabled: { type: Boolean, default: !1 },
    shiftBehavior: { type: Boolean, default: !1 },
    eventsOnly: { type: Boolean, default: !1 },
    targetSelector: { type: String, default: void 0 },
    dragAfterDist: { type: Number, default: void 0 }
  },
  emits: ["update:left", "update:top", "movestart", "move", "moveend"],
  setup(t, { emit: a, attrs: p, slots: l }) {
    const i = m(null);
    let s = !1;
    const u = (n, e) => {
      i.value && e !== void 0 && (i.value[n] = e);
    };
    c(
      () => t.left,
      (n) => {
        s || u("posLeft", n);
      }
    ), c(
      () => t.top,
      (n) => {
        s || u("posTop", n);
      }
    );
    const b = (n) => {
      s = !0, a("movestart", n.detail);
    }, y = (n) => {
      const e = n.detail;
      a("update:left", e.posLeft), a("update:top", e.posTop), a("move", e);
    }, g = (n) => {
      s = !1, a("moveend", n.detail);
    };
    return () => {
      const n = {
        posLeft: t.left,
        posTop: t.top,
        grid: t.grid,
        boundsX: t.boundsX,
        boundsY: t.boundsY,
        axis: t.axis,
        disabled: t.disabled,
        shiftBehavior: t.shiftBehavior,
        eventsOnly: t.eventsOnly,
        targetSelector: t.targetSelector,
        dragAfterDist: t.dragAfterDist
      }, e = { ref: i };
      for (const o of S) {
        const d = n[o];
        d !== void 0 && (e[`.${o}`] = d);
      }
      for (const [o, d] of Object.entries(p))
        o in e || (e[o] = d);
      const r = t.targetSelector ? "display:block;" : "display:block;position:absolute;";
      e.style = e.style ? `${r}${e.style}` : r, e.onMovestart = b, e.onMove = y, e.onMoveend = g;
      const f = [];
      if (l.handle) {
        const o = l.handle();
        o.forEach((d) => {
          d.props = { ...d.props || {}, slot: "handle" };
        }), f.push(...o);
      }
      return f.push(
        v(
          "div",
          { class: B, style: "display:block;width:100%;height:100%;" },
          l.default ? l.default() : []
        )
      ), v("movable-el", e, f);
    };
  }
}), T = {
  install(t) {
    t.component("v-movable", M);
  }
};
export {
  M as VMovable,
  T as default
};
