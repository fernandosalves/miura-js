import { EventModifier } from "./event-modifiers";

export class CaptureModifier implements EventModifier {
    apply(event: Event): boolean {
        return true;
    }

    wrap(handler: EventListener): EventListener {
        return (event: Event) => {
            // Add capture option to event listener
            const options = { capture: true };
            handler(event);
            return options;
        };
    }
} 