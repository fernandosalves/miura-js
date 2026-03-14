import { MiuraElement } from '../../core/src/element/miura-element';
import { html } from '../../core/src/template/html';

export class CounterElement extends MiuraElement {
    static properties = {
        count: { type: Number, default: 0 }
    };

    increment() {
        this.count++;
    }

    decrement() {
        this.count--;
    }

    template() {
        return html`
            <div class="counter">
                <button @click=${() => this.decrement()}>-</button>
                <span>${this.count}</span>
                <button @click=${() => this.increment()}>+</button>
            </div>
        `;
    }
}

customElements.define('miura-counter', CounterElement);
