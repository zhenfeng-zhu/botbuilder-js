/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware } from 'botbuilder-core';
import { RootFrame } from './rootFrame';

export class FrameManagerMiddleware implements Middleware {
    private frames: RootFrame[];
    private access: AccessPattern = {};

    /**
     * Creates a new FrameManagerMiddleware instance.
     * @param frames One or more frames to manage.
     */
    constructor(...frames: RootFrame[]) {
        this.frames = frames;
    }

    /** @private */
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        await this.preLoadScopes(context);
        await next();
        await this.saveScopes(context);
    }

    private async preLoadScopes(context: TurnContext): Promise<void> {
        // Find most accessed scopes
        // - The algorithm slightly favors reading in more scopes when the counts are close. The
        //   count will be penalized by up to 30% when not all of the scopes are used.
        let topCount = 0;
        let topFrames: RootFrame[] = [];
        const type = context.activity.type || '';
        const hashes = this.access[type];
        if (hashes) {
            for (const key in hashes) {
                if (hashes.hasOwnProperty(key)) {
                    const entry = hashes[key];
                    const weight = 0.7 + ((entry.frames.length / this.frames.length) * 0.3);
                    const count = entry.count * weight;
                    if (count > topCount) {
                        topCount = count;
                        topFrames = entry.frames;
                    }
                }
            }
        }

        // Pre-load most accessed scopes.
        const promises = topFrames.map((s) => s.load(context, false));
        await Promise.all(promises);
    }

    private async saveScopes(context: TurnContext): Promise<void> {
        // Filter to accessed scopes and then initiate saves()
        let hash = '';
        const frames: RootFrame[] = [];
        const promises = this.frames.filter((f) => f.wasAccessed(context)).map((s) => {
            hash += s.namespace + '|';
            frames.push(s);
            return s.save(context);
        });

        // Update access pattern info
        const type = context.activity.type || '';
        if (!this.access.hasOwnProperty(type)) { this.access[type] = {} }
        if (!this.access[type].hasOwnProperty(hash)) { this.access[type][hash] = { frames: frames, count: 0 } }
        this.access[type][hash].count++;

        // Wait for saves to complete
        await Promise.all(promises);
    }
}

/** @private */
interface AccessPattern {
    [type: string]: {
        [hash: string]: {
            frames: RootFrame[];
            count: number;
        };
    };
}
