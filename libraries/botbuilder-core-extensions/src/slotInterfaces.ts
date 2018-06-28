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
 * Default slot types supported.
 */
export enum SlotType {
    string = 'string',
    number = 'number',
    integer = 'integer',
    boolean = 'boolean',
    array = 'array',
    object = 'object',
    any = 'any'
}

/**
 * Definition for a slot that can be associated with a frame.
 */
export interface SlotDefinition<T = any> {
    /** 
     * Unique name of the slot within the frame. 
     */
    name: string;

    /** 
     * (Optional) slots data type for validation purposes. 
     * 
     * @remarks
     * This will default to a value of `SlotType.any`.
     */
    type?: SlotType|string;

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
    expiration?: SlotExpirationPolicy;

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
 * Defines the expiration policy that determines how long a slots value is remembered for.
 */
export interface SlotExpirationPolicy {
    /**
     * (Optional) the slots value will be forgotten after the specified number of seconds.
     */
    afterSeconds?: number;

    /**
     * (Optional) the slots value will be forgotten after the specified number of conversation 
     * turns.
     */
    afterTurns?: number;
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
    expiration?: SlotExpirationPolicy;
}


export interface ReadOnlySlot<T = any> {
    readonly definition: SlotDefinition;
    get(context: TurnContext): Promise<T|undefined>;
    has(context: TurnContext): Promise<boolean>;
    history(context: TurnContext): Promise<SlotHistoryValue<T>[]>;
}

export interface ReadWriteSlot<T = any> extends ReadOnlySlot<T> {
    readonly frame: Frame;
    delete(context: TurnContext): Promise<void>;
    set(context: TurnContext, value: T): Promise<void>;
}

export interface SlotHistoryValue<T = any> {
    value: T;
    timestamp: string;
    turns: number;
}

export interface SlotChangeTracker {
    logChange(context: TurnContext, tags: string[], value: any): Promise<void>;
    findChanges<T = any>(context: TurnContext, tag: string, afterTimestampOrSequence?: Date|number): Promise<SlotChangeValue<T>[]>;
}

export interface SlotChangeValue<T = any> {
    tags: string[];
    value: T;
    timestamp: string;
    sequence: number;
}
