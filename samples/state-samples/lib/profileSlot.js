"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
class ProfileSlot {
    constructor(parentFrame, slotName) {
        // Create slot for holding profile
        this.profileSlot = new botbuilder_1.Slot(parentFrame, slotName);
        // Define child frame and slots
        const childFrame = new botbuilder_1.ChildFrame(new botbuilder_1.Slot(parentFrame, slotName));
        this.name = new botbuilder_1.Slot(childFrame, 'name');
        this.age = new botbuilder_1.Slot(childFrame, 'age');
    }
    /** Deletes the users profile. */
    delete(context) {
        return this.profileSlot.delete(context);
    }
}
exports.ProfileSlot = ProfileSlot;
