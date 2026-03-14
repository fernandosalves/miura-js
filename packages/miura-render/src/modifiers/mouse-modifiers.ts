import { EventModifier } from "./event-modifiers";

export class MouseButtonModifier implements EventModifier {
    private buttonMap = {
        'left': 0,
        'middle': 1,
        'right': 2
    };

    constructor(private button: keyof typeof this.buttonMap) {}

    apply(event: MouseEvent): boolean {
        return event.button === this.buttonMap[this.button];
    }
} 