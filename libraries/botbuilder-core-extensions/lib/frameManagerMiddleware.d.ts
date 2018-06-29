/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware } from 'botbuilder-core';
import { RootFrame } from './rootFrame';
export declare class FrameManagerMiddleware implements Middleware {
    private frames;
    private access;
    /**
     * Creates a new FrameManagerMiddleware instance.
     * @param frames One or more frames to manage.
     */
    constructor(...frames: RootFrame[]);
    /** @private */
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    private preLoadScopes(context);
    private saveScopes(context);
}
