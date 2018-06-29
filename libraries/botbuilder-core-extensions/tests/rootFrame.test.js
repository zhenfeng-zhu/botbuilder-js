const assert = require('assert');
const { TurnContext } = require('botbuilder-core');
const { RootFrame, FrameScope, Slot, TestAdapter, MemoryStorage } = require('../');

describe('RootFrame', function () {
    this.timeout(10000);

    const adapter = new TestAdapter();

    it('should create using definition', async function () {
        const storage = new MemoryStorage();
        const frame = new RootFrame(storage, { scope: FrameScope.user });
        assert(frame.scope === FrameScope.user);
    });

    it('should add a slot indirectly using addSlot()', async function () {
        const storage = new MemoryStorage();
        const frame = new RootFrame(storage, { scope: FrameScope.user });
        const slot = new Slot(frame, 'foo');
        assert(frame.getSlot('foo'), `Slot not saved`);
    });

    it('should add slots via definition', async function () {
        const storage = new MemoryStorage();
        const frame = new RootFrame(storage, { 
            scope: FrameScope.user,
            slots: [
                { name: 'foo', defaultValue: 'bar' },
                { name: 'bar', defaultValue: 'foo' }
            ]
        });
        const fooSlot = frame.getSlot('foo');
        assert(fooSlot && fooSlot.definition.defaultValue === 'bar');
        const barSlot = frame.getSlot('bar');
        assert(barSlot && barSlot.definition.defaultValue === 'foo');
    });
});