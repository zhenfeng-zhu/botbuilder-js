import { BotFrameworkAdapter, MemoryStorage, UserFrame, ConversationFrame, FrameManagerMiddleware, Slot } from 'botbuilder';
import { DialogSet } from 'botbuilder-dialogs';
import * as restify from 'restify';

import { Profile, EditProfile } from './editProfile';
import { InspectCount } from './inspectCount';


// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter( { 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

// Add frames for managing state
const storage = new MemoryStorage();
const userFrame = new UserFrame(storage);
const convoFrame = new ConversationFrame(storage);
adapter.use(new FrameManagerMiddleware(convoFrame));

// Define slots
const profileSlot = new Slot<Profile>(userFrame, 'profile');
const dialogStack = new Slot(convoFrame, 'dialogStack', {});
const countSlot = new Slot<number>(convoFrame, {
    name: 'count',
    defaultValue: 0,
    expireAfterSeconds: 10
});

// Create empty dialog set
const dialogs = new DialogSet();

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === 'message') {
            // Create dialog context and continue executing the "current" dialog, if any.
            const stack = await dialogStack.get(context);
            const dc = dialogs.createContext(context, stack);
            
            // check for interruptions
            const utterance = context.activity.text.trim().toLowerCase();
            switch (utterance) {
                case 'inspect':
                    await dc.endAll().begin('inspectCount');
                    break;
                case 'profile':
                    await dc.endAll().begin('editProfile');
                    break;
            }

            // If we didn't have an interruption try running current dialog
            if (!context.responded) {
                await dc.continue();
            }

            // If no interruption or current dialog then start echo dialog
            if (!context.responded) {
                await dc.begin('echo');
            }
        }
    });
});

// Local usage of count slot
dialogs.add('echo', [
    async function (dc) {
        let count = await countSlot.get(dc.context);
        await dc.context.sendActivity(`${++count}: You said "${dc.context.activity.text}"`);
        await countSlot.set(dc.context, count);
        await dc.end();
    }
]);

// Read-only count slot bound to a dialog container
dialogs.add('inspectCount', new InspectCount(countSlot.asReadOnly()));

// Profile slot bound to a dialog container
dialogs.add('editProfile', new EditProfile(profileSlot));