import { MiuraElement, html } from '../index.js';

// Example 1: Simple component with automatic registration
class MyButton extends MiuraElement {
  static tagName = 'my-button';
  
  static properties = {
    text: { type: String, default: 'Click me' }
  };
  
  text!: string;
  
  render() {
    return html`
      <button style="background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
        ${this.text}
      </button>
    `;
  }
}

// Example 2: Component with more properties
class MyCard extends MiuraElement {
  static tagName = 'my-card';
  
  static properties = {
    title: { type: String, default: 'Card Title' },
    content: { type: String, default: 'Card content' }
  };
  
  title!: string;
  content!: string;
  
  render() {
    return html`
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
        <h3 style="margin-top: 0;">${this.title}</h3>
        <p>${this.content}</p>
      </div>
    `;
  }
}

// Example 3: Component with computed properties
class MyCounter extends MiuraElement {
  static tagName = 'my-counter';
  
  static properties = {
    count: { type: Number, default: 0 }
  };
  
  static computed() {
    return {
      isEven: {
        dependencies: ['count'],
        get() {
          return this.count % 2 === 0;
        }
      }
    };
  }
  
  count!: number;
  isEven!: boolean;
  
  increment() {
    this.count++;
  }
  
  render() {
    return html`
      <div style="text-align: center; padding: 1rem;">
        <h3>Count: ${this.count}</h3>
        <p>Is even: ${this.isEven ? 'Yes' : 'No'}</p>
        <button @click=${this.increment} style="background: #28a745; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
          Increment
        </button>
      </div>
    `;
  }
}

// These components are automatically registered when the classes are defined!
// No need to call customElements.define() manually.

// Usage in HTML:
// <my-button text="Hello World"></my-button>
// <my-card title="My Title" content="My content"></my-card>
// <my-counter></my-counter>

export { MyButton, MyCard, MyCounter }; 
