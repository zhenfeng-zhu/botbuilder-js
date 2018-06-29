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
export declare class ChildFrame implements Frame {
    private readonly frameSlot;
    private readonly slots;
    constructor(frameSlot: ReadWriteSlot<object>, childSlots?: SlotDefinition[]);
    readonly parent: Frame;
    addSlot(slot: ReadWriteSlot<any>): void;
    getSlot(slotName: string): ReadWriteSlot<any>;
    load(context: TurnContext, accessed?: boolean): Promise<object>;
    slotValueChanged(context: TurnContext, tags: string[], value: any): Promise<void>;
}
