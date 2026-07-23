import { expect } from '@open-wc/testing';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { VMovable } from '../src/VMovable.js';
import { dragBy, releaseMouse, px, findCenter, whenReady } from './test.utilities.js';
import { sendMouse } from '@web/test-runner-commands';

// Give test instances a real size so native pointer input has a hit area.
// (The wrapper supplies display/position; consumers control size as usual.)
const style = document.createElement('style');
style.textContent = '.box{width:100px;height:100px;}';
document.head.appendChild(style);

/**
 * Mount a <v-movable> usage into the live document and return the host <movable-el>.
 * attachTo: document.body is required — real CDP mouse input only hits rendered nodes.
 */
const mountMovable = (props = {}, slots = {}, attrs = {}) => {
  const wrapper = mount(VMovable, {
    props,
    slots: { default: () => h('span', 'x'), ...slots },
    attrs: { class: 'box', ...attrs },
    attachTo: document.body,
  });
  return { wrapper, el: wrapper.element }; // wrapper.element is the <movable-el>
};

const cleanup = (wrapper) => {
  if (wrapper) wrapper.unmount();
  document.body.innerHTML = '';
};

describe('v-movable (Vue 3 wrapper over lit-movable)', () => {
  afterEach(async () => {
    await releaseMouse();
    cleanup();
  });

  it('renders a <movable-el> under the v-movable component', () => {
    const { el } = mountMovable();
    expect(el.tagName.toLowerCase()).to.equal('movable-el');
    expect(customElements.get('movable-el')).to.exist;
    cleanup();
  });

  it('forwards arbitrary attrs (data-*) to the element', () => {
    const { el } = mountMovable({}, {}, { 'data-testid': 'the-box' });
    expect(el.getAttribute('data-testid')).to.equal('the-box');
    cleanup();
  });

  it('initializes at left/top props', async () => {
    const { wrapper, el } = mountMovable({ left: 120, top: 200 });
    await nextTick();
    expect(px(el.style.left)).to.equal(120);
    expect(px(el.style.top)).to.equal(200);
    cleanup(wrapper);
  });

  it('forwards default slot content', () => {
    const { wrapper, el } = mountMovable(
      {},
      { default: () => h('span', { class: 'inner' }, 'drag me') }
    );
    expect(el.querySelector('.inner')).to.exist;
    cleanup(wrapper);
  });

  it('moves with real pointer drag input', async () => {
    const { wrapper, el } = mountMovable({ left: 50, top: 40 });
    await whenReady(el);
    await dragBy(el, 120, 80);
    expect(px(el.style.left)).to.equal(170);
    expect(px(el.style.top)).to.equal(120);
    cleanup(wrapper);
  });

  it('emits movestart, move, and moveend with plain move-state', async () => {
    const { wrapper, el } = mountMovable({ left: 30, top: 30 });
    await whenReady(el);

    // Consumers listen via DOM events (Vue on* props on a custom element don't
    // route through VTU emitted()), so assert the real event contract.
    const seen = [];
    el.addEventListener('movestart', (e) => seen.push({ type: 'movestart', d: e.detail }));
    el.addEventListener('move', (e) => seen.push({ type: 'move', d: e.detail }));
    el.addEventListener('moveend', (e) => seen.push({ type: 'moveend', d: e.detail }));

    await dragBy(el, 60, 40);

    const types = seen.map((s) => s.type);
    expect(types[0]).to.equal('movestart');
    expect(types).to.include('move');
    expect(types[types.length - 1]).to.equal('moveend');

    const detail = seen.find((s) => s.type === 'move').d;
    expect(detail).to.have.property('coords');
    expect(detail).to.have.property('totalDist');
    expect(detail).to.not.have.property('pointerId');
    cleanup(wrapper);
  });

  it('supports v-model:left / v-model:top two-way updates', async () => {
    const Host = defineComponent({
      components: { VMovable },
      data: () => ({ x: 50, y: 40 }),
      render() {
        return h(VMovable, {
          class: 'box',
          left: this.x,
          top: this.y,
          'onUpdate:left': (v) => (this.x = v),
          'onUpdate:top': (v) => (this.y = v),
        });
      },
    });
    const wrapper = mount(Host, { attachTo: document.body });
    const el = wrapper.element;
    await whenReady(el);
    await dragBy(el, 100, 60);
    await nextTick();

    expect(Math.round(wrapper.vm.x)).to.equal(150);
    expect(Math.round(wrapper.vm.y)).to.equal(100);
    cleanup(wrapper);
  });

  it('clamps movement to boundsX / boundsY (relative offsets)', async () => {
    // At (30,30), bounds "-30,40" / "-30,30" → absolute [0,70] / [0,60].
    const { wrapper, el } = mountMovable({
      left: 30,
      top: 30,
      boundsX: '-30,40',
      boundsY: '-30,30',
    });
    await whenReady(el);
    await dragBy(el, 200, 200);
    expect(px(el.style.left)).to.equal(70);
    expect(px(el.style.top)).to.equal(60);
    cleanup(wrapper);
  });

  it('snaps movement to the grid', async () => {
    // grid snaps the *travel distance* (62,37 → 50,50), then adds start (10,10).
    const { wrapper, el } = mountMovable({ left: 10, top: 10, grid: 50 });
    await whenReady(el);
    await dragBy(el, 62, 37);
    expect(px(el.style.left)).to.equal(60);
    expect(px(el.style.top)).to.equal(60);
    cleanup(wrapper);
  });

  it('restricts movement with axis="x"', async () => {
    const { wrapper, el } = mountMovable({ left: 40, top: 80, axis: 'x' });
    await whenReady(el);
    await dragBy(el, 90, 70);
    expect(px(el.style.left)).to.equal(130);
    expect(px(el.style.top)).to.equal(80);
    cleanup(wrapper);
  });

  it('does not move when disabled', async () => {
    const { wrapper, el } = mountMovable({ left: 25, top: 25, disabled: true });
    await whenReady(el);
    await dragBy(el, 100, 100);
    expect(px(el.style.left)).to.equal(25);
    expect(px(el.style.top)).to.equal(25);
    cleanup(wrapper);
  });

  it('eventsOnly fires move events without repositioning', async () => {
    const { wrapper, el } = mountMovable({ left: 15, top: 15, eventsOnly: true });
    await whenReady(el);
    let moves = 0;
    el.addEventListener('move', () => (moves += 1));
    await dragBy(el, 75, 50);
    expect(moves).to.be.greaterThan(0);
    expect(px(el.style.left)).to.equal(15);
    expect(px(el.style.top)).to.equal(15);
    cleanup(wrapper);
  });

  it('moves an external target via targetSelector', async () => {
    const Host = defineComponent({
      components: { VMovable },
      render() {
        return h('div', [
          h(
            'div',
            { id: 'dialog', style: 'position:absolute;left:10px;top:10px;width:120px;height:80px' },
            [
              h(
                VMovable,
                { targetSelector: '#dialog', style: 'display:block;width:120px;height:20px' },
                () => h('div', { slot: 'handle', id: 'handle', style: 'width:120px;height:20px' }, 'title')
              ),
            ]
          ),
        ]);
      },
    });
    const wrapper = mount(Host, { attachTo: document.body });
    await nextTick();
    const dialog = document.getElementById('dialog');
    const handle = document.getElementById('handle');
    await whenReady(document.querySelector('movable-el'));
    await dragBy(handle, 40, 30);
    expect(px(dialog.style.left)).to.equal(50);
    expect(px(dialog.style.top)).to.equal(40);
    cleanup(wrapper);
  });

  it('only starts dragging from the handle slot when provided', async () => {
    const { wrapper, el } = mountMovable(
      { left: 10, top: 10 },
      {
        handle: () => h('div', { id: 'handle', style: 'width:100px;height:50px' }, 'handle'),
        default: () => h('div', { id: 'body', style: 'width:100px;height:50px' }, 'body'),
      }
    );
    await whenReady(el);

    // Dragging the body (non-handle) must not move.
    const body = el.querySelector('#body');
    const [bx, by] = findCenter(body);
    await sendMouse({ type: 'move', position: [bx, by] });
    await sendMouse({ type: 'down' });
    await sendMouse({ type: 'move', position: [bx + 50, by + 40] });
    await sendMouse({ type: 'up' });
    expect(px(el.style.left)).to.equal(10);
    expect(px(el.style.top)).to.equal(10);

    // Dragging the handle moves it.
    await dragBy(el.querySelector('#handle'), 40, 20);
    expect(px(el.style.left)).to.equal(50);
    expect(px(el.style.top)).to.equal(30);
    cleanup(wrapper);
  });

  it('ignores drags below dragAfterDist', async () => {
    const { wrapper, el } = mountMovable({ left: 40, top: 40, dragAfterDist: 40 });
    await whenReady(el);
    let moves = 0;
    el.addEventListener('move', () => (moves += 1));
    await dragBy(el, 10, 10);
    expect(moves).to.equal(0);
    expect(px(el.style.left)).to.equal(40);
    expect(px(el.style.top)).to.equal(40);
    cleanup(wrapper);
  });
});
