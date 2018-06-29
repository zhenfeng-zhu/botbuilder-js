"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default persistence scopes supported for a frame.
 */
var FrameScope;
(function (FrameScope) {
    /**
     * The slots within the frame are persisted across all of a users conversations.
     */
    FrameScope["user"] = "user";
    /**
     * The slots within the frame are persisted for an individual conversation but are shared
     * across all users within that conversation.
     */
    FrameScope["conversation"] = "conversation";
    /**
     * The slots within the frame are persisted for an individual conversation and are private to
     * the current user.
     */
    FrameScope["conversationMember"] = "conversationMember";
})(FrameScope = exports.FrameScope || (exports.FrameScope = {}));
//# sourceMappingURL=frameInterfaces.js.map