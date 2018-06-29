/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware } from 'botbuilder-core';
import { Storage, StoreItem, StoreItems } from './storage';
import { FrameScope } from './frameInterfaces';
import { RootFrame } from './rootFrame';

export interface SlotValueChange<T = any> {
    tags: string[];
    value: T;
    timestamp: string;
    sequence: number;
}

export class ChangeTrackerMiddleware implements Middleware {
    private readonly cacheKey = Symbol('changes');

    public scope = FrameScope.user;

    public namespace: string|undefined = undefined;

    public maxCount = 1000;

    public expireAfterSeconds: number|undefined = undefined;

    constructor (private readonly storage: Storage, ...frames: RootFrame[]) {
        // Listen for slot changes
        frames.forEach((frame) => {
            frame.onSlotValueChanged(async (context, tags, value) => {
                // Insert change into log
                const log = await this.loadChanges(context);
                const sequence = log.sequence++;
                log.changes.push({
                    tags: tags,
                    value: value,
                    timestamp: new Date().toISOString(),
                    sequence: sequence
                });
            });
        });
    }

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        // Call bots logic
        await next();

        // Flush any changes
        await this.saveChanges(context);
    }

    public async findChanges<T = any>(context: TurnContext, tag: string, afterTimestampOrSequence?: Date|number): Promise<SlotValueChange<T>[]> {
        const log = await this.loadChanges(context);
        return log.changes.filter((v) => {
            if (v.tags.indexOf(tag) >= 0) {
                if (afterTimestampOrSequence instanceof Date) {
                    if (new Date(v.timestamp).getTime() > afterTimestampOrSequence.getTime()) {
                        return v;
                    }
                } else if (typeof afterTimestampOrSequence === 'number') {
                    if (v.sequence > afterTimestampOrSequence) {
                        return v;
                    }
                } else {
                    return v;
                }
            }
        });
    }

    private async loadChanges(context: TurnContext): Promise<SlotChangeLog> {
        let cached = context.services.get(this.cacheKey) as CachedChangeLog;
        if (!cached) {
            const storageKey = this.getStorageKey(context);

            // Attempt to load cached log
            const items = await this.storage.read([storageKey]);
            const log = (items.hasOwnProperty(storageKey) ?  items[storageKey] : { sequence: 0, changes: [] }) as SlotChangeLog;
            log.eTag = '*';

            // Cache loaded state for the turn
            cached = {
                log: log,
                hash: JSON.stringify(log)
            };
            context.services.set(this.cacheKey, cached);

            // Purge expired entires
            if (typeof this.expireAfterSeconds === 'number') {
                const cutoff = new Date().getTime() - (this.expireAfterSeconds * 1000);
                log.changes = log.changes.filter((v) => {
                    const timestamp = new Date(v.timestamp).getTime();
                    if (timestamp > cutoff) {
                        return v;
                    }
                });
            }
        }
        return cached.log;
    }

    private async saveChanges(context): Promise<void> {
        let cached = context.services.get(this.cacheKey) as CachedChangeLog;
        if (cached) {
            const hash = JSON.stringify(cached.log);
            if (hash !== cached.hash) {
                // Prune log length
                if (cached.log.changes.length > this.maxCount) {
                    cached.log.changes = cached.log.changes.slice(0, this.maxCount);
                }

                // Save updated log
                const storageKey = this.getStorageKey(context);
                const changes = {} as StoreItems;
                changes[storageKey] = cached.log;
                cached.hash = hash;
                await this.storage.write(changes);
            }
        }
    }

    private getStorageKey(context: TurnContext): string {
        const a = context.activity;
        const namespace = `${this.namespace || this.scope}-changes`;
        switch (this.scope) {
            case FrameScope.user:
                return `${namespace}/${a.recipient.id}/${a.channelId}/${a.from.id}`;
            case FrameScope.conversation:
                return `${namespace}/${a.recipient.id}/${a.channelId}/${a.conversation.id}`;
            case FrameScope.conversationMember:
                return `${namespace}/${a.recipient.id}/${a.channelId}/${a.conversation.id}/${a.from.id}`;
            default:
                throw new Error(`ChangeTrackerMiddleware.getStorageKey(): Unknown scope of '${this.scope}'.`);
        }
    }
}

/** @private */
interface SlotChangeLog extends StoreItem {
    sequence: number;
    changes: SlotValueChange[];
}

/** @private */
interface CachedChangeLog {
    log: SlotChangeLog;
    hash: string;
}