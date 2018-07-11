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
class InspectCount extends botbuilder_dialogs_1.DialogContainer {
    constructor(countSlot) {
        super('inspect');
        this.countSlot = countSlot;
        this.dialogs.add('inspect', [
            function (dc) {
                return __awaiter(this, void 0, void 0, function* () {
                    const count = yield this.countSlot.get(dc.context);
                    yield dc.context.sendActivity(`Count is currently: ${count}`);
                    yield dc.end();
                });
            }
        ]);
    }
}
exports.InspectCount = InspectCount;
