/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Frame } from './frameInterfaces';
import { SlotDefinition, ReadWriteSlot } from './slotInterfaces';
import { Slot } from './slot';

export class ChildFrame implements Frame {
    private readonly slots: { [name:string]: ReadWriteSlot<any>; } = {};

    constructor (private readonly frameSlot: ReadWriteSlot<object>, childSlots?: SlotDefinition[]) {
        // Initialize slots
        if (childSlots) {
            childSlots.forEach((def) => this.addSlot(new Slot(this, def)));
        }
    }

    public get parent(): Frame {
        return this.frameSlot.frame;
    }

    public addSlot(slot: ReadWriteSlot<any>): void {
        const slotName = slot.definition.name;
        if (slot.frame !== this) { throw new Error(`RootFrame.addSlot(): The slot named '${slotName}' has already been added to a different frame.`) }
        if (this.slots.hasOwnProperty(slotName)) { throw new Error(`RootFrame.addSlot(): A slot named '${slotName}' has already been added to the current frame.`) }
        this.slots[slot.definition.name] = slot;
    }

    public getSlot(slotName: string): ReadWriteSlot<any> {
        const slot = this.slots[slotName];
        if (!slot) { throw new Error(`RootFrame.getSlot(): A slot named '${slotName}' couldn't be found.`) }
        return slot;
    }

    public async load(context: TurnContext, accessed?: boolean): Promise<object> {
        // First ensure the slots parent frame is loaded with appropriate `accessed` flag.
        await this.frameSlot.frame.load(context, accessed)

        // Next get the value stored in the child frames host slot
        let value = await this.frameSlot.get(context);

        // Initialize the host slots value as needed
        if (typeof value !== 'object') {
            value = {};
            await this.frameSlot.set(context, value);
        }
        return value;
    }

    
    public slotValueChanged(context: TurnContext, tags: string[], value: any): Promise<void> {
        return this.frameSlot.frame.slotValueChanged(context, tags, value);
    }
}