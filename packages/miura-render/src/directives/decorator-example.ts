import { directive, lazyDirective } from './decorators';
import { BaseDirective } from './directive';

// Example of a regular directive (always loaded)
@directive('example')
export class ExampleDirective extends BaseDirective {
    mount(element: Element) {
        console.log('Example directive mounted');
    }
}

// Example of a lazy directive (loaded on-demand)
@lazyDirective('lazy-example')
export class LazyExampleDirective extends BaseDirective {
    mount(element: Element) {
        console.log('Lazy example directive mounted');
    }
}

// Usage in templates:
// <div #example>Regular directive</div>
// <div #lazy-example>Lazy directive</div> 