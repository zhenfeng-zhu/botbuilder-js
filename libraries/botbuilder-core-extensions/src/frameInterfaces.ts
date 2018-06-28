/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { SlotDefinition, ReadWriteSlot, SlotChangeTracker } from './slotInterfaces';

/**
 * Default persistence scopes supported for a frame.
 */
export enum FrameScope {
    /**
     * The slots within the frame are persisted across all of a users conversations.
     */
    user = 'user',

    /**
     * The slots within the frame are persisted for an individual conversation but are shared 
     * across all users within that conversation. 
     */
    conversation = 'conversation',

    /**
     * The slots within the frame are persisted for an individual conversation and are private to 
     * the current user. 
     */
    conversationMember = 'conversationMember'
}

/**
 * Definition for a frame that organizes a set of related slots.
 */
export interface FrameDefinition {
    /**
     * The frames persistance scope.
     */
    scope: FrameScope|string;

    /**
     * (Optional) the frames namespace for tracking purposes.
     * 
     * @remarks
     * If not specified the [scope](#scope) name will be used.
     */
    namespace?: string;

    /**
     * (Optional) array of slot definitions for the frame.
     */
    slots?: SlotDefinition[];
}


export interface Frame {
    readonly parent: Frame|undefined;
    readonly changeTracker: SlotChangeTracker|undefined;
    addSlot(slot: ReadWriteSlot<any>): void;
    load(context: TurnContext, accessed?: boolean): Promise<object>;
}
