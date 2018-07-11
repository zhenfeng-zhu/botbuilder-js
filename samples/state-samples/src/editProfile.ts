import { ReadWriteSlot, ChildFrame, Slot } from 'botbuilder';
import { DialogContainer, ConfirmPrompt, TextPrompt, NumberPrompt } from 'botbuilder-dialogs';
import { ProfileSlot } from './profileSlot';

export class EditProfile extends DialogContainer {
    constructor(profileSlot: ProfileSlot) {
        super('edit');

        this.dialogs.add('editName', new EditName(profileSlot.name));
        this.dialogs.add('editAge', new EditAge(profileSlot.age));

        this.dialogs.add('edit', [
            async function (dc) {
                await dc.begin('editName');
            },
            async function (dc) {
                await dc.begin('editAge');
            }

            // Automatically ends after last step
        ]);
    }

}

class EditName extends DialogContainer {
    constructor(nameSlot: ReadWriteSlot<string>) {
        super('edit');

        this.dialogs.add('edit', [
            async function (dc, args, next) {
                const name = await nameSlot.get(dc.context);
                if (name && name.length > 0) {
                    await dc.begin('confirmPrompt', `Your name is currently set to '${name}'. Would you like to change it?`)
                } else {
                    next(true);
                }
            },
            async function (dc, change: boolean) {
                if (change) {
                    await dc.begin('namePrompt', `What is your name?`);
                } else {
                    await dc.end();
                }
            },
            async function (dc, name: string) {
                await nameSlot.set(dc.context, name);
                await dc.end();
            }
        ]);

        this.dialogs.add('confirmPrompt', new ConfirmPrompt());
        this.dialogs.add('namePrompt', new TextPrompt());
    }
}

class EditAge extends DialogContainer {
    constructor(ageSlot: ReadWriteSlot<number>) {
        super('edit');

        this.dialogs.add('edit', [
            async function (dc, args, next) {
                const age = await ageSlot.get(dc.context);
                if (typeof age === 'number') {
                    await dc.begin('confirmPrompt', `Your age is currently set to '${age.toString()}'. Would you like to change it?`)
                } else {
                    next(true);
                }
            },
            async function (dc, change: boolean) {
                if (change) {
                    await dc.begin('agePrompt', `How old are you?`);
                } else {
                    await dc.end();
                }
            },
            async function (dc, age: number) {
                await ageSlot.set(dc.context, age);
                await dc.end();
            }
        ]);

        this.dialogs.add('confirmPrompt', new ConfirmPrompt());
        this.dialogs.add('agePrompt', new NumberPrompt());
    }
}