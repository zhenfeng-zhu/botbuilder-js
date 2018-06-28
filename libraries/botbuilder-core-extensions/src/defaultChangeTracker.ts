/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Frame } from './frameInterfaces';
import { SlotChangeTracker, SlotExpirationPolicy, SlotChangeValue } from './slotInterfaces';
import { Slot } from './slot';

const DEFAULT_MAX_COUNT = 100;

export class DefaultChangeTracker implements SlotChangeTracker {
    private readonly changeSlot: Slot<SlotChangeValue>;

    constructor (private readonly frame: Frame, slotName: string, maxCount?: number, expiration?: SlotExpirationPolicy) { 
        // Add slot to frame for tracking changes
        const count = typeof maxCount === 'number' && maxCount > 0 ? maxCount : DEFAULT_MAX_COUNT;
        this.changeSlot = new Slot(frame, {
            name: slotName,
            history: { maxCount: count, expiration: expiration }
        });
    }

    public async logChange(context: TurnContext, tags: string[], value: any): Promise<void> {
        // Get latest change and increment sequence number
        const latest = await this.changeSlot.get(context);
        const sequence = latest !== undefined ? latest.sequence + 1 : 0;

        // Write change to slot
        // - we're relying on the slots history feature to maintain the actual log of previous changes.
        await this.changeSlot.set(context, { tags: tags, value: value, timestamp: new Date().toISOString(), sequence: sequence });
    }

    public async findChanges<T = any>(context: TurnContext, tag: string, afterTimestampOrSequence?: Date|number): Promise<SlotChangeValue<T>[]> {
        // Assemble log
        const latest = await this.changeSlot.get(context);
        const log = (await this.changeSlot.history(context)).map((v) => v.value);
        if (latest) { log.unshift(latest) }

        // Return filtered log
        return log.filter((v) => {
            if (v.tags.indexOf(tag) >= 0) {
                if (afterTimestampOrSequence instanceof Date) {
                    const date = new Date(v.timestamp);
                    if (date.getTime() > afterTimestampOrSequence.getTime()) {
                        return v;
                    }
                } else if (typeof afterTimestampOrSequence === 'number') {
                    if (v.sequence > afterTimestampOrSequence) {
                        return v;
                    }
                } else {
                    return v;
                }
            }
        });
    }
}
