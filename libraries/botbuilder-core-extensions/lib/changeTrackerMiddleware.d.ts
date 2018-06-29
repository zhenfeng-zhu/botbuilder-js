/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware } from 'botbuilder-core';
import { Storage } from './storage';
import { FrameScope } from './frameInterfaces';
import { RootFrame } from './rootFrame';
export interface SlotValueChange<T = any> {
    tags: string[];
    value: T;
    timestamp: string;
    sequence: number;
}
export declare class ChangeTrackerMiddleware implements Middleware {
    private readonly storage;
    private readonly cacheKey;
    scope: FrameScope;
    namespace: string | undefined;
    maxCount: number;
    expireAfterSeconds: number | undefined;
    constructor(storage: Storage, ...frames: RootFrame[]);
    /** @private */
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    findChanges<T = any>(context: TurnContext, tag: string, afterTimestampOrSequence?: Date | number): Promise<SlotValueChange<T>[]>;
    private loadChanges(context);
    private saveChanges(context);
    private getStorageKey(context);
}
