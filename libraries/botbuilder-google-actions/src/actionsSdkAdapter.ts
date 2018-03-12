/**
 * @module botbuilder-google-actions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { 
    BotAdapter, BotContext, Promiseable, ActivityTypes, Activity, ResourceResponse,
    ChannelAccount, ConversationReference, CardFactory, HeroCard, SigninCard
} from 'botbuilder';
import { ActionsSdkApp } from 'actions-on-google';
import * as express from 'express';
import * as schema from './schema';


export interface ActionsSdkAdapterSettings {
    projectId: string;
}

export interface ActionContext extends BotContext {
    /** State information persisted for the user. Max data size is 10k bytes. */
    userStorage: { [key: string]: any; };

    /** State information persisted for the duration of the conversation. Max data size is 10k bytes. */
    conversationToken: { [key: string]: any; };
}

export class ActionsSdkAdapter extends BotAdapter {
    static nextId = 0;
    private settings: ActionsSdkAdapterSettings;
    private responses: { [key: string]: Partial<Activity>[]; } = {};

    /**
     * Creates a new ActionsSdkAdapter instance.
     * @param settings Configuration settings for the adapter.
     */
    constructor(settings: ActionsSdkAdapterSettings) {
        super();
        this.settings = Object.assign({}, settings);
    }

    public processRequest(req: express.Request, res: express.Response, logic: (context: ActionContext) => Promiseable<any>): Promise<void> {
        // Parse incoming request
        let errorCode = 500;
        return parseRequest(req).then((request) => {
            // Verify incoming request
            errorCode = 400;
            const app = new ActionsSdkApp({request: req, response: res});
            return app.isRequestFromAssistant(this.settings.projectId).then(() => {
                errorCode = 500;

                // Create context object
                const activity = this.requestToActivity(request);
                const context = this.createContext(activity);

                // Add context extensions for userStorage and conversationToken
                context.userStorage = request.user.userStorage ? JSON.parse(request.user.userStorage) : {};
                context.conversationToken = request.conversation.conversationToken ? JSON.parse(request.conversation.conversationToken) : {};
    
                // Process received activity
                return this.runMiddleware(context, logic as any)
                    .then(() => {
                        const key = activity.conversation.id + ':' + activity.id; 
                        try {
                            const activities = this.responses[key] || [];
                            const response = this.combineResponses(activities, request);
                            if (response.userStorage === undefined && typeof context.userStorage === 'object') {
                                response.userStorage = JSON.stringify(context.userStorage);
                            } else if (response.resetUserStorage === undefined && request.user.userStorage) {
                                response.resetUserStorage = true;
                            }
                            if (response.conversationToken === undefined && typeof context.conversationToken === 'object') {
                                response.conversationToken = JSON.stringify(context.conversationToken);
                            }
                            res.status(200);
                            res.send(response);
                            res.end();
                        } finally {
                            if (this.responses.hasOwnProperty(key)) { delete this.responses[key] }
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
                        console.warn(`ActionsSdkAdapter.sendActivity(): Activities of type "${activity.type}" aren't supported.`);
                        break;
                }
                responses.push({} as ResourceResponse);
            });
            resolve(responses);
        });
    }

    public updateActivity(activity: Partial<Activity>): Promise<void> {
        return Promise.reject(new Error(`ActionsSdkAdapter.updateActivity(): Not supported.`));
    }

    public deleteActivity(reference: Partial<ConversationReference>): Promise<void> {
        return Promise.reject(new Error(`ActionsSdkAdapter.deleteActivity(): Not supported.`));
    }

    protected createContext(request: Partial<Activity>): ActionContext {
        return new BotContext(this as any, request) as ActionContext;
    }

    protected requestToActivity(request: schema.GoogleAppRequest): Activity {
        const user = request.user;
        const inputs = request.inputs;
        const activity: Partial<Activity> = {};
        activity.channelId = 'google-action';
        activity.recipient = { id: this.settings.projectId, name: 'action' };
        activity.from = { 
            id: user.userId,
            name: user.profile && user.profile.displayName ? user.profile.displayName : ''
        };
        activity.conversation = { id: request.conversation.conversationId, name: 'conversation', isGroup: false };
        activity.type = ActivityTypes.Message;
        activity.text = inputs.length > 0 &&  inputs[0].rawInputs.length > 0 ? inputs[0].rawInputs[0].query  : '';
        activity.id = (ActionsSdkAdapter.nextId++).toString();
        activity.timestamp = new Date();
        activity.channelData = request;
        return activity as Activity;
    }

    protected combineResponses(activities: Partial<Activity>[], request: schema.GoogleAppRequest): schema.GoogleAppResponse {
        let endSession = true;
        const response = {
            expectUserResponse: true,
            expectedInputs: [{
                
            }]
        } as schema.GoogleAppResponse;
        activities.forEach((activity) => {
            const output = activity.text || activity.speak;
            const attachment = activity.attachments ? activity.attachments[0] : undefined;
            const channelData: Partial<schema.GoogleAppResponse> = activity.channelData || {};


        });
        return response;
    }
}

function parseRequest(req: express.Request): Promise<schema.GoogleAppRequest> {
    return new Promise((resolve, reject) => {
        if (req.body) {
            // Return clone of body
            return Promise.resolve(JSON.parse(JSON.stringify(req.body)));
        } else {
            let requestData = '';
            req.on('data', (chunk: string) => {
                requestData += chunk
            });
            req.on('end', () => {
                try {
                    req.body = JSON.parse(requestData);
                    resolve(JSON.parse(requestData));
                } catch (err) {
                    reject(err);
                }
            });
        }
    });
} 

