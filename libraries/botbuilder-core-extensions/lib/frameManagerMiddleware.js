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
class FrameManagerMiddleware {
    /**
     * Creates a new FrameManagerMiddleware instance.
     * @param frames One or more frames to manage.
     */
    constructor(...frames) {
        this.access = {};
        this.frames = frames;
    }
    /** @private */
    onTurn(context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.preLoadScopes(context);
            yield next();
            yield this.saveScopes(context);
        });
    }
    preLoadScopes(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find most accessed scopes
            // - The algorithm slightly favors reading in more scopes when the counts are close. The
            //   count will be penalized by up to 30% when not all of the scopes are used.
            let topCount = 0;
            let topFrames = [];
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
            yield Promise.all(promises);
        });
    }
    saveScopes(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // Filter to accessed scopes and then initiate saves()
            let hash = '';
            const frames = [];
            const promises = this.frames.filter((f) => f.wasAccessed(context)).map((s) => {
                hash += s.namespace + '|';
                frames.push(s);
                return s.save(context);
            });
            // Update access pattern info
            const type = context.activity.type || '';
            if (!this.access.hasOwnProperty(type)) {
                this.access[type] = {};
            }
            if (!this.access[type].hasOwnProperty(hash)) {
                this.access[type][hash] = { frames: frames, count: 0 };
            }
            this.access[type][hash].count++;
            // Wait for saves to complete
            yield Promise.all(promises);
        });
    }
}
exports.FrameManagerMiddleware = FrameManagerMiddleware;
//# sourceMappingURL=frameManagerMiddleware.js.map