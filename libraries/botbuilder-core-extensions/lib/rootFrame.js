"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const frameInterfaces_1 = require("./frameInterfaces");
const slot_1 = require("./slot");
class RootFrame {
    constructor(storage, definition) {
        this.storage = storage;
        this.cacheKey = Symbol('state');
        this.slots = {};
        this.listners = [];
        this.parent = undefined;
        this.scope = definition.scope;
        this.namespace = definition.namespace || definition.scope;
        // Initialize slots
        if (definition.slots) {
            definition.slots.forEach((def) => this.addSlot(new slot_1.Slot(this, def)));
        }
    }
    addSlot(slot) {
        const slotName = slot.definition.name;
        if (slot.frame !== this) {
            throw new Error(`RootFrame.addSlot(): The slot named '${slotName}' has already been added to a different frame.`);
        }
        if (this.slots.hasOwnProperty(slotName)) {
            throw new Error(`RootFrame.addSlot(): A slot named '${slotName}' has already been added to the current frame.`);
        }
        this.slots[slot.definition.name] = slot;
    }
    deleteAll(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // Overwrite persisted state
            const state = { eTag: '*' };
            const storageKey = this.getStorageKey(context);
            const changes = {};
            changes[storageKey] = state;
            yield this.storage.write(changes);
            // Update cache entry
            context.services.set(this.cacheKey, {
                state: state,
                hash: JSON.stringify(state),
                accessed: true
            });
        });
    }
    getSlot(slotName) {
        const slot = this.slots[slotName];
        if (!slot) {
            throw new Error(`RootFrame.getSlot(): A slot named '${slotName}' couldn't be found.`);
        }
        return slot;
    }
    load(context, accessed) {
        return __awaiter(this, void 0, void 0, function* () {
            let cached = context.services.get(this.cacheKey);
            if (!cached) {
                const storageKey = this.getStorageKey(context);
                // Attempt to load cached state
                const items = yield this.storage.read([storageKey]);
                const state = items.hasOwnProperty(storageKey) ? items[storageKey] : {};
                state.eTag = '*';
                // Cache loaded state for the turn
                cached = {
                    state: state,
                    hash: JSON.stringify(state),
                    accessed: accessed
                };
                context.services.set(this.cacheKey, cached);
            }
            if (accessed) {
                cached.accessed = true;
            }
            return cached.state;
        });
    }
    onSlotValueChanged(handler) {
        this.listners.push(handler);
    }
    slotValueChanged(context, tags, value) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this.listners.length; i++) {
                yield this.listners[i](context, tags, value);
            }
        });
    }
    save(context) {
        return __awaiter(this, void 0, void 0, function* () {
            let cached = context.services.get(this.cacheKey);
            if (cached) {
                const hash = JSON.stringify(cached.state);
                if (hash !== cached.hash) {
                    // Save updated state
                    const storageKey = this.getStorageKey(context);
                    const changes = {};
                    changes[storageKey] = cached.state;
                    cached.hash = hash;
                    yield this.storage.write(changes);
                }
            }
        });
    }
    wasAccessed(context) {
        let cached = context.services.get(this.cacheKey);
        return (cached && cached.accessed);
    }
    getStorageKey(context) {
        const a = context.activity;
        switch (this.scope) {
            case frameInterfaces_1.FrameScope.user:
                return `${this.namespace}/${a.recipient.id}/${a.channelId}/${a.from.id}`;
            case frameInterfaces_1.FrameScope.conversation:
                return `${this.namespace}/${a.recipient.id}/${a.channelId}/${a.conversation.id}`;
            case frameInterfaces_1.FrameScope.conversationMember:
                return `${this.namespace}/${a.recipient.id}/${a.channelId}/${a.conversation.id}/${a.from.id}`;
            default:
                throw new Error(`RootFrame.getStorageKey(): Unknown scope of '${this.scope}'.`);
        }
    }
}
exports.RootFrame = RootFrame;
class UserFrame extends RootFrame {
    constructor(storage, namespace) {
        super(storage, { scope: frameInterfaces_1.FrameScope.user, namespace: namespace });
    }
}
exports.UserFrame = UserFrame;
class ConversationFrame extends RootFrame {
    constructor(storage, namespace) {
        super(storage, { scope: frameInterfaces_1.FrameScope.conversation, namespace: namespace });
    }
}
exports.ConversationFrame = ConversationFrame;
class ConversationMemberFrame extends RootFrame {
    constructor(storage, namespace) {
        super(storage, { scope: frameInterfaces_1.FrameScope.conversationMember, namespace: namespace });
    }
}
exports.ConversationMemberFrame = ConversationMemberFrame;
//# sourceMappingURL=rootFrame.js.map