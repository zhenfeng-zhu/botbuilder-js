/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Storage } from './storage';
import { FrameDefinition, Frame, SlotValueChangedHandler } from './frameInterfaces';
import { ReadWriteSlot } from './slotInterfaces';
export declare class RootFrame implements Frame {
    readonly storage: Storage;
    private readonly cacheKey;
    private readonly slots;
    private readonly listners;
    readonly parent: Frame | undefined;
    readonly scope: string;
    readonly namespace: string;
    constructor(storage: Storage, definition: FrameDefinition);
    addSlot(slot: ReadWriteSlot<any>): void;
    deleteAll(context: TurnContext): Promise<void>;
    getSlot(slotName: string): ReadWriteSlot<any>;
    load(context: TurnContext, accessed?: boolean): Promise<object>;
    onSlotValueChanged(handler: SlotValueChangedHandler): void;
    slotValueChanged(context: TurnContext, tags: string[], value: any): Promise<void>;
    save(context: TurnContext): Promise<void>;
    wasAccessed(context: TurnContext): boolean;
    protected getStorageKey(context: TurnContext): string;
}
export declare class UserFrame extends RootFrame {
    constructor(storage: Storage, namespace?: string);
}
export declare class ConversationFrame extends RootFrame {
    constructor(storage: Storage, namespace?: string);
}
export declare class ConversationMemberFrame extends RootFrame {
    constructor(storage: Storage, namespace?: string);
}
