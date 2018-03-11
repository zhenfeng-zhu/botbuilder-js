"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_1 = require("botbuilder");
const schema = require("./schema");
const verifier = require('alexa-verifier');
class CustomSkillAdapter extends botbuilder_1.BotAdapter {
    /**
     * Creates a new CustomSkillAdapter instance.
     * @param settings (optional) configuration settings for the adapter.
     */
    constructor(settings) {
        super();
        this.responses = {};
        this.settings = Object.assign({}, settings);
    }
    processRequest(req, res, logic) {
        // Parse body of request
        let errorCode = 400;
        return verifyBody(req).then((body) => {
            errorCode = 500;
            // Parse body
            const request = JSON.parse(body);
            if (typeof request !== 'object') {
                throw new Error(`Invalid JSON received`);
            }
            if (request.version !== '1.0') {
                throw new Error(`Unexpected version of "${request.version}" received.`);
            }
            // Process received activity
            const activity = this.requestToActivity(request);
            const context = this.createContext(activity);
            return this.runMiddleware(context, logic)
                .then(() => {
                const key = activity.conversation.id + ':' + activity.id;
                try {
                    const activities = this.responses[key] || [];
                    const response = this.combineResponses(activities);
                    res.send(200, response);
                    res.end();
                }
                finally {
                    if (this.responses.hasOwnProperty(key)) {
                        delete this.responses[key];
                    }
                }
            });
        }).catch((err) => {
            // Reject response with error code
            console.warn(`CustomSkillAdapter.processRequest(): ${errorCode} ERROR - ${err.toString()}`);
            res.send(errorCode, err.toString());
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
                        console.warn(`CustomSkillAdapter.sendActivity(): Activities of type "${activity.type}" aren't supported.`);
                        break;
                }
                responses.push({});
            });
            resolve(responses);
        });
    }
    updateActivity(activity) {
        return Promise.reject(new Error(`CustomSkillAdapter.updateActivity(): Not supported.`));
    }
    deleteActivity(reference) {
        return Promise.reject(new Error(`CustomSkillAdapter.deleteActivity(): Not supported.`));
    }
    createContext(request) {
        return new botbuilder_1.BotContext(this, request);
    }
    requestToActivity(request) {
        const System = request.context.System;
        const activity = {};
        activity.channelId = 'alexa.customSkill';
        activity.serviceUrl = `${System.apiEndpoint}?token=${System.apiAccessToken}`;
        activity.recipient = { id: System.application.applicationId, name: 'skill' };
        activity.from = { id: System.user.userId, name: 'user' };
        activity.conversation = { id: System.application.applicationId + ':' + System.user.userId, name: 'conversation', isGroup: false };
        activity.type = request.request.type;
        activity.id = request.request.requestId;
        activity.timestamp = new Date(request.request.timestamp);
        activity.locale = request.request.locale;
        switch (activity.type) {
            case 'IntentRequest':
                activity.value = request.request.intent;
                activity.code = request.request.dialogState;
                break;
            case 'SessionEndedRequest':
                activity.code = request.request.reason;
                activity.value = request.request.error;
                break;
        }
        activity.channelData = request;
        return activity;
    }
    combineResponses(activities) {
        let endSession = true;
        const response = { version: '1.0', response: {} };
        activities.forEach((activity) => {
            const output = activity.text || activity.speak;
            const attachment = activity.attachments ? activity.attachments[0] : undefined;
            const channelData = activity.channelData || {};
            // Check for endOfConversation
            if (activity.type === botbuilder_1.ActivityTypes.EndOfConversation) {
                response.response.shouldEndSession = true;
            }
            // Combine any text/ssml output
            if (output) {
                if (output.includes('<speak>')) {
                    // Always use the last spoken output
                    response.response.outputSpeech = {
                        type: schema.AlexaOutputSpeechType.SSML,
                        ssml: output
                    };
                }
                else if (response.response.outputSpeech && response.response.outputSpeech.text) {
                    // Append to existing text
                    response.response.outputSpeech.text += ' ' + output;
                }
                else if (!response.response.outputSpeech) {
                    // Initialize text output
                    response.response.outputSpeech = {
                        type: schema.AlexaOutputSpeechType.PlainText,
                        text: output
                    };
                }
            }
            // Set card to show in alexa app
            if (attachment) {
                switch (attachment.contentType) {
                    case botbuilder_1.CardFactory.contentTypes.heroCard:
                    case botbuilder_1.CardFactory.contentTypes.thumbnailCard:
                        const hero = attachment.content;
                        if (hero.images && hero.images.length > 0) {
                            response.response.card = {
                                type: schema.AlexaCardType.Standard,
                                image: {
                                    smallImageUrl: hero.images[0].url,
                                    largeImageUrl: hero.images.length > 1 ? hero.images[1].url : undefined
                                }
                            };
                            if (hero.title) {
                                response.response.card.title = hero.title;
                            }
                            if (hero.text) {
                                response.response.card.content = hero.text;
                            }
                        }
                        else {
                            response.response.card = { type: schema.AlexaCardType.Simple };
                            if (hero.title) {
                                response.response.card.title = hero.title;
                            }
                            if (hero.text) {
                                response.response.card.text = hero.text;
                            }
                        }
                        break;
                    case botbuilder_1.CardFactory.contentTypes.signinCard:
                        response.response.card = { type: schema.AlexaCardType.LinkAccount };
                        break;
                }
            }
            // Apply channelData overrides to response
            if (channelData.sessionAttributes) {
                // Last instance of sessionAttributes wins
                response.sessionAttributes = channelData.sessionAttributes;
            }
            if (channelData.response) {
                // Merged custom response with output response
                Object.assign(response.response, channelData.response);
            }
        });
        if (endSession) {
            response.response.shouldEndSession = true;
        }
        return response;
    }
}
exports.CustomSkillAdapter = CustomSkillAdapter;
function verifyBody(req) {
    return new Promise((resolve, reject) => {
        let requestData = '';
        req.on('data', (chunk) => {
            requestData += chunk;
        });
        req.on('end', () => {
            try {
                const certUrl = req.headers["signaturecertchainurl"] || '';
                const signature = req.headers["signature"] || '';
                verifier(certUrl, signature, requestData, (err) => {
                    if (!err) {
                        resolve(requestData);
                    }
                    else {
                        reject(new Error(err.toString()));
                    }
                });
            }
            catch (err) {
                reject(err);
            }
        });
    });
}
//# sourceMappingURL=customSkillAdapter.js.map