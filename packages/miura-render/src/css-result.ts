/**
 * Represents a processed CSS result that can be applied to a component.
 * This class handles the actual CSS text and provides methods to apply it to elements.
 */
export class CSSResult {
    private styleSheet: CSSStyleSheet | null = null;
    private adoptedStyleSheets = new WeakMap<ShadowRoot, CSSStyleSheet>();

    constructor(private cssText: string) {}

    /**
     * Gets the CSS text content
     */
    toString(): string {
        return this.cssText;
    }

    /**
     * Gets or creates a CSSStyleSheet for this CSS result
     */
    private getStyleSheet(): CSSStyleSheet {
        if (!this.styleSheet) {
            this.styleSheet = new CSSStyleSheet();
            this.styleSheet.replaceSync(this.cssText);
        }
        return this.styleSheet;
    }

    /**
     * Applies the styles to a given shadow root
     */
    applyTo(shadowRoot: ShadowRoot): void {
        if (!this.adoptedStyleSheets.has(shadowRoot)) {
            const sheet = this.getStyleSheet();
            const sheets = Array.from(shadowRoot.adoptedStyleSheets);
            sheets.push(sheet);
            shadowRoot.adoptedStyleSheets = sheets;
            this.adoptedStyleSheets.set(shadowRoot, sheet);
        }
    }

    /**
     * Removes the styles from a given shadow root
     */
    removeFrom(shadowRoot: ShadowRoot): void {
        const sheet = this.adoptedStyleSheets.get(shadowRoot);
        if (sheet) {
            const sheets = Array.from(shadowRoot.adoptedStyleSheets);
            const index = sheets.indexOf(sheet);
            if (index > -1) {
                sheets.splice(index, 1);
                shadowRoot.adoptedStyleSheets = sheets;
            }
            this.adoptedStyleSheets.delete(shadowRoot);
        }
    }
}
