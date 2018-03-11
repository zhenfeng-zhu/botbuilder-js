/**
 * @module botbuilder-amazon-alexa
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export interface AlexaRequestBody {
    /** The version specifier for the request. */
    version: string;

    /** The session object provides additional context associated with the request. */
    session: AlexaSession;

    /** The context object provides your skill with information about the current state of the Alexa service and device at the time the request is sent to your service.  */
    context: AlexaContext;

    /** A request object that provides the details of the user's request.  */
    request: AlexaLaunchRequest|AlexaIntentRequest|AlexaSessionEndRequest;
}

export interface AlexaSession {
    /** A boolean value indicating whether this is a new session. */
    new: boolean;

    /** A string that represents a unique identifier per a user's active session. */
    sessionId: string;

    /** A map of key-value pairs. */
    attributes: { [key:string]: any; };

    /** An object containing an application ID. This is used to verify that the request was intended for your service. */
    application: AlexaApplication;

    /** An object that describes the user making the request. */
    user: AlexaUser;
}

export interface AlexaContext {
    /** An object that provides information about the current state of the Alexa service and the device interacting with your skill. */
    System: AlexaSystem;

    /** An object providing the current state for the AudioPlayer interface. */
    AudioPlayer: AlexaAudioPlayer;
}

export interface AlexaSystem {
    /** A token that can be used to access Alexa-specific APIs. */
    apiAccessToken: string;

    /** A string that references the correct base URI to refer to by region, for use with APIs such as the `Device Location API` and `Progressive Response API`. */
    apiEndpoint: string;

    /** An object containing an application ID. This is used to verify that the request was intended for your service. */
    application: AlexaApplication;

    /** An object providing information about the device used to send the request. */
    device: AlexaDevice;

    /** An object that describes the user making the request. */
    user: AlexaUser;
}

export interface AlexaApplication {
    /**  A string representing the application ID for your skill. */
    applicationId: string;
}

export interface AlexaDevice {
    /** The deviceId property uniquely identifies the device. */
    deviceId: string;

    /** The supportedInterfaces property lists each interface that the device supports. */
    supportedInterfaces: { [key:string]: any; };
}

export interface AlexaUser {
    /** A string that represents a unique identifier for the user who made the request. The userId is automatically generated when a user enables the skill in the Alexa app. */
    userId: string;

    /** A token identifying the user in another system. */
    accessToken?: string;
}

export interface AlexaAudioPlayer {
    /** An opaque token that represents the audio stream described by this AudioPlayer object. */
    token: string;

    /** Identifies a track's offset in milliseconds at the time the request was sent. This is 0 if the track is at the beginning. */
    offsetInMilliseconds?: number;

    /** Indicates the last known state of audio playback. */
    playerActivity: string;
}

export const AlexaPlayerActivity = {
    /** Nothing was playing, no enqueued items. */
    IDLE: 'IDLE',

    /** Stream was paused. */
    PAUSED: 'PAUSED',

    /** Stream was playing. */
    PLAYING: 'PLAYING',

    /** Buffer underrun. */
    BUFFER_UNDERRUN: 'BUFFER_UNDERRUN',

    /** Stream was finished playing. */
    FINISHED: 'FINISHED',

    /** Stream was interrupted. */
    STOPPED: 'STOPPED'
};

export interface AlexaResponseBody {
    /** The version specifier for the response. Must be set to "1.0". */
    version: string;

    /** (Optional) map of key-value pairs to persist in the session. */
    sessionAttributes?: { [key: string]: any; };

    /** A response object that defines what to render to the user and whether to end the current session. */
    response: AlexaResponse;
}

export interface AlexaResponse {
    /** (Optional) object containing the speech to render to the user. */
    outputSpeech?: AlexaOutputSpeech;

    /** (Optional) object containing a card to render to the Amazon Alexa App. */
    card?: AlexaCard;

    /** (Optional) object containing the outputSpeech to use if a re-prompt is necessary. */
    reprompt?: {
        outputSpeech: AlexaOutputSpeech;
    };

    /** (Optional) boolean value with `true` meaning that the session should end after Alexa speaks the response, or `false` if the session should remain active. If not provided, defaults to `true`. */
    shouldEndSession?: boolean;

    /** (Optional) array of directives specifying device-level actions to take using a particular interface, such as the `AudioPlayer` interface for streaming audio. */
    directives?: any[];
}

export interface AlexaOutputSpeech {
    /** A string containing the type of output speech to render. */
    type: string;

    /** A string containing the speech to render to the user. Use this when [type](#type) is `PlainText`. */
    text?: string;

    /** A string containing text [marked up with SSML](https://developer.amazon.com/docs/custom-skills/speech-synthesis-markup-language-ssml-reference.html) to render to the user. Use this when [type](#type) is `SSML`. */
    ssml?: string;
}

export const AlexaOutputSpeechType = {
    /** Indicates that the output speech is defined as plain text. */
    PlainText: 'PlainText',

    /** Indicates that the output speech is text [marked up with SSML](https://developer.amazon.com/docs/custom-skills/speech-synthesis-markup-language-ssml-reference.html). */
    SSML: 'SSML'
};

export interface AlexaCard {
    /** A string describing the type of card to render. */
    type: string;

    /** (Optional) string containing the title of the card. */
    title?: string;

    /** (Optional) string containing the contents of a `Simple` card. */
    content?: string;

    /** (Optional) string containing the text content for a `Standard` card. */
    text?: string;

    /** (optional) object that specifies the URLs for the image to display on a `Standard` card.  */
    image?: {
        /** Image to use on small screens. */
        smallImageUrl?: string;

        /** Image to use on large screens. */
        largeImageUrl?: string;
    };
}

export const AlexaCardType = {
    /** A card that contains a title and plain text content. */
    Simple: 'Simple',

    /** A card that contains a title, text content, and an image to display. */
    Standard: 'Standard',

    /** A card that displays a link to an authorization URL that the user can use to link their Alexa account with a user in another system. */
    LinkAccount: 'LinkAccount'
};

export interface AlexaLaunchRequest {
    /** Describes the request type with the value as: `LaunchRequest`. */
    type: string;

    /** Provides the date and time when Alexa sent the request as an ISO 8601 formatted string. */
    timestamp: string;

    /** Represents a unique identifier for the specific request. */
    requestId: string;

    /** A string indicating the user's locale. */
    locale: string;
}

export interface AlexaIntentRequest {
    /** Describes the type of the request with the value as: `IntentRequest`. */
    type: string;

    /** Represents the unique identifier for the specific request. */
    timestamp: string;

    /** Provides the date and time when Alexa sent the request as an ISO 8601 formatted string. */
    requestId: string;

    /** Enumeration indicating the status of a multi-turn dialog. */
    dialogState?: string;

    /** An object that represents what the user wants. */
    intent: AlexaIntent;

    /** A string indicating the user's locale. */
    locale: string;
}

export const AlexaDialogState = {
    STARTED: 'STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED'
};

export interface AlexaIntent {
    /** A string representing the name of the intent. */
    name: string;

    /** An enumeration indicating whether the user has explicitly confirmed or denied the entire intent. */
    confirmationStatus: string;

    /** A map of key-value pairs that further describes what the user meant based on a predefined intent schema. */
    slots: { [key:string]: AlexaSlot; }
}

export interface AlexaSlot {
    /** A string that represents the name of the slot. */
    name: string;

    /** A string that represents the value the user spoke for the slot. This is the actual value the user spoke, not necessarily the canonical value or one of the synonyms defined for the entity. */
    value: string;

    /** An enumeration indicating whether the user has explicitly confirmed or denied the value of this slot. */
    confirmationStatus: string;

    /** A Resolutions object representing the results of resolving the words captured from the user's utterance. */
    resolutions: AlexaResolution;
}

export interface AlexaResolution {
    /** An array of objects representing each possible authority for entity resolution. An authority represents the source for the data provided for the slot. For a custom slot type, the authority is the slot type you defined. */
    resolutionsPerAuthority: AlexaResolutionAuthority[];
}

export interface AlexaResolutionAuthority {
    /** The name of the authority for the slot values. For custom slot types, this authority label incorporates your skill ID and the slot type name. */
    authority: string;

    /** An object representing the status of entity resolution for the slot. */
    status: {
        /** A code indicating the results of attempting to resolve the user utterance against the defined slot types. */
        code: string;
    };

    /** An array of resolved values for the slot. */
    values: AlexaResolvedValue[];
}

export interface AlexaResolvedValue {
    /** An object representing the resolved value for the slot, based on the user's utterance and the slot type definition. */
    value: {
        /** The string for the resolved slot value. */
        name: string;

        /** The unique ID defined for the resolved slot value.  */
        id: string;
    }
}

export const AlexaConfirmationState = {
    NONE: 'NONE',
    CONFIRMED: 'CONFIRMED',
    DENIED: 'DENIED'
};

export const AlexaResolutionStatusCode = {
    /** The spoken value matched a value or synonym explicitly defined in your custom slot type. */
    ER_SUCCESS_MATCH: 'ER_SUCCESS_MATCH',

    /** The spoken value did not match any values or synonyms explicitly defined in your custom slot type. */
    ER_SUCCESS_NO_MATCH: 'ER_SUCCESS_NO_MATCH',

    /** An error occurred due to a timeout. */
    ER_ERROR_TIMEOUT: 'ER_ERROR_TIMEOUT',

    /** An error occurred due to an exception during processing. */
    ER_ERROR_EXCEPTION: 'ER_ERROR_EXCEPTION'
};

export interface AlexaSessionEndRequest {
    /** Describes the type of the request with the value as: `SessionEndedRequest`. */
    type: string;

    /** Represents the unique identifier for the specific request. */
    requestId: string;

    /** Provides the date and time when Alexa sent the request as an ISO 8601 formatted string. */
    timestamp: string;

    /** Describes why the session ended.  */
    reason: string;

    /** A string indicating the user's locale. */
    locale: string;

    /** An error object providing more information about the error that occurred. */
    error?: {
        /** A string indicating the type of error that occurred. */
        type: string;

        /** A string providing more information about the error. */
        message: string;
    }
}

export const AlexaSessionEndRequestReason = {
    /** The user explicitly ended the session. */
    USER_INITIATED: 'USER_INITIATED',

    /** An error occurred that caused the session to end. */
    ERROR: 'ERROR',

    /** The user either did not respond or responded with an utterance that did not match any of the intents defined in your voice interface. */
    EXCEEDED_MAX_REPROMPTS: 'EXCEEDED_MAX_REPROMPTS'
};
