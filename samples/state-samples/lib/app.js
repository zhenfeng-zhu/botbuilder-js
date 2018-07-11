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
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const restify = require("restify");
const profileSlot_1 = require("./profileSlot");
const editProfile_1 = require("./editProfile");
const inspectCount_1 = require("./inspectCount");
// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});
// Create adapter
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
// Add frames for managing state
const storage = new botbuilder_1.MemoryStorage();
const userFrame = new botbuilder_1.UserFrame(storage);
const convoFrame = new botbuilder_1.ConversationFrame(storage);
adapter.use(new botbuilder_1.FrameManagerMiddleware(convoFrame));
// Define slots
const dialogStack = new botbuilder_1.Slot(convoFrame, 'dialogStack', {});
const countSlot = new botbuilder_1.Slot(convoFrame, {
    name: 'count',
    defaultValue: 0,
    expireAfterSeconds: 10
});
const profileSlot = new profileSlot_1.ProfileSlot(userFrame, 'profile');
// Create empty dialog set
const dialogs = new botbuilder_dialogs_1.DialogSet();
// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
        if (context.activity.type === 'message') {
            // Create dialog context and continue executing the "current" dialog, if any.
            const stack = yield dialogStack.get(context);
            const dc = dialogs.createContext(context, stack);
            // check for interruptions
            const utterance = context.activity.text.trim().toLowerCase();
            switch (utterance) {
                case 'inspect':
                    yield dc.endAll().begin('inspectCount');
                    break;
                case 'profile':
                    yield dc.endAll().begin('editProfile');
                    break;
            }
            // If we didn't have an interruption try running current dialog
            if (!context.responded) {
                yield dc.continue();
            }
            // If no interruption or current dialog then start echo dialog
            if (!context.responded) {
                yield dc.begin('echo');
            }
        }
    }));
});
// Local usage of count slot
dialogs.add('echo', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            let count = yield countSlot.get(dc.context);
            yield dc.context.sendActivity(`${++count}: You said "${dc.context.activity.text}"`);
            yield countSlot.set(dc.context, count);
            yield dc.end();
        });
    }
]);
// Read-only count slot bound to a dialog container
dialogs.add('inspectCount', new inspectCount_1.InspectCount(countSlot.asReadOnly()));
// Profile slot bound to a dialog container
dialogs.add('editProfile', new editProfile_1.EditProfile(profileSlot));
