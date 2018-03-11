/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { 
    BotAdapter, BotContext, Promiseable, ActivityTypes, Activity, ResourceResponse,
    ChannelAccount, ConversationReference, CardFactory, HeroCard, SigninCard
} from 'botbuilder';
import * as schema from './schema';
const verifier = require('alexa-verifier');

/** 
 * :package: **botbuilder-core**
 * 
 * Express or Restify Request object. 
 */
export interface WebRequest {
    body?: any;
    headers: any;
    on(event: string, ...args: any[]): any;
}

/** 
 * :package: **botbuilder-core**
 * 
 * Express or Restify Response object. 
 */
export interface WebResponse {
    end(...args: any[]): any;
    send(status: number, body?: any): any;
}

export interface CustomSkillAdapterSettings {
}

export class CustomSkillAdapter extends BotAdapter {
    private settings: CustomSkillAdapterSettings;
    private responses: { [key: string]: Partial<Activity>[]; } = {};

    /**
     * Creates a new CustomSkillAdapter instance.
     * @param settings (optional) configuration settings for the adapter.
     */
    constructor(settings?: Partial<CustomSkillAdapterSettings>) {
        super();
        this.settings = Object.assign({}, settings);
    }

    public processRequest(req: WebRequest, res: WebResponse, logic: (context: BotContext) => Promiseable<any>): Promise<void> {
        // Parse body of request
        let errorCode = 400;
        return verifyBody(req).then((body) => {
            errorCode = 500;

            // Parse body
            const request = JSON.parse(body) as schema.AlexaRequestBody;
            if (typeof request !== 'object') { throw new Error(`Invalid JSON received`) }
            if (request.version !== '1.0') { throw new Error(`Unexpected version of "${request.version}" received.`) }

            // Process received activity
            const activity = this.requestToActivity(request);
            const context = this.createContext(activity);
            return this.runMiddleware(context, logic as any)
                .then(() => {
                    const key = activity.conversation.id + ':' + activity.id; 
                    try {
                        const activities = this.responses[key] || [];
                        const response = this.combineResponses(activities);
                        res.send(200, response);
                        res.end();
                    } finally {
                        if (this.responses.hasOwnProperty(key)) { delete this.responses[key] }
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

    public sendActivity(activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        return new Promise((resolve, reject) => {
            const responses: ResourceResponse[] = [];
            (activities || []).forEach((activity) => {
                switch (activity.type) {
                    case ActivityTypes.Message:
                    case ActivityTypes.EndOfConversation:
                        const conversation = (activity.conversation || {}) as ChannelAccount;
                        const key = conversation.id + ':' + activity.replyToId;
                        if (this.responses.hasOwnProperty(key)) { 
                            this.responses[key].push(activity); 
                        } else {
                            this.responses[key] = [activity]; 
                        }
                        break;
                    default:
                        console.warn(`CustomSkillAdapter.sendActivity(): Activities of type "${activity.type}" aren't supported.`);
                        break;
                }
                responses.push({} as ResourceResponse);
            });
            resolve(responses);
        });
    }

    public updateActivity(activity: Partial<Activity>): Promise<void> {
        return Promise.reject(new Error(`CustomSkillAdapter.updateActivity(): Not supported.`));
    }

    public deleteActivity(reference: Partial<ConversationReference>): Promise<void> {
        return Promise.reject(new Error(`CustomSkillAdapter.deleteActivity(): Not supported.`));
    }

    protected createContext(request: Partial<Activity>): BotContext {
        return new BotContext(this as any, request);
    }

    protected requestToActivity(request: schema.AlexaRequestBody): Activity {
        const System = request.context.System;
        const activity: Partial<Activity> = {};
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
                activity.value = (request.request as schema.AlexaIntentRequest).intent;
                activity.code = (request.request as schema.AlexaIntentRequest).dialogState;
                break;
            case 'SessionEndedRequest':
                activity.code = (request.request as schema.AlexaSessionEndRequest).reason;
                activity.value = (request.request as schema.AlexaSessionEndRequest).error;
                break;
        }
        activity.channelData = request;
        return activity as Activity;
    }

    protected combineResponses(activities: Partial<Activity>[]): schema.AlexaResponseBody {
        let endSession = true;
        const response: schema.AlexaResponseBody = { version: '1.0', response: {} };
        activities.forEach((activity) => {
            const output = activity.text || activity.speak;
            const attachment = activity.attachments ? activity.attachments[0] : undefined;
            const channelData: Partial<schema.AlexaResponseBody> = activity.channelData || {};
            
            // Check for endOfConversation
            if (activity.type === ActivityTypes.EndOfConversation) { response.response.shouldEndSession = true }

            // Combine any text/ssml output
            if (output) {
                if (output.includes('<speak>')) {
                    // Always use the last spoken output
                    response.response.outputSpeech = { 
                        type: schema.AlexaOutputSpeechType.SSML,
                        ssml: output 
                    };
                } else if (response.response.outputSpeech && response.response.outputSpeech.text) {
                    // Append to existing text
                    response.response.outputSpeech.text += ' ' + output;
                } else if (!response.response.outputSpeech) {
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
                    case CardFactory.contentTypes.heroCard:
                    case CardFactory.contentTypes.thumbnailCard:
                        const hero = attachment.content as HeroCard;
                        if (hero.images && hero.images.length > 0) {
                            response.response.card = { 
                                type: schema.AlexaCardType.Standard,
                                image: {
                                    smallImageUrl: hero.images[0].url,
                                    largeImageUrl: hero.images.length > 1 ? hero.images[1].url : undefined
                                } 
                            };
                            if (hero.title) { response.response.card.title = hero.title }
                            if (hero.text) { response.response.card.content = hero.text }
                        } else {
                            response.response.card = { type: schema.AlexaCardType.Simple };
                            if (hero.title) { response.response.card.title = hero.title }
                            if (hero.text) { response.response.card.text = hero.text }
                        }
                        break;
                    case CardFactory.contentTypes.signinCard:
                        response.response.card = { type: schema.AlexaCardType.LinkAccount }
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
        if (endSession) { response.response.shouldEndSession = true }
        return response;
    }
}


function verifyBody(req: WebRequest): Promise<string> {
    return new Promise((resolve, reject) => {
        let requestData = '';
        req.on('data', (chunk: string) => {
            requestData += chunk
        });
        req.on('end', () => {
            try {
                const certUrl = req.headers["signaturecertchainurl"] || '';
                const signature = req.headers["signature"] || '';
                verifier(certUrl, signature, requestData, (err: any) => {
                    if (!err) {
                        resolve(requestData);
                    } else {
                        reject(new Error(err.toString()));
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    });
} 



