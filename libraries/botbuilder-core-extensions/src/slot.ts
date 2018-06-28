/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Frame } from './frameInterfaces';
import { SlotDefinition, SlotHistoryValue, ReadWriteSlot } from './slotInterfaces';

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

    }

    public async has(context: TurnContext): Promise<boolean> {

    }

    public async history(context: TurnContext): Promise<SlotHistoryValue<T>[]> {

    }
    
    public async delete(context: TurnContext): Promise<void> {

    }

    public async set(context: TurnContext, value: T): Promise<void> {

    }
}