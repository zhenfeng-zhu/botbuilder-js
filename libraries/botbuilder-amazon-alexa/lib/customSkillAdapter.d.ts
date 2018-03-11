/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotAdapter, BotContext, Promiseable, Activity, ResourceResponse, ConversationReference } from 'botbuilder';
import * as schema from './schema';
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
export declare class CustomSkillAdapter extends BotAdapter {
    private settings;
    private responses;
    /**
     * Creates a new CustomSkillAdapter instance.
     * @param settings (optional) configuration settings for the adapter.
     */
    constructor(settings?: Partial<CustomSkillAdapterSettings>);
    processRequest(req: WebRequest, res: WebResponse, logic: (context: BotContext) => Promiseable<any>): Promise<void>;
    sendActivity(activities: Partial<Activity>[]): Promise<ResourceResponse[]>;
    updateActivity(activity: Partial<Activity>): Promise<void>;
    deleteActivity(reference: Partial<ConversationReference>): Promise<void>;
    protected createContext(request: Partial<Activity>): BotContext;
    protected requestToActivity(request: schema.AlexaRequestBody): Activity;
    protected combineResponses(activities: Partial<Activity>[]): schema.AlexaResponseBody;
}
