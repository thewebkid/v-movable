<script setup>
import { reactive, computed } from 'vue';
import { VMovable } from './index.js';

// --- v-model demo state ---
const vm = reactive({ x: 60, y: 60 });

// --- color-knob demo state (reactive bounds pattern) ---
const canvas = 180;
const knob = reactive({ left: 120, top: 70, dragging: false, frozenX: '', frozenY: '' });
const knobBoundsX = computed(() => `${-knob.left},${canvas - knob.left}`);
const knobBoundsY = computed(() => `${-knob.top},${canvas - knob.top}`);
const hue = computed(() => Math.round((knob.left / canvas) * 360));
const sat = computed(() => Math.round(100 - (knob.top / canvas) * 100));
const freeze = () => {
  knob.dragging = true;
  knob.frozenX = knobBoundsX.value;
  knob.frozenY = knobBoundsY.value;
};
const unfreeze = () => (knob.dragging = false);
</script>

<template>
  <header class="hero">
    <div class="hero-inner">
      <h1><span class="tag">&lt;v-movable&gt;</span></h1>
      <p class="lede">
        A Vue 3 component for dragging anything — snap to a grid, clamp to bounds,
        lock an axis, and read back rich move state. Powered by
        <a href="https://github.com/thewebkid/lit-movable">lit-movable</a> under the hood.
      </p>
      <div class="install"><code>npm i v-movable</code></div>
    </div>
  </header>

  <main class="wrap">
    <!-- ───────────────────────── 1. FREE MOVE ───────────────────────── -->
    <section class="card">
      <div class="demo">
        <div class="stage">
          <v-movable class="chip blue" :left="20" :top="20">
            <span>drag me anywhere</span>
          </v-movable>
        </div>
      </div>
      <div class="docs">
        <h3>Free move</h3>
        <p>The simplest case — no props, just a starting position. Any attr you
          don't set stays wide open.</p>
        <pre><code>&lt;v-movable :left="20" :top="20"&gt;
  &lt;span&gt;drag me anywhere&lt;/span&gt;
&lt;/v-movable&gt;</code></pre>
      </div>
    </section>

    <!-- ───────────────────────── 2. AXIS LOCK ───────────────────────── -->
    <section class="card">
      <div class="demo">
        <div class="stage">
          <v-movable class="chip blue" axis="x" :left="20" :top="60" bounds-x="-20,240">
            <span>axis="x"</span>
          </v-movable>
        </div>
      </div>
      <div class="docs">
        <h3>Lock an axis</h3>
        <p><code>axis="x"</code> pins the other axis. <code>bounds-x</code> is a
          <em>relative</em> range from the current left: at <code>left:20</code>,
          <code>"-20,240"</code> clamps to <code>[0,260]</code>.</p>
        <pre><code>&lt;v-movable axis="x" :left="20" bounds-x="-20,240"&gt;
  &lt;span&gt;axis="x"&lt;/span&gt;
&lt;/v-movable&gt;</code></pre>
      </div>
    </section>

    <!-- ───────────────────────── 3. GRID + SHIFT ───────────────────────── -->
    <section class="card">
      <div class="demo">
        <div class="stage grid-bg">
          <v-movable class="chip purple" :grid="25" shift-behavior :left="0" :top="0">
            <span>grid 25<br /><small>hold Shift</small></span>
          </v-movable>
        </div>
      </div>
      <div class="docs">
        <h3>Snap to a grid</h3>
        <p><code>:grid="25"</code> snaps movement to 25px steps.
          <code>shift-behavior</code> constrains to the dominant axis while Shift is held
          (only with open bounds).</p>
        <pre><code>&lt;v-movable :grid="25" shift-behavior&gt;
  &lt;span&gt;grid 25&lt;/span&gt;
&lt;/v-movable&gt;</code></pre>
      </div>
    </section>

    <!-- ───────────────────────── 4. HANDLE / TARGET ───────────────────────── -->
    <section class="card">
      <div class="demo">
        <div class="stage">
          <div id="dlg" class="dialog">
            <v-movable target-selector="#dlg" class="dlg-titlewrap">
              <template #handle>
                <div class="dlg-title"><span class="grip">⠿</span> Dialog title</div>
              </template>
            </v-movable>
            <div class="dlg-body">Drag the title to move the dialog box.</div>
            <div class="dlg-foot">
              <button class="btn ghost" type="button">Cancel</button>
              <button class="btn solid" type="button">Save</button>
            </div>
          </div>
        </div>
      </div>
      <div class="docs">
        <h3>Move a different target</h3>
        <p><code>target-selector</code> moves an external element while the
          <code>#handle</code> slot is the only grabbable part. Classic modal-title pattern.</p>
        <pre><code>&lt;div id="dlg"&gt;
  &lt;v-movable target-selector="#dlg"&gt;
    &lt;template #handle&gt;&lt;div&gt;title&lt;/div&gt;&lt;/template&gt;
  &lt;/v-movable&gt;
  body
&lt;/div&gt;</code></pre>
      </div>
    </section>

    <!-- ───────────────────────── 5. V-MODEL ───────────────────────── -->
    <section class="card">
      <div class="demo">
        <div class="stage">
          <v-movable class="chip green" v-model:left="vm.x" v-model:top="vm.y" :grid="10">
            <span>v-model</span>
          </v-movable>
          <div class="readout">x: {{ Math.round(vm.x) }} · y: {{ Math.round(vm.y) }}</div>
        </div>
      </div>
      <div class="docs">
        <h3>Two-way <code>v-model</code></h3>
        <p>Bind <code>v-model:left</code> / <code>v-model:top</code> to track coordinates live.
          During a drag they're emit-only (the engine owns the position); between drags,
          setting them repositions the element.</p>
        <pre v-pre><code>&lt;v-movable v-model:left="x" v-model:top="y"&gt;
  &lt;span&gt;{{ x }}, {{ y }}&lt;/span&gt;
&lt;/v-movable&gt;</code></pre>
      </div>
    </section>

    <!-- ───────────────────────── 6. COLOR KNOB ───────────────────────── -->
    <section class="card">
      <div class="demo">
        <div class="stage">
          <div class="picker" :style="{ background: `hsl(${hue},80%,55%)` }">
            <v-movable
              :left="knob.left" :top="knob.top"
              :bounds-x="knob.dragging ? knob.frozenX : knobBoundsX"
              :bounds-y="knob.dragging ? knob.frozenY : knobBoundsY"
              @movestart="freeze" @moveend="unfreeze"
              v-model:left="knob.left" v-model:top="knob.top"
              class="knob-host">
              <div class="knob"></div>
            </v-movable>
          </div>
          <div class="readout">hsl({{ hue }} {{ sat }}% 55%)</div>
        </div>
      </div>
      <div class="docs">
        <h3>Reactive knob (color-picker)</h3>
        <p>The bounds pattern from the README: bounds stay inside the canvas
          (<code>${-left},${size-left}</code>) and are <em>frozen</em> during the gesture so the
          clamp can't drift. Drag the knob to change hue.</p>
        <pre v-pre><code>:bounds-x="dragging ? frozenX : `${-left},${size-left}`"
@movestart="freeze" @moveend="unfreeze"
v-model:left="left" v-model:top="top"</code></pre>
      </div>
    </section>
  </main>

  <footer class="foot">
    <p>
      <code>v-movable</code> · Vue 3 wrapper over
      <a href="https://github.com/thewebkid/lit-movable">lit-movable</a> · MIT
    </p>
  </footer>
</template>

<style>
:root {
  --ink: #1d2433;
  --muted: #5b6474;
  --line: #e6e8ef;
  --bg: #f6f7fb;
  --card: #ffffff;
  --blue: #4f7cff;
  --purple: #8b5cf6;
  --green: #16a34a;
  --mono: ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.55;
}
a { color: var(--blue); text-decoration: none; }
code { font-family: var(--mono); font-size: 0.9em; }

.hero {
  background: linear-gradient(160deg, #1d2433 0%, #2b3450 100%);
  color: #fff;
  padding: 56px 24px 48px;
}
.hero-inner { max-width: 1060px; margin: 0 auto; }
.hero h1 { margin: 0 0 12px; font-size: 44px; letter-spacing: -0.02em; }
.tag {
  font-family: var(--mono);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 6px 14px;
  border-radius: 12px;
}
.lede { max-width: 640px; color: #c4cbdd; font-size: 17px; margin: 0 0 20px; }
.lede a { color: #9db4ff; }
.install code {
  display: inline-block;
  background: #0d1117;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 10px 16px;
  border-radius: 8px;
  color: #7ee787;
  font-size: 15px;
}

.wrap {
  max-width: 1060px;
  margin: -28px auto 40px;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 6px 20px rgba(29, 36, 51, 0.06);
}
.demo {
  padding: 18px;
  background: linear-gradient(180deg, #fbfcfe, #f3f5fa);
  border-bottom: 1px solid var(--line);
}
.stage {
  position: relative;
  height: 220px;
  border-radius: 10px;
  background: #fff;
  border: 1px dashed #d3d9e6;
  overflow: hidden;
}
.grid-bg {
  background-image: radial-gradient(#dfe4ef 1px, transparent 1px);
  background-size: 25px 25px;
}
.docs { padding: 16px 18px 18px; }
.docs h3 { margin: 0 0 8px; font-size: 16px; }
.docs p { margin: 0 0 12px; color: var(--muted); font-size: 13.5px; }
.docs pre {
  margin: 0;
  background: #0f1522;
  color: #dbe4ff;
  padding: 12px 14px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
}
.docs pre code { font-family: var(--mono); color: inherit; }

.chip {
  width: 110px;
  height: 64px;
  border-radius: 10px;
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: grab;
  box-shadow: 0 4px 12px rgba(29, 36, 51, 0.18);
  user-select: none;
}
.chip:active { cursor: grabbing; }
.chip.blue { background: var(--blue); }
.chip.purple { background: var(--purple); }
.chip.green { background: var(--green); }
.chip small { opacity: 0.85; font-size: 11px; }

.dialog {
  position: absolute;
  left: 40px;
  top: 34px;
  width: 230px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 18px 48px rgba(29, 36, 51, 0.22), 0 2px 6px rgba(29, 36, 51, 0.1);
  overflow: hidden;
}
/* The <v-movable> host IS the titlebar — full-width, in-flow (the wrapper keeps
   handle-wrappers out of position:absolute when targetSelector is set). */
.dlg-titlewrap {
  display: block;
  width: 100%;
}
.dlg-title {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(160deg, #2b3450, #1d2433);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 12px 14px;
  cursor: grab;
  user-select: none;
}
.dlg-title:active { cursor: grabbing; }
.dlg-title .grip { opacity: 0.55; font-size: 11px; }
.dlg-body {
  padding: 16px 14px;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--muted);
}
.dlg-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 12px 12px;
}
.btn {
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 7px;
  border: 1px solid transparent;
  cursor: pointer;
}
.btn.ghost { background: #fff; border-color: #d5dbe8; color: var(--muted); }
.btn.solid { background: var(--blue); color: #fff; }

.readout {
  position: absolute;
  left: 12px;
  bottom: 10px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--line);
}

.picker {
  position: absolute;
  left: 30px;
  top: 24px;
  width: 180px;
  height: 180px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: background 0.05s linear;
}
.knob-host { width: 0; height: 0; }
.knob {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.3);
  transform: translate(-9px, -9px);
  cursor: grab;
}

.foot {
  text-align: center;
  color: var(--muted);
  font-size: 13px;
  padding: 10px 0 40px;
}

@media (max-width: 860px) {
  .wrap { grid-template-columns: 1fr; }
  .hero h1 { font-size: 34px; }
}
</style>
