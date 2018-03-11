"use strict";
/**
 * @module botbuilder-amazon-alexa
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlexaPlayerActivity = {
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
exports.AlexaOutputSpeechType = {
    /** Indicates that the output speech is defined as plain text. */
    PlainText: 'PlainText',
    /** Indicates that the output speech is text [marked up with SSML](https://developer.amazon.com/docs/custom-skills/speech-synthesis-markup-language-ssml-reference.html). */
    SSML: 'SSML'
};
exports.AlexaCardType = {
    /** A card that contains a title and plain text content. */
    Simple: 'Simple',
    /** A card that contains a title, text content, and an image to display. */
    Standard: 'Standard',
    /** A card that displays a link to an authorization URL that the user can use to link their Alexa account with a user in another system. */
    LinkAccount: 'LinkAccount'
};
exports.AlexaDialogState = {
    STARTED: 'STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED'
};
exports.AlexaConfirmationState = {
    NONE: 'NONE',
    CONFIRMED: 'CONFIRMED',
    DENIED: 'DENIED'
};
exports.AlexaResolutionStatusCode = {
    /** The spoken value matched a value or synonym explicitly defined in your custom slot type. */
    ER_SUCCESS_MATCH: 'ER_SUCCESS_MATCH',
    /** The spoken value did not match any values or synonyms explicitly defined in your custom slot type. */
    ER_SUCCESS_NO_MATCH: 'ER_SUCCESS_NO_MATCH',
    /** An error occurred due to a timeout. */
    ER_ERROR_TIMEOUT: 'ER_ERROR_TIMEOUT',
    /** An error occurred due to an exception during processing. */
    ER_ERROR_EXCEPTION: 'ER_ERROR_EXCEPTION'
};
exports.AlexaSessionEndRequestReason = {
    /** The user explicitly ended the session. */
    USER_INITIATED: 'USER_INITIATED',
    /** An error occurred that caused the session to end. */
    ERROR: 'ERROR',
    /** The user either did not respond or responded with an utterance that did not match any of the intents defined in your voice interface. */
    EXCEEDED_MAX_REPROMPTS: 'EXCEEDED_MAX_REPROMPTS'
};
//# sourceMappingURL=schema.js.map