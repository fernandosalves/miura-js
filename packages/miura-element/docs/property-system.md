# MiuraElement Property System: Implementation Analysis & Recommendations

## Overview
The MiuraElement property system provides a foundation for reactive properties in web components, supporting type conversion, default values, and property-to-attribute reflection. This document analyzes the current implementation, highlights its strengths and limitations, and outlines recommendations for future enhancements.

---

## 1. Property Declaration & Options
- **Properties are declared statically** on the component class:
  ```ts
  static properties = {
    count: { type: Number, default: 0, reflect: true },
    label: { type: String, attribute: 'aria-label' }
  };
  ```
- **PropertyOptions**:
  - `type`: Number, String, Boolean, Array, Object
  - `attribute?`: Custom attribute name (defaults to property name, lowercased)
  - `reflect?`: If true, property changes reflect to attribute
  - `default?`: Default value

## 2. Property Accessor Creation
- `createProperties` is called in the constructor if `static properties` is defined.
- For each property:
  - Uses a `WeakMap` for per-instance value storage.
  - Initializes with default value if provided.
  - Defines a getter/setter:
    - **Getter**: Returns stored value (or `null` if undefined).
    - **Setter**:
      - Converts value to correct type.
      - Stores new value.
      - Calls `requestUpdate` for reactivity.
      - If `reflect` is true and element is connected, updates the attribute.

## 3. Type Conversion
- `convertValue` ensures values are coerced to the declared type.

## 4. Property → Attribute Reflection
- If `reflect` is true, the setter updates the corresponding attribute.
- Attribute name can be customized or defaults to the property name (lowercase).

## 5. Reactivity & Updates
- Setting a property triggers `requestUpdate`, which schedules an async update via `performUpdate`.
- Updates are coalesced (one per microtask).
- After rendering, the `updated` lifecycle method is called.

## 6. Attribute → Property Sync (**Missing**)
- **No implementation of `attributeChangedCallback` or `observedAttributes`.**
  - Changing an attribute directly (e.g., `setAttribute`) does **not** update the property.
  - Only property → attribute reflection is supported, not the reverse.

## 7. State, Global, Precompute (**Missing**)
- **No built-in concept of `state()`, `global()`, or `precompute()`.**
  - All properties are declared in the same `static properties` object.
  - No separation between public, internal, or global state.
  - No async/computed/precomputed property system.

## 8. Usage Patterns
- Components declare `static properties` and use them in templates.
- Properties are updated in event handlers or methods.
- No evidence of attribute → property sync or advanced state management in usage/tests.

## 9. Decorators
- Only a basic `@component` decorator for registration exists.
- No property-level decorators for properties/state/global.

---

## Summary Table

| Feature                        | Supported? | Notes                                                      |
|--------------------------------|------------|------------------------------------------------------------|
| Static property declaration     | Yes        | `static properties = { ... }`                              |
| Type conversion                 | Yes        | Via `convertValue`                                         |
| Default values                  | Yes        | Via `default` in `PropertyOptions`                         |
| Property → attribute reflection | Yes        | Via `reflect` and `attribute` options                      |
| Attribute → property sync       | **No**     | No `attributeChangedCallback`/`observedAttributes`         |
| Reactivity/updates              | Yes        | `requestUpdate`/`performUpdate`/`updated` lifecycle        |
| State/global/precompute         | **No**     | No separation or advanced state/computed/precompute system |
| Decorators                      | No         | Only a basic `@component` decorator                        |

---

## Recommendations for Future Improvements

1. **Attribute → Property Sync**
   - Implement `static get observedAttributes()` and `attributeChangedCallback` to sync attribute changes to properties.
   - Ensures full web component compatibility and two-way binding.

2. **Advanced State Management**
   - Introduce `state()`, `global()`, and `precompute()` APIs:
     - `state()`: For internal, non-reflected state.
     - `global()`: For shared/global state (optional).
     - `precompute()`: For async/computed property initialization.
   - Separate public, internal, and global state for clarity and maintainability.

3. **Property Decorators**
   - Add decorators for properties, state, and global fields for ergonomic class syntax.

4. **Computed/Async Properties**
   - Support computed properties and async precompute logic for advanced use cases.

5. **Documentation & Examples**
   - Provide clear documentation and usage examples for all new features.

---

## Conclusion
The current property system is robust for basic reactive properties but lacks advanced features found in modern frameworks. Addressing the above recommendations will make MiuraElement more powerful, ergonomic, and compatible with the broader web component ecosystem. 