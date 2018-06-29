/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Frame } from './frameInterfaces';
import { SlotDefinition, SlotHistoryValue, ReadWriteSlot, ReadOnlySlot } from './slotInterfaces';

export class Slot<T = any> implements ReadWriteSlot<T> {
    public readonly frame: Frame;
    public readonly definition: SlotDefinition<T>;

    constructor (frame: Frame, definition: SlotDefinition<T>);
    constructor (frame: Frame, name: string, defaultValue?: T);
    constructor (frame: Frame, nameOrDefinition: string|SlotDefinition<T>, defaultValue?: T) {
        this.frame = frame;
        this.definition = typeof nameOrDefinition === 'string' ? { name: nameOrDefinition, defaultValue: defaultValue } : nameOrDefinition;
    }

    public async get(context: TurnContext): Promise<T|undefined> {
        const v = await this.loadValue(context);
        return v ? v.value : undefined;
    }

    public async has(context: TurnContext): Promise<boolean> {
        const v = await this.loadValue(context);
        return v !== undefined;
    }

    public asReadOnly(): ReadOnlySlot<T> {

        return {
            get: async (context) => {
                const v = await this.cloneValue(context);
                return v ? v.value : undefined;
            },
            has: async (context) => {
                return await this.has(context);
            },
            history: async (context) => {
                const v = await this.cloneValue(context);
                return v ? v.history : [];
            }
        };
    }
    
    public async delete(context: TurnContext): Promise<void> {
        const state = await this.frame.load(context, true);
        const { name } = this.definition;
        if (state && state.hasOwnProperty(name)) {
            delete state[name];
        } 
    }

    public async history(context: TurnContext): Promise<SlotHistoryValue<T>[]> {
        const v = await this.loadValue(context);
        return v ? v.history : [];
    }

    public async set(context: TurnContext, value: T): Promise<void> {
        const state = await this.frame.load(context, true);
        if (state) {
            const now = new Date();
            const { name, history, changeTags } = this.definition;
            let v: SlotValue<T>|undefined = state.hasOwnProperty(name) ? state[name] : undefined;
            if (v) {
                // Promote current value to history
                if (history && history.maxCount > 0) {
                    v.history.push({
                        value: v.value,
                        timestamp: now.toISOString()
                    });
                }

                // Update slots current value
                v.value = value;
            } else {
                // Initialize slots value
                v = { value: value, history: [], lastAccess: now.toISOString() };
                state[name] = v;
            }

            // Signal value change
            if (changeTags && changeTags.length > 0) {
                await this.frame.slotValueChanged(context, changeTags, value);
            }
        }
    }

    private async loadValue(context: TurnContext): Promise<SlotValue<T>|undefined> {
        const state = this.frame.load(context, true);
        let v: SlotValue<T>|undefined;
        if (state) {
            // Check for existing value and that it's not expired. 
            const now = new Date();
            const { name, expireAfterSeconds, history, defaultValue } = this.definition;
            if (state.hasOwnProperty(name)) {
                v = state[name] as SlotValue<T>;

                // Check for expiration of whole slot
                const lastAccess = new Date(v.lastAccess);
                if (typeof expireAfterSeconds === 'number' && now.getTime() > (lastAccess.getTime() + (expireAfterSeconds * 1000))) {
                    delete state[name];
                    v = undefined;
                } else {
                    v.lastAccess = now.toISOString();

                    // Purge expired history values
                    if (history && typeof history.expireAfterSeconds === 'number') {
                        v.history = v.history.filter((hv) => {
                            const timestamp = new Date(hv.timestamp);
                            if (now.getTime() < (timestamp.getTime() + (expireAfterSeconds * 1000))) {
                                return hv;
                            }
                        });
                    }
                }
            }
            
            // Populate with default value.
            if (v == undefined && defaultValue !== undefined) {
                const clone = typeof defaultValue == 'object' || Array.isArray(defaultValue) ? JSON.parse(JSON.stringify(defaultValue)) : defaultValue;
                v = { value: clone, history: [], lastAccess: now.toISOString() };
                state[name] = v;
            }
        }
        return v;
    }

    private async cloneValue(context: TurnContext): Promise<SlotValue<T>|undefined> {
        const v = await this.loadValue(context);
        return v ? JSON.parse(JSON.stringify(v)) : undefined;
    }
}


/** @private */
interface SlotValue<T> {
    value: T;
    history: SlotHistoryValue<T>[];
    lastAccess: string;
}
