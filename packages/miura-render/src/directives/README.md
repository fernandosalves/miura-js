# Directives

Directives are special markers in the DOM that tell the template engine to do something with an element or component. miura supports both always-loaded structural directives and lazy-loaded utility directives for optimal performance.

## Directive Types

### Always Loaded (Structural Directives)
These directives are essential for template rendering and are always available:

### Switch Directive

The switch directive provides template-based conditional rendering:

```typescript
<div #switch=${value}>
    <template case="a">Case A content</template>
    <template case="b">Case B content</template>
    <template default>Default content</template>
</div>
```

Features:
- Case-based conditional rendering
- Default case support
- Template-based content
- Clean transitions between cases

Best Practices:
1. Always provide a default case
2. Use string values for cases
3. Keep templates focused and small
4. Use for navigation/tab interfaces

### If Directive

Conditional rendering based on boolean values:

```typescript
<div #if=${condition}>
    Content shown when condition is true
</div>
```

### For Directive

List rendering with item templates:

```typescript
<ul>
    <li #for=${[items, (item) => html`
        <div>${item.name}</div>
    `]}>
    </li>
</ul>
```

## Lazy Loaded Directives

These directives are loaded on-demand when used, improving initial bundle size and performance:

### Utility Directives

#### Resize Directive

Observes element resize events:

```typescript
<div #resize=${(entry) => handleResize(entry)}>
    Resizable content
</div>
```

#### Intersection Directive

Observes element intersection with viewport:

```typescript
<div #intersect=${(entry) => handleIntersection(entry)}>
    Observable content
</div>
```

#### Focus Directive

Handles element focus events:

```typescript
<input #focus=${(focused) => handleFocus(focused)}>
```

#### Mutation Directive

Observes DOM mutations:

```typescript
<div #mutation=${(mutations) => handleMutations(mutations)}>
    Observable content
</div>
```

### Innovative Directives

#### Lazy Directive

Lazy loads content when element becomes visible:

```typescript
<div #lazy=${{
    threshold: 0.1,
    rootMargin: '50px',
    placeholder: html`<div>Loading...</div>`
}}>
    <img src="heavy-image.jpg" alt="Lazy loaded image">
</div>
```

#### Animate Directive

Adds smooth animations and transitions:

```typescript
<div #animate=${{
    trigger: 'hover',
    animation: 'fadeIn',
    duration: 300,
    onStart: () => console.log('Animation started'),
    onEnd: () => console.log('Animation ended')
}}>
    Animated content
</div>
```

Available animations: `fadeIn`, `fadeOut`, `slideIn`, `slideOut`, `scaleIn`, `scaleOut`, `rotateIn`, `rotateOut`

#### Validate Directive

Real-time form validation:

```typescript
<input #validate=${{
    rules: {
        required: true,
        minLength: 3,
        pattern: /^[a-zA-Z]+$/
    },
    onValid: (valid) => console.log('Valid:', valid),
    onError: (errors) => console.log('Errors:', errors)
}}>
```

#### Media Directive

Responsive behavior based on media queries:

```typescript
<div #media=${{
    mobile: () => html`<span>Mobile view</span>`,
    tablet: () => html`<span>Tablet view</span>`,
    desktop: () => html`<span>Desktop view</span>`
}}>
    Responsive content
</div>
```

#### Gesture Directive

Handles touch and mouse gestures:

```typescript
<div #gesture=${{
    swipe: (direction) => console.log('Swiped:', direction),
    pinch: (scale) => console.log('Pinched:', scale),
    rotate: (angle) => console.log('Rotated:', angle),
    longPress: () => console.log('Long pressed')
}}>
    Gesture-enabled content
</div>
```

## Creating Custom Directives

### Using Decorators

miura provides decorators for easy directive registration:

```typescript
import { directive, lazyDirective } from '@miurajs/render';
import { BaseDirective } from '@miurajs/render';

// Regular directive (always loaded)
@directive('my-directive')
export class MyDirective extends BaseDirective {
    mount(element: Element) {
        // Setup logic
    }
    
    update(value: unknown) {
        // Handle value changes
    }
    
    unmount() {
        // Cleanup logic
    }
}

// Lazy directive (loaded on-demand)
@lazyDirective('my-lazy-directive')
export class MyLazyDirective extends BaseDirective {
    mount(element: Element) {
        // Setup logic
    }
}
```

### Manual Registration

```typescript
import { DirectiveManager } from '@miurajs/render';

// Register regular directive
DirectiveManager.register('my-directive', MyDirective);

// Register lazy directive
DirectiveManager.registerLazyDirective('my-lazy-directive', async () => {
    const { MyLazyDirective } = await import('./my-lazy-directive');
    return MyLazyDirective;
});
```

## Performance Optimization

### Lazy Loading Benefits

- **Reduced initial bundle size** - Only load directives when needed
- **Faster startup** - Defer non-essential directive loading
- **Better caching** - Lazy directives can be cached separately
- **Tree shaking** - Unused directives are excluded from builds

### Best Practices

1. **Directive Usage**
   - Use appropriate directive for each use case
   - Keep directive logic simple and focused
   - Clean up resources in unmount

2. **Performance**
   - Use passive event listeners where possible
   - Debounce/throttle frequent events
   - Avoid deep DOM mutations
   - Prefer lazy directives for non-critical functionality

3. **Error Handling**
   - Handle edge cases gracefully
   - Provide meaningful error messages
   - Clean up on errors

4. **Documentation**
   - Document directive purpose and usage
   - Include examples and best practices
   - Note any limitations or caveats

## Debugging

Enable debug logging for directives:

```typescript
import { enableDebug } from '@miurajs/render';

enableDebug({
    directives: true,
    directiveManager: true
});
```

This will log directive creation, mounting, updates, and cleanup operations.