import { TurnContext, Frame, ChildFrame, Slot } from 'botbuilder';


export class ProfileSlot {
    private readonly profileSlot: Slot;

    constructor (parentFrame: Frame, slotName: string) {
        // Create slot for holding profile
        this.profileSlot = new Slot(parentFrame, slotName);

        // Define child frame and slots
        const childFrame = new ChildFrame(new Slot(parentFrame, slotName));
        this.name = new Slot(childFrame, 'name');
        this.age = new Slot(childFrame, 'age');
    }

    /** The users name. */
    public readonly name: Slot<string>;

    /** The users age. */
    public readonly age: Slot<number>;

    /** Deletes the users profile. */
    public delete(context: TurnContext): Promise<void> {
        return this.profileSlot.delete(context);
    }
}