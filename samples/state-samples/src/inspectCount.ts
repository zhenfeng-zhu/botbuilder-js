import { ReadOnlySlot } from 'botbuilder';
import { DialogContainer } from 'botbuilder-dialogs';

export class InspectCount extends DialogContainer {
    constructor(private countSlot: ReadOnlySlot<number>) {
        super('inspect');

        this.dialogs.add('inspect', [
            async function (dc) {
                const count = await this.countSlot.get(dc.context);
                await dc.context.sendActivity(`Count is currently: ${count}`);
                await dc.end();
            }
        ]);
    }

}