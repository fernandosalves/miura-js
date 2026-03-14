import { BaseDirective } from '../directive';
import { debugLog } from '../../utils/debug';

export class SwitchDirective extends BaseDirective {
    private value: unknown = null;
    private cases: Map<string, HTMLTemplateElement> = new Map();
    private defaultCase: HTMLTemplateElement | null = null;
    private activeCase: HTMLTemplateElement | null = null;

    mount(element: Element) {
        debugLog('switch', 'Mounting switch directive');
        this.element = element;
        
        // Find all template elements and register their cases
        const templates = Array.from(element.querySelectorAll('template'));
        templates.forEach(template => {
            if (template.hasAttribute('default')) {
                this.defaultCase = template;
            } else {
                const caseValue = template.getAttribute('case');
                if (caseValue) {
                    debugLog('switch', 'Registering case', { caseValue });
                    this.cases.set(caseValue, template);
                }
            }
        });
    }

    update(value: unknown) {
        if (this.value === value) return;
        
        debugLog('switch', 'Update content', { oldValue: this.value, newValue: value });
        this.value = value;
        this.updateActiveCase();
    }

    private updateActiveCase() {
        if (!this.element) return;

        const valueStr = String(this.value);
        const newCase = this.cases.get(valueStr) || this.defaultCase;
        
        debugLog('switch', 'Updating active case', { 
            value: valueStr, 
            hasCase: !!newCase,
            availableCases: Array.from(this.cases.keys()),
            hasDefault: !!this.defaultCase
        });

        if (this.activeCase !== newCase) {
            // Remove old content
            const nonTemplates = Array.from(this.element.children)
                .filter(child => !(child instanceof HTMLTemplateElement));
            nonTemplates.forEach(child => child.remove());

            // Add new content
            if (newCase instanceof HTMLTemplateElement) {
                const content = newCase.content.cloneNode(true);
                this.element.appendChild(content);
            }

            this.activeCase = newCase;
        }
    }

    unmount() {
        if (this.element) {
            const nonTemplates = Array.from(this.element.children)
                .filter(child => !(child instanceof HTMLTemplateElement));
            nonTemplates.forEach(child => child.remove());
        }
        this.cases.clear();
        this.defaultCase = null;
        this.activeCase = null;
        this.element = null;
    }
} 