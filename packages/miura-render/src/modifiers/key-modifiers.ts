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
        console.log('KeyModifier created with key:', key);
    }

    apply(event: Event): boolean {
        if (!(event instanceof KeyboardEvent)) {
            return false;
        }

        const targetKey = this.keyMap[this.key.toLowerCase()] || this.key;
        const eventKey = event.key;
        
        console.log('KeyModifier check:', {
            targetKey,
            eventKey,
            matches: eventKey === targetKey
        });
        
        return eventKey === targetKey;
    }
} 