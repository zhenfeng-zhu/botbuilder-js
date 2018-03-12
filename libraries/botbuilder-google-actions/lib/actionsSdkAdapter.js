"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-google-actions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_1 = require("botbuilder");
const actions_on_google_1 = require("actions-on-google");
class ActionsSdkAdapter extends botbuilder_1.BotAdapter {
    /**
     * Creates a new ActionsSdkAdapter instance.
     * @param settings Configuration settings for the adapter.
     */
    constructor(settings) {
        super();
        this.responses = {};
        this.settings = Object.assign({}, settings);
    }
    processRequest(req, res, logic) {
        // Parse incoming request
        let errorCode = 500;
        return parseRequest(req).then((request) => {
            // Verify incoming request
            errorCode = 400;
            const app = new actions_on_google_1.ActionsSdkApp({ request: req, response: res });
            return app.isRequestFromAssistant(this.settings.projectId).then(() => {
                errorCode = 500;
                // Create context object
                const activity = this.requestToActivity(request);
                const context = this.createContext(activity);
                // Add context extensions for userStorage and conversationToken
                context.userStorage = request.user.userStorage ? JSON.parse(request.user.userStorage) : {};
                context.conversationToken = request.conversation.conversationToken ? JSON.parse(request.conversation.conversationToken) : {};
                // Process received activity
                return this.runMiddleware(context, logic)
                    .then(() => {
                    const key = activity.conversation.id + ':' + activity.id;
                    try {
                        const activities = this.responses[key] || [];
                        const response = this.combineResponses(activities);
                        if (response.userStorage === undefined && typeof context.userStorage === 'object') {
                            response.userStorage = JSON.stringify(context.userStorage);
                        }
                        else if (response.resetUserStorage === undefined && request.user.userStorage) {
                            response.resetUserStorage = true;
                        }
                        if (response.conversationToken === undefined && typeof context.conversationToken === 'object') {
                            response.conversationToken = JSON.stringify(context.conversationToken);
                        }
                        res.status(200);
                        res.send(response);
                        res.end();
                    }
                    finally {
                        if (this.responses.hasOwnProperty(key)) {
                            delete this.responses[key];
                        }
                    }
                });
            });
        }).catch((err) => {
            // Reject response with error code
            console.warn(`ActionsSdkAdapter.processRequest(): ${errorCode} ERROR - ${err.toString()}`);
            res.status(errorCode);
            res.send(err.toString());
            res.end();
            throw err;
        });
    }
    sendActivity(activities) {
        return new Promise((resolve, reject) => {
            const responses = [];
            (activities || []).forEach((activity) => {
                switch (activity.type) {
                    case botbuilder_1.ActivityTypes.Message:
                    case botbuilder_1.ActivityTypes.EndOfConversation:
                        const conversation = (activity.conversation || {});
                        const key = conversation.id + ':' + activity.replyToId;
                        if (this.responses.hasOwnProperty(key)) {
                            this.responses[key].push(activity);
                        }
                        else {
                            this.responses[key] = [activity];
                        }
                        break;
                    default:
                        console.warn(`ActionsSdkAdapter.sendActivity(): Activities of type "${activity.type}" aren't supported.`);
                        break;
                }
                responses.push({});
            });
            resolve(responses);
        });
    }
    updateActivity(activity) {
        return Promise.reject(new Error(`ActionsSdkAdapter.updateActivity(): Not supported.`));
    }
    deleteActivity(reference) {
        return Promise.reject(new Error(`ActionsSdkAdapter.deleteActivity(): Not supported.`));
    }
    createContext(request) {
        return new botbuilder_1.BotContext(this, request);
    }
    requestToActivity(request) {
        const user = request.user;
        const inputs = request.inputs;
        const activity = {};
        activity.channelId = 'google-action';
        activity.recipient = { id: this.settings.projectId, name: 'action' };
        activity.from = {
            id: user.userId,
            name: user.profile && user.profile.displayName ? user.profile.displayName : ''
        };
        activity.conversation = { id: request.conversation.conversationId, name: 'conversation', isGroup: false };
        activity.type = botbuilder_1.ActivityTypes.Message;
        activity.text = inputs.length > 0 && inputs[0].rawInputs.length > 0 ? inputs[0].rawInputs[0].query : '';
        activity.id = (ActionsSdkAdapter.nextId++).toString();
        activity.timestamp = new Date();
        activity.channelData = request;
        return activity;
    }
    combineResponses(activities) {
        let endSession = true;
        const response = {};
        activities.forEach((activity) => {
            const output = activity.text || activity.speak;
            const attachment = activity.attachments ? activity.attachments[0] : undefined;
            const channelData = activity.channelData || {};
        });
        return response;
    }
}
ActionsSdkAdapter.nextId = 0;
exports.ActionsSdkAdapter = ActionsSdkAdapter;
function parseRequest(req) {
    return new Promise((resolve, reject) => {
        if (req.body) {
            // Return clone of body
            return Promise.resolve(JSON.parse(JSON.stringify(req.body)));
        }
        else {
            let requestData = '';
            req.on('data', (chunk) => {
                requestData += chunk;
            });
            req.on('end', () => {
                try {
                    req.body = JSON.parse(requestData);
                    resolve(JSON.parse(requestData));
                }
                catch (err) {
                    reject(err);
                }
            });
        }
    });
}
//# sourceMappingURL=actionsSdkAdapter.js.map