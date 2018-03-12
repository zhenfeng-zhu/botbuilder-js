/// <reference types="express" />
/**
 * @module botbuilder-google-actions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotAdapter, BotContext, Promiseable, Activity, ResourceResponse, ConversationReference } from 'botbuilder';
import * as express from 'express';
import * as schema from './schema';
export interface ActionsSdkAdapterSettings {
    projectId: string;
}
export interface ActionContext extends BotContext {
    /** State information persisted for the user. Max data size is 10k bytes. */
    userStorage: {
        [key: string]: any;
    };
    /** State information persisted for the duration of the conversation. Max data size is 10k bytes. */
    conversationToken: {
        [key: string]: any;
    };
}
export declare class ActionsSdkAdapter extends BotAdapter {
    static nextId: number;
    private settings;
    private responses;
    /**
     * Creates a new ActionsSdkAdapter instance.
     * @param settings Configuration settings for the adapter.
     */
    constructor(settings: ActionsSdkAdapterSettings);
    processRequest(req: express.Request, res: express.Response, logic: (context: ActionContext) => Promiseable<any>): Promise<void>;
    sendActivity(activities: Partial<Activity>[]): Promise<ResourceResponse[]>;
    updateActivity(activity: Partial<Activity>): Promise<void>;
    deleteActivity(reference: Partial<ConversationReference>): Promise<void>;
    protected createContext(request: Partial<Activity>): ActionContext;
    protected requestToActivity(request: schema.GoogleAppRequest): Activity;
    protected combineResponses(activities: Partial<Activity>[]): schema.GoogleAppResponse;
}
