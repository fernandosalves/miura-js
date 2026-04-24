import { Binding } from './binding';
import { EventModifier, EVENT_MODIFIERS } from '../../modifiers/event-modifiers';
import { debugLog } from '../../utils/debug';

export class EventBinding implements Binding {
    private handler: EventListener | null = null;
    private modifiers: EventModifier[] = [];
    private listenerOptions: AddEventListenerOptions | boolean | undefined;
    private previousValue: unknown;
    private previousContext: unknown;

    constructor(
        private element: Element,
        private eventName: string,
        modifiers: string[] = []
    ) {
        // Parse modifiers from event name (e.g., "click.prevent.stop")
        this.parseModifiers(modifiers);
        this.listenerOptions = this.getListenerOptions(modifiers);
    }

    private parseModifiers(modifiers: string[]) {
        modifiers.forEach(mod => {
            const [name, value] = mod.split(':');
            debugLog('eventBinding', 'Parsing modifier', { name, value });
            
            const modifier = EVENT_MODIFIERS[name as keyof typeof EVENT_MODIFIERS];
            if (modifier) {
                const modifierInstance = modifier(value as never);
                debugLog('eventBinding', 'Created modifier', { 
                    name, 
                    value,
                    instance: modifierInstance 
                });
                this.modifiers.push(modifierInstance);
            }
        });
    }

    private createHandler(originalHandler: EventListener): EventListener {
        let handler = originalHandler;

        // Apply modifiers in reverse order
        for (const modifier of this.modifiers) {
            if ('wrap' in modifier && typeof modifier.wrap === 'function') {
                handler = modifier.wrap(handler);
            }
        }

        return (event: Event) => {
            // Apply non-wrapping modifiers
            for (const modifier of this.modifiers) {
                if (!('wrap' in modifier)) {
                    const shouldContinue = modifier.apply(event);
                    if (!shouldContinue) return;
                }
            }

            handler(event);
        };
    }

    private getListenerOptions(modifiers: string[]): AddEventListenerOptions | undefined {
        let capture = false;
        let passive = false;

        for (const modifier of modifiers) {
            const [name] = modifier.split(':');
            if (name === 'capture') capture = true;
            if (name === 'passive') passive = true;
        }

        return capture || passive ? { capture, passive } : undefined;
    }

    setValue(value: unknown, context?: unknown): void {
        if (value === this.previousValue && context === this.previousContext) {
            return;
        }

        // Remove old handler
        if (this.handler) {
            this.element.removeEventListener(this.eventName, this.handler, this.listenerOptions);
            this.handler = null;
        }

        // Add new handler with modifiers
        if (typeof value === 'function') {
            const boundHandler = value.bind(context);
            this.handler = this.createHandler(boundHandler);
            this.element.addEventListener(this.eventName, this.handler, this.listenerOptions);
        }

        this.previousValue = value;
        this.previousContext = context;
    }

    clear(): void {
        if (this.handler) {
            this.element.removeEventListener(this.eventName, this.handler, this.listenerOptions);
            this.handler = null;
        }
        this.previousValue = undefined;
        this.previousContext = undefined;
    }

    disconnect(): void {
        this.clear();
    }
} 
