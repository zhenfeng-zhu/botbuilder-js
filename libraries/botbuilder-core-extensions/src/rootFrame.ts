/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Storage, StoreItems, StoreItem } from './storage';
import { FrameDefinition, FrameScope, Frame, SlotValueChangedHandler } from './frameInterfaces';
import { ReadWriteSlot } from './slotInterfaces';
import { Slot } from './slot';


export class RootFrame implements Frame {
    private readonly cacheKey = Symbol('state');
    private readonly slots: { [name:string]: ReadWriteSlot<any>; } = {};
    private readonly listners: SlotValueChangedHandler[] = [];

    public readonly parent: Frame|undefined = undefined;
   
    public readonly scope: string;

    public readonly namespace: string;

    constructor (public readonly storage: Storage, definition: FrameDefinition) {
        this.scope = definition.scope;
        this.namespace = definition.namespace || definition.scope;

        // Initialize slots
        if (definition.slots) {
            definition.slots.forEach((def) => this.addSlot(new Slot(this, def)));
        }
    }

    public addSlot(slot: ReadWriteSlot<any>): void {
        const slotName = slot.definition.name;
        if (slot.frame !== this) { throw new Error(`RootFrame.addSlot(): The slot named '${slotName}' has already been added to a different frame.`) }
        if (this.slots.hasOwnProperty(slotName)) { throw new Error(`RootFrame.addSlot(): A slot named '${slotName}' has already been added to the current frame.`) }
        this.slots[slot.definition.name] = slot;
    }

    public async deleteAll(context: TurnContext): Promise<void> {
        // Overwrite persisted state
        const state: StoreItem = { eTag: '*' };
        const storageKey = this.getStorageKey(context);
        const changes = {} as StoreItems;
        changes[storageKey] = state;
        await this.storage.write(changes);

        // Update cache entry
        context.services.set(this.cacheKey, {
            state: state,
            hash: JSON.stringify(state),
            accessed: true
        });
    }

    public getSlot(slotName: string): ReadWriteSlot<any> {
        const slot = this.slots[slotName];
        if (!slot) { throw new Error(`RootFrame.getSlot(): A slot named '${slotName}' couldn't be found.`) }
        return slot;
    }

    public async load(context: TurnContext, accessed?: boolean): Promise<object> {
        let cached = context.services.get(this.cacheKey) as CachedFrameState;
        if (!cached) {
            const storageKey = this.getStorageKey(context);

            // Attempt to load cached state
            const items = await this.storage.read([storageKey]);
            const state = items.hasOwnProperty(storageKey) ?  items[storageKey] : {};
            state.eTag = '*';

            // Cache loaded state for the turn
            cached = {
                state: state,
                hash: JSON.stringify(state),
                accessed: accessed
            };
            context.services.set(this.cacheKey, cached);
        }
        if (accessed) { cached.accessed = true }
        return cached.state;
    }

    public onSlotValueChanged(handler: SlotValueChangedHandler): void {
        this.listners.push(handler);
    }

    public async slotValueChanged(context: TurnContext, tags: string[], value: any): Promise<void> {
        for (let i = 0; i < this.listners.length; i++) {
            await this.listners[i](context, tags, value);
        }
    }

    public async save(context: TurnContext): Promise<void> {
        let cached = context.services.get(this.cacheKey) as CachedFrameState;
        if (cached) {
            const hash = JSON.stringify(cached.state);
            if (hash !== cached.hash) {
                // Save updated state
                const storageKey = this.getStorageKey(context);
                const changes = {} as StoreItems;
                changes[storageKey] = cached.state;
                cached.hash = hash;
                await this.storage.write(changes);
            }
        }
    }

    public wasAccessed(context: TurnContext): boolean {
        let cached = context.services.get(this.cacheKey) as CachedFrameState;
        return (cached && cached.accessed);        
    }

    protected getStorageKey(context: TurnContext): string {
        const a = context.activity;
        switch (this.scope) {
            case FrameScope.user:
                return `${this.namespace}/${a.recipient.id}/${a.channelId}/${a.from.id}`;
            case FrameScope.conversation:
                return `${this.namespace}/${a.recipient.id}/${a.channelId}/${a.conversation.id}`;
            case FrameScope.conversationMember:
                return `${this.namespace}/${a.recipient.id}/${a.channelId}/${a.conversation.id}/${a.from.id}`;
            default:
                throw new Error(`RootFrame.getStorageKey(): Unknown scope of '${this.scope}'.`);
        }
    }
}

export class UserFrame extends RootFrame {
    constructor(storage: Storage, namespace?: string) {
        super(storage, { scope: FrameScope.user, namespace: namespace });
    }
}

export class ConversationFrame extends RootFrame {
    constructor(storage: Storage, namespace?: string) {
        super(storage, { scope: FrameScope.conversation, namespace: namespace });
    }
}

export class ConversationMemberFrame extends RootFrame {
    constructor(storage: Storage, namespace?: string) {
        super(storage, { scope: FrameScope.conversationMember, namespace: namespace });
    }
}

/** @private */
interface CachedFrameState {
    state: { [key: string]: object; };
    hash: string;
    accessed: boolean; 
}
