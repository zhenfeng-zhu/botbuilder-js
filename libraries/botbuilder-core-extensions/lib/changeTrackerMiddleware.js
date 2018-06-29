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
class ChangeTrackerMiddleware {
    constructor(storage, ...frames) {
        this.storage = storage;
        this.cacheKey = Symbol('changes');
        this.scope = frameInterfaces_1.FrameScope.user;
        this.namespace = undefined;
        this.maxCount = 1000;
        this.expireAfterSeconds = undefined;
        // Listen for slot changes
        frames.forEach((frame) => {
            frame.onSlotValueChanged((context, tags, value) => __awaiter(this, void 0, void 0, function* () {
                // Insert change into log
                const log = yield this.loadChanges(context);
                const sequence = log.sequence++;
                log.changes.push({
                    tags: tags,
                    value: value,
                    timestamp: new Date().toISOString(),
                    sequence: sequence
                });
            }));
        });
    }
    /** @private */
    onTurn(context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // Call bots logic
            yield next();
            // Flush any changes
            yield this.saveChanges(context);
        });
    }
    findChanges(context, tag, afterTimestampOrSequence) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = yield this.loadChanges(context);
            return log.changes.filter((v) => {
                if (v.tags.indexOf(tag) >= 0) {
                    if (afterTimestampOrSequence instanceof Date) {
                        if (new Date(v.timestamp).getTime() > afterTimestampOrSequence.getTime()) {
                            return v;
                        }
                    }
                    else if (typeof afterTimestampOrSequence === 'number') {
                        if (v.sequence > afterTimestampOrSequence) {
                            return v;
                        }
                    }
                    else {
                        return v;
                    }
                }
            });
        });
    }
    loadChanges(context) {
        return __awaiter(this, void 0, void 0, function* () {
            let cached = context.services.get(this.cacheKey);
            if (!cached) {
                const storageKey = this.getStorageKey(context);
                // Attempt to load cached log
                const items = yield this.storage.read([storageKey]);
                const log = (items.hasOwnProperty(storageKey) ? items[storageKey] : { sequence: 0, changes: [] });
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
        });
    }
    saveChanges(context) {
        return __awaiter(this, void 0, void 0, function* () {
            let cached = context.services.get(this.cacheKey);
            if (cached) {
                const hash = JSON.stringify(cached.log);
                if (hash !== cached.hash) {
                    // Prune log length
                    if (cached.log.changes.length > this.maxCount) {
                        cached.log.changes = cached.log.changes.slice(0, this.maxCount);
                    }
                    // Save updated log
                    const storageKey = this.getStorageKey(context);
                    const changes = {};
                    changes[storageKey] = cached.log;
                    cached.hash = hash;
                    yield this.storage.write(changes);
                }
            }
        });
    }
    getStorageKey(context) {
        const a = context.activity;
        const namespace = `${this.namespace || this.scope}-changes`;
        switch (this.scope) {
            case frameInterfaces_1.FrameScope.user:
                return `${namespace}/${a.recipient.id}/${a.channelId}/${a.from.id}`;
            case frameInterfaces_1.FrameScope.conversation:
                return `${namespace}/${a.recipient.id}/${a.channelId}/${a.conversation.id}`;
            case frameInterfaces_1.FrameScope.conversationMember:
                return `${namespace}/${a.recipient.id}/${a.channelId}/${a.conversation.id}/${a.from.id}`;
            default:
                throw new Error(`ChangeTrackerMiddleware.getStorageKey(): Unknown scope of '${this.scope}'.`);
        }
    }
}
exports.ChangeTrackerMiddleware = ChangeTrackerMiddleware;
//# sourceMappingURL=changeTrackerMiddleware.js.map