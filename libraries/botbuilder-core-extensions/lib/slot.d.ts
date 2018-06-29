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
export declare class Slot<T = any> implements ReadWriteSlot<T> {
    readonly frame: Frame;
    readonly definition: SlotDefinition<T>;
    constructor(frame: Frame, definition: SlotDefinition<T>);
    constructor(frame: Frame, name: string, defaultValue?: T);
    get(context: TurnContext): Promise<T | undefined>;
    has(context: TurnContext): Promise<boolean>;
    asReadOnly(): ReadOnlySlot<T>;
    delete(context: TurnContext): Promise<void>;
    history(context: TurnContext): Promise<SlotHistoryValue<T>[]>;
    set(context: TurnContext, value: T): Promise<void>;
    private loadValue(context);
    private cloneValue(context);
}
