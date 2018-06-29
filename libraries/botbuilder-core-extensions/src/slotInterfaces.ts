/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Frame } from './frameInterfaces';

/**
 * Definition for a slot that can be associated with a frame.
 */
export interface SlotDefinition<T = any> {
    /** 
     * Unique name of the slot within the frame. 
     */
    name: string;

    /**
     * (Optional) default value to initialize the slot with.
     * 
     * @remarks
     * The slot will automatically revert back to this value anytime its value is expired or 
     * manually deleted.
     */
    defaultValue?: T;

    /** 
     * (Optional) Array of change tags associated with the slot.
     * 
     * @remarks
     * Anytime the slots value changes, the new value will be logged to a shared change tracker 
     * using the supplied tags.  This enables searching for recent values on future turns of the
     * conversation. 
     */
    changeTags?: string[];

    /**
     * (Optional) expiration policy that determines how long a slots value is remembered for.
     * 
     * @remarks
     * By default a slots value is remembered indefinitely.
     */
    expireAfterSeconds?: number;

    /**
     * (Optional) history policy that determines how many of the slots previous values are 
     * remembered and for how long.
     * 
     * @remarks
     * By default a slots previous values are not remembered. 
     */
    history?: SlotHistoryPolicy;
}

/**
 * Defines the history policy that determines how many of the slots previous values are remembered
 * and for how long.
 */
export interface SlotHistoryPolicy {
    /**
     * Number of values to remember.
     */
    maxCount: number;

    /**
     * (Optional) expiration policy that determines how long individual values are remembered for. 
     */
    expireAfterSeconds?: number;
}

export interface ReadOnlySlot<T = any> {
    get(context: TurnContext): Promise<T|undefined>;
    has(context: TurnContext): Promise<boolean>;
    history(context: TurnContext): Promise<SlotHistoryValue<T>[]>;
}

export interface ReadWriteSlot<T = any> extends ReadOnlySlot<T> {
    readonly definition: SlotDefinition;
    readonly frame: Frame;
    asReadOnly(): ReadOnlySlot<T>;
    delete(context: TurnContext): Promise<void>;
    set(context: TurnContext, value: T): Promise<void>;
}

export interface SlotHistoryValue<T = any> {
    value: T;
    timestamp: string;
}
