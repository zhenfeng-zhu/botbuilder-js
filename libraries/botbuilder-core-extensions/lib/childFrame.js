"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const slot_1 = require("./slot");
class ChildFrame {
    constructor(frameSlot, childSlots) {
        this.frameSlot = frameSlot;
        this.slots = {};
        // Initialize slots
        if (childSlots) {
            childSlots.forEach((def) => this.addSlot(new slot_1.Slot(this, def)));
        }
    }
    get parent() {
        return this.frameSlot.frame;
    }
    addSlot(slot) {
        const slotName = slot.definition.name;
        if (slot.frame !== this) {
            throw new Error(`RootFrame.addSlot(): The slot named '${slotName}' has already been added to a different frame.`);
        }
        if (this.slots.hasOwnProperty(slotName)) {
            throw new Error(`RootFrame.addSlot(): A slot named '${slotName}' has already been added to the current frame.`);
        }
        this.slots[slot.definition.name] = slot;
    }
    getSlot(slotName) {
        const slot = this.slots[slotName];
        if (!slot) {
            throw new Error(`RootFrame.getSlot(): A slot named '${slotName}' couldn't be found.`);
        }
        return slot;
    }
    load(context, accessed) {
        return __awaiter(this, void 0, void 0, function* () {
            // First ensure the slots parent frame is loaded with appropriate `accessed` flag.
            yield this.frameSlot.frame.load(context, accessed);
            // Next get the value stored in the child frames host slot
            let value = yield this.frameSlot.get(context);
            // Initialize the host slots value as needed
            if (typeof value !== 'object') {
                value = {};
                yield this.frameSlot.set(context, value);
            }
            return value;
        });
    }
    slotValueChanged(context, tags, value) {
        return this.frameSlot.frame.slotValueChanged(context, tags, value);
    }
}
exports.ChildFrame = ChildFrame;
//# sourceMappingURL=childFrame.js.map