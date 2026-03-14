import { EventModifier } from "./event-modifiers";

export class PassiveModifier implements EventModifier {
    apply(event: Event): boolean {
        return true;
    }

    wrap(handler: EventListener): EventListener {
        return (event: Event) => {
            // Add passive option to event listener
            const options = { passive: true };
            handler(event);
            return options;
        };
    }
} 