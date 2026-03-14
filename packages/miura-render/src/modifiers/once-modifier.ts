import { EventModifier } from "./event-modifiers";

export class OnceModifier implements EventModifier {
    private hasRun = false;

    apply(event: Event): boolean {
        console.log('OnceModifier:', { hasRun: this.hasRun });
        if (this.hasRun) return false;
        this.hasRun = true;
        return true;
    }
} 