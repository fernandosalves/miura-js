import { KeyModifier } from "./key-modifiers";
import { OnceModifier } from "./once-modifier";
import { PassiveModifier } from "./passive-modifier";
import { CaptureModifier } from "./capture-modifier";
import { debugLog } from "../utils/debug";

export interface EventModifier {
    apply(event: Event): boolean;
}

// Add debug logging to each modifier
function logModifier(name: string, result: boolean, event: Event) {
    debugLog('modifier', `${name} modifier:`, {
        result,
        eventType: event.type,
        event
    });
    return result;
}

// Basic modifiers
export class PreventModifier implements EventModifier {
    apply(event: Event): boolean {
        event.preventDefault();
        return true;
    }
}

export class StopModifier implements EventModifier {
    apply(event: Event): boolean {
        event.stopPropagation();
        return true;
    }
}

// Time-based modifiers
export class DebounceModifier implements EventModifier {
    private timeout: number | null = null;

    constructor(private wait: number = 250) {}

    apply(event: Event): boolean {
        return true;  // Let the wrapper handle it
    }

    wrap(handler: EventListener): EventListener {
        return (event: Event) => {
            // Preserve the event and its properties
            const target = event.target as HTMLInputElement;
            const value = target.value;

            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            this.timeout = window.setTimeout(() => {
                // Create a new event with the preserved value
                const newEvent = new Event(event.type, {
                    bubbles: event.bubbles,
                    cancelable: event.cancelable
                });
                Object.defineProperty(newEvent, 'target', { value: target });
                
                handler(newEvent);
                this.timeout = null;
            }, this.wait);
        };
    }
}

export class ThrottleModifier implements EventModifier {
    private lastRun: number = 0;

    constructor(private wait: number = 250) {}

    apply(event: Event): boolean {
        return true;  // Let the wrapper handle it
    }

    wrap(handler: EventListener): EventListener {
        return (event: Event) => {
            const now = Date.now();

            // If enough time has passed since last run
            if (now - this.lastRun >= this.wait) {
                handler(event);
                this.lastRun = now;
            }
        };
    }
}

// Collection of available modifiers
export const EVENT_MODIFIERS = {
    prevent: () => new PreventModifier(),
    stop: () => new StopModifier(),
    debounce: (wait?: number) => new DebounceModifier(wait),
    throttle: (wait?: number) => new ThrottleModifier(wait),
    key: (key: string) => new KeyModifier(key),
    once: () => new OnceModifier(),
    passive: () => new PassiveModifier(),
    capture: () => new CaptureModifier()
}; 