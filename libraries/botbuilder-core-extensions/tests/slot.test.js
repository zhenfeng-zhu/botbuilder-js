const assert = require('assert');
const { TurnContext } = require('botbuilder-core');
const { Slot, TestAdapter } = require('../');


class TestFrame {
    constructor(state) {
        this.slots = {};
        this.state = state || {};
        this.loaded = false;
        this.signaled = false;
    }

    get parent() {
        return undefined;
    }

    addSlot(slot) {
        assert(slot instanceof Slot, `TestFrame.addSlot(): invalid slot passed in.`);
        assert(slot.definition.name, `TestFrame.addSlot(): slot missing name.`);
        this.slots[slot.definition.name] = slot;
    }

    load(context, accessed) {
        assert(context, `TestFrame.load(): missing context.`);
        this.loaded = true;
        return Promise.resolve(this.state);
    }

    slotValueChanged(context, tags, value) {
        assert(context, `TestFrame.slotValueChanged(): missing context.`);
        assert(Array.isArray(tags) && tags.length > 0, `TestFrame.slotValueChanged(): invalid or missing tags.`);
        assert(value !== undefined, `TestFrame.slotValueChanged(): missing value.`);
        this.signaled = true;
        return Promise.resolve();
    }
}

function pause(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

describe('Slot', function () {
    this.timeout(10000);

    const adapter = new TestAdapter();

    it('should create using definition', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, { name: 'foo' });
        assert(frame.slots.hasOwnProperty('foo'));
    });

    it('should create using name and defaultValue', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, 'foo', 'bar');
        assert(slot.definition.name === 'foo')
        assert(slot.definition.defaultValue === 'bar');
        assert(frame.slots.hasOwnProperty('foo'));
    });

    it('should get() undefined for a missing value', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, 'foo');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        const value = await slot.get(context);
        assert(frame.loaded, `frame not loaded`);
        assert(value === undefined, `returned '${value}'`);
    });

    it('should get() a default value', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, 'foo', 'bar');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        const value = await slot.get(context);
        assert(value === 'bar');
    });

    it('should get() a stored value', async function () {
        const frame = new TestFrame({ 'foo': { value: 'blat', history: [], lastAccess: new Date().toISOString() }});
        const slot = new Slot(frame, 'foo', 'bar');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        const value = await slot.get(context);
        assert(value === 'blat', `returned '${value}'`);
    });

    it('should return "false" for has() with an undefined value', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, 'foo');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        const has = await slot.has(context);
        assert(has === false);
    });

    it('should return "true" for has() with a default value', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, 'foo');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        const has = await slot.has(context);
        assert(has === false);
    });

    it('should return "true" for has() with a stored value', async function () {
        const frame = new TestFrame({ 'foo': { value: 'blat', history: [], lastAccess: new Date().toISOString() }});
        const slot = new Slot(frame, 'foo', 'bar');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        const has = await slot.has(context);
        assert(has === true);
    });

    it('should set() a new value', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, 'foo');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        await slot.set(context, 'blat');
        let value = await slot.get(context);
        assert(value === 'blat');
    });

    it('should override a defaultValue when a value set()', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, 'foo', 'bar');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        let value = await slot.get(context);
        assert(value === 'bar');
        await slot.set(context, 'blat');
        value = await slot.get(context);
        assert(value === 'blat');
    });

    it('should override previous value when a new one is set()', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, 'foo');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        await slot.set(context, 'm1');
        await slot.set(context, 'm2');
        const value = await slot.get(context);
        assert(value === 'm2');
    });

    it('should delete() an existing value', async function () {
        const frame = new TestFrame({ 'foo': { value: 'blat', history: [], lastAccess: new Date().toISOString() }});
        const slot = new Slot(frame, 'foo');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        await slot.delete(context);
        let value = await slot.get(context);
        assert(value === undefined);
    });

    it('should revert to the default value when delete() called', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, 'foo', 'bar');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        await slot.set(context, 'blat');
        let value = await slot.get(context);
        assert(value === 'blat');
        await slot.delete(context);
        value = await slot.get(context);
        assert(value === 'bar');
    });

    it('should return asReadOnly() version of slot', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, 'foo', 'bar');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        const readOnly = slot.asReadOnly();
        assert(readOnly && typeof readOnly.get === 'function');
    });

    it('should return "true" from asReadOnly().get()', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, 'foo', 'bar');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        const readOnly = slot.asReadOnly();
        const has = await readOnly.has(context);
        assert(has === true);
    });

    it('should return a clone from asReadOnly().get()', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, 'foo', { test: 'bar' });
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        const readOnly = slot.asReadOnly();
        const clone = await readOnly.get(context);
        assert(clone && clone.test === 'bar', `no value returned from get()`);
        clone.test = 'foo';
        const value = await slot.get(context);
        assert(value && value.test === 'bar', `original value tamperred with`);
    });

    it('should return a clone from asReadOnly().history()', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, {
            name: 'foo',
            history: { maxCount: 3 }
        });
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        const readOnly = slot.asReadOnly();
        await slot.set(context, 'm1');
        await slot.set(context, 'm2');
        await slot.set(context, 'm3');
        await slot.set(context, 'm4');
        const clone = await readOnly.history(context);
        assert(Array.isArray(clone) && clone.length === 3);
        clone.push('m5');
        const history = await slot.history(context);
        assert(history && history.length === 3, `original value tamperred with`);
    });


    it('should always return empty history() if no policy set', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, 'foo');
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        let history = await slot.history(context);
        assert(Array.isArray(history) && history.length === 0);
        await slot.set(context, 'm1');
        history = await slot.history(context);
        assert(history.length === 0);
        await slot.set(context, 'm2');
        history = await slot.history(context);
        assert(history.length === 0);
    });

    it('should push existing value to history() when a new one is set()', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, {
            name: 'foo',
            history: { maxCount: 1 }
        });
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        let history = await slot.history(context);
        assert(Array.isArray(history) && history.length === 0);
        await slot.set(context, 'm1');
        history = await slot.history(context);
        assert(history.length === 0);
        await slot.set(context, 'm2');
        history = await slot.history(context);
        assert(history.length === 1, `no history logged`);
        assert(history[0].value === 'm1', `wrong value pushed to history`);
        assert(history[0].timestamp, `no timestamp logged`);
    });

    it('should maintain order of values in history()', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, {
            name: 'foo',
            history: { maxCount: 3 }
        });
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        await slot.set(context, 'm1');
        await slot.set(context, 'm2');
        await slot.set(context, 'm3');
        await slot.set(context, 'm4');
        let history = await slot.history(context);
        assert(history.length === 3, `invalid item count: ${history.length}`);
        const values = history[0].value + history[1].value + history[2].value;
        assert(values === 'm3m2m1', `history out of order: ${values}`);
    });

    it('should cap number of values in history()', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, {
            name: 'foo',
            history: { maxCount: 2 }
        });
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        await slot.set(context, 'm1');
        await slot.set(context, 'm2');
        await slot.set(context, 'm3');
        await slot.set(context, 'm4');
        let history = await slot.history(context);
        assert(history.length === 2, `invalid item count: ${history.length}`);
        const values = history[0].value + history[1].value;
        assert(values === 'm3m2', `wrong item purged: ${values}`);
    });

    it('should age out expired values from history()', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, {
            name: 'foo',
            history: { maxCount: 3, expireAfterSeconds: 2 }
        });
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        await slot.set(context, 'm1');
        await pause(1000);
        await slot.set(context, 'm2');
        await pause(1000);
        await slot.set(context, 'm3');
        await pause(1000);
        await slot.set(context, 'm4');
        let history = await slot.history(context);
        assert(history.length === 2, `invalid item count: ${history.length}`);
        const values = history[0].value + history[1].value;
        assert(values === 'm3m2', `wrong item purged: ${values}`);
    });

    it('should age out expired values previously set()', async function () {
        const frame = new TestFrame();
        const slot = new Slot(frame, {
            name: 'foo',
            defaultValue: 'bar',
            expireAfterSeconds: 2
        });
        const context = new TurnContext(adapter, { type: 'message', text: 'test' });
        await slot.set(context, 'blat');
        await pause(2500);
        const value = await slot.get(context);
        assert(value === 'bar');
    });
});