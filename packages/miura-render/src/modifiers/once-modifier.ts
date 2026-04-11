import { EventModifier } from "./event-modifiers";

export class OnceModifier implements EventModifier {
    private hasRun = false;

    apply(event: Event): boolean {
        if (this.hasRun) return false;
        this.hasRun = true;
        return true;
    }
} 