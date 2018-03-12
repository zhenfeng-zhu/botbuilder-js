/**
 * @module botbuilder-google-actions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export interface GoogleAppRequest {
    user: GoogleUser;
    device: GoogleDevice;
    surface: GoogleSurface;
    conversation: GoogleConversation;
    inputs: GoogleInput[];
    isInSandbox: boolean;
}
export interface GoogleUser {
    userId: string;
    profile: GoogleUserProfile;
    accessToken: string;
    permissions: string[];
    lastSeen: string;
    userStorage: string;
}
export declare const GooglePermission: {
    UNSPECIFIED_PERMISSION: string;
    NAME: string;
    DEVICE_PRECISE_LOCATION: string;
    DEVICE_COARSE_LOCATION: string;
    UPDATE: string;
};
export interface GoogleUserProfile {
    displayName: string;
    givenName: string;
    familyName: string;
}
export interface GoogleDevice {
    location: GoogleLocation;
}
export interface GoogleLocation {
    coordinates: {
        latitude: number;
        longitude: number;
    };
    formattedAddress: string;
    zipCode: string;
    city: string;
    postalAddress: GooglePostalAddress;
    name: string;
    phoneNumber: string;
    notes: string;
}
export interface GooglePostalAddress {
    revision: number;
    regionCode: string;
    languageCode: string;
    postalCode: string;
    sortingCode: string;
    administrativeArea: string;
    locality: string;
    sublocality: string;
    addressLines: string[];
    recipients: string[];
    organization: string;
}
export interface GoogleSurface {
    capabilities: GoogleCapability[];
}
export interface GoogleCapability {
    name: string;
}
export interface GoogleConversation {
    conversationId: string;
    type: string;
    conversationToken: string;
}
export declare const GoogleConversationType: {
    TYPE_UNSPECIFIED: string;
    NEW: string;
    ACTIVE: string;
};
export interface GoogleInput {
    rawInputs: GoogleRawInput[];
    intent: string;
    arguments: GoogleArgument[];
}
export interface GoogleRawInput {
    inputType: string;
    query: string;
}
export declare const GoogleInputType: {
    UNSPECIFIED_INPUT_TYPE: string;
    TOUCH: string;
    VOICE: string;
    KEYBOARD: string;
};
export interface GoogleArgument {
    name: string;
    rawText: string;
    textValue: string;
    boolValue?: boolean;
    datetimeValue?: GoogleDateTime;
    extension?: any;
}
export interface GoogleDateTime {
    date: {
        year: number;
        month: number;
        day: number;
    };
    time: {
        hours: number;
        minutes: number;
        seconds: number;
        nanos: number;
    };
}
export interface GoogleAppResponse {
    conversationToken: string;
    userStorage?: string;
    resetUserStorage?: boolean;
    expectUserResponse?: boolean;
    expectedInputs: GoogleExpectedInput[];
    finalResponse: GoogleFinalResponse;
    customPushMessage: GoogleCustomPushMessage;
    isInSandbox: boolean;
}
export interface GoogleExpectedInput {
    inputPrompt: GoogleInputPrompt;
}
export interface GoogleInputPrompt {
    richInitialPrompt: GoogleRichResponse;
}
export interface GoogleRichResponse {
    items: GoogleItem[];
    suggestions: GoogleSuggestion[];
    linkOutSuggestion: GoogleLinkOutSuggestion[];
}
export interface GoogleSuggestion {
    title: string;
}
export interface GoogleLinkOutSuggestion {
    destinationName: string;
    url: string;
}
export interface GoogleFinalResponse {
    richResponse: GoogleRichResponse;
}
export interface GoogleCustomPushMessage {
    target: GoogleTarget;
    orderUpdate?: any;
    userNotification?: GoogleUserNotification;
}
export interface GoogleTarget {
    userId: string;
    intent: string;
    argument: GoogleArgument;
}
export interface GoogleItem {
    simpleResponse?: GoogleSimpleResponse;
    basicCard?: GoogleBasicCard;
    structuredResponse?: GoogleStructuredResponse;
}
export interface GoogleSimpleResponse {
    textToSpeech: string;
    ssml: string;
    displayText?: string;
}
export interface GoogleBasicCard {
    title: string;
    subtitle: string;
    formattedText: string;
    image: GoogleImage;
    buttons: GoogleButton[];
    imageDisplayOptions: string;
}
export declare const GoogleImageDisplayOptions: {
    DEFAULT: string;
    WHITE: string;
    CROPPED: string;
};
export interface GoogleStructuredResponse {
    orderUpdate: any;
}
export interface GoogleUserNotification {
    title: string;
    text: string;
}
export interface GoogleImage {
    url: string;
    accessibilityText: string;
    height?: number;
    width?: number;
}
export interface GoogleButton {
    title: string;
    openUrlAction: {
        url: string;
    };
}
