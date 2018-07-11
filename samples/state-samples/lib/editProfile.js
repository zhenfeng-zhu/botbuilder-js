"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
class EditProfile extends botbuilder_dialogs_1.DialogContainer {
    constructor(profileSlot) {
        super('edit');
        this.dialogs.add('editName', new EditName(profileSlot.name));
        this.dialogs.add('editAge', new EditAge(profileSlot.age));
        this.dialogs.add('edit', [
            function (dc) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield dc.begin('editName');
                });
            },
            function (dc) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield dc.begin('editAge');
                });
            }
            // Automatically ends after last step
        ]);
    }
}
exports.EditProfile = EditProfile;
class EditName extends botbuilder_dialogs_1.DialogContainer {
    constructor(nameSlot) {
        super('edit');
        this.dialogs.add('edit', [
            function (dc, args, next) {
                return __awaiter(this, void 0, void 0, function* () {
                    const name = yield nameSlot.get(dc.context);
                    if (name && name.length > 0) {
                        yield dc.begin('confirmPrompt', `Your name is currently set to '${name}'. Would you like to change it?`);
                    }
                    else {
                        next(true);
                    }
                });
            },
            function (dc, change) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (change) {
                        yield dc.begin('namePrompt', `What is your name?`);
                    }
                    else {
                        yield dc.end();
                    }
                });
            },
            function (dc, name) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield nameSlot.set(dc.context, name);
                    yield dc.end();
                });
            }
        ]);
        this.dialogs.add('confirmPrompt', new botbuilder_dialogs_1.ConfirmPrompt());
        this.dialogs.add('namePrompt', new botbuilder_dialogs_1.TextPrompt());
    }
}
class EditAge extends botbuilder_dialogs_1.DialogContainer {
    constructor(ageSlot) {
        super('edit');
        this.dialogs.add('edit', [
            function (dc, args, next) {
                return __awaiter(this, void 0, void 0, function* () {
                    const age = yield ageSlot.get(dc.context);
                    if (typeof age === 'number') {
                        yield dc.begin('confirmPrompt', `Your age is currently set to '${age.toString()}'. Would you like to change it?`);
                    }
                    else {
                        next(true);
                    }
                });
            },
            function (dc, change) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (change) {
                        yield dc.begin('agePrompt', `How old are you?`);
                    }
                    else {
                        yield dc.end();
                    }
                });
            },
            function (dc, age) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield ageSlot.set(dc.context, age);
                    yield dc.end();
                });
            }
        ]);
        this.dialogs.add('confirmPrompt', new botbuilder_dialogs_1.ConfirmPrompt());
        this.dialogs.add('agePrompt', new botbuilder_dialogs_1.NumberPrompt());
    }
}
