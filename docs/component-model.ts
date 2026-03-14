import { MiuraElement, html } from "./packages/miura-element/src";

class EventElement extends MiuraElement {

    // setting properties
    properties() {
        return {
            message: {
                type: String,
                value: 'Click the button.', // default value
                notify: true, // default is true
                readOnly: false // default is false
            }
        }
    }

    // internal  only properties
    state() {
        return {
            count: {
                type: Number,
                value: 0,
                notify: true,
                readOnly: false
            },
            items: {
                type: Array,
                value: [],
                notify: true,
                readOnly: false
            }
        }
    }

    // global properties
    // properties that are available to all elements in the application
    // this is useful for global state management and shared data
    // this needs to be handle by miura-data-flow, it will require a mechanism like stores or providers, like flux or redux
    global() {
        return {
            items: []
        }
    }

    // lifecycle callbacks
    // smilar to lit ConnectedCallback
    // this function is called when the element is connected to the DOM
    connected() {
        this.items.push('Item 1');
        this.items.push('Item 2');
        this.items.push('Item 3');
    }

    // similar to lit DisconnectedCallback
    // this function is called when the element is disconnected from the DOM
    disconnected() {
        this.items = [];
    }

    // similar to lit UpdatedCallback
    // this function is called when the element is updated
    updated(changedProperties: Map<string, any>) {
        console.log('Updated', changedProperties);
    }

    // similar to lit adoptedCallback
    // this function is called when the element is adopted into a new document
    adopted() {
        console.log('Adopted');
    }

    // similar to lit attributeChangedCallback
    // this function is called when an attribute is changed
    attributeChanged() {
        console.log('Attribute changed');
    }

    // precompute properties
    // computed properties block the component from rendering until the properties are computed
    // this is useful for expensive computations
    // usefull for a api call that returns a list of items and we display a spinning wheel until the items are loaded
    // if the template is set the component will render the template until the properties are computed and then render the template main;
    // supports piping
    precompute() {
        return {
            userActivation: fetch('https://jsonplaceholder.typicode.com/posts/1').then(response => response.json()),
            template: html`
                <h1>loading...</h1>
            `
        }
    }

    // main render function realtime / runtim
    template(precompute: any) {
        return html`
            <h1>${this.message}</h1>
            <button @click|prevent=${() => this.message = 'Button clicked!'}>Click Me</button>
        `;
    }

    // will compile the template
    // need to discuss if this is the best approach and if both template and pocessor can be executes at same time
    pocessor() {
        return {
            message: 'Button clicked!'
        }
    }

    // directives listing
    // #if
    // #for
    // #each
    // #switch
    // #resize
    // #scroll
    // #media

    //events - discuss if using @ or onClick syntax
    // @click
    // @submit
    // @change
    // @input
    // @focus
    // @blur
    // @keydown
    // @keyup
    // @keypress
    // @mouseover
    // @mouseout
    // @mouseenter
    // @mouseleave
    // @contextmenu
    // @copy
    // @cut
    // @paste
    // @drag
    // @dragstart
    // @dragend
    // @dragover
    // @dragleave
    // @drop
    // @scroll
    // @resize
    // @wheel
    // @contextmenu
    // @select
    // @reset
    // @reset

    // event modifiers
    // @click|prevent
    // @click|stop
    // @click|once
    // @click|capture
    // @click|self
    // @click|passive
    // @click|once


}

customElements.define('event-element', EventElement);
