import { EventModifier } from "./event-modifiers";

export class KeyModifier implements EventModifier {
    private keyMap: Record<string, string> = {
        'enter': 'Enter',
        'escape': 'Escape',
        'space': ' '
    };

    constructor(private key: string) {
        if (!key) {
            throw new Error('Key must be specified for KeyModifier');
        }
    }

    apply(event: Event): boolean {
        if (!(event instanceof KeyboardEvent)) {
            return false;
        }

        const targetKey = this.keyMap[this.key.toLowerCase()] || this.key;
        const eventKey = event.key;

        return eventKey === targetKey;
    }
} 