# MiuraUI Design System & Admin Migration

## Project Overview

**Goal:** Create a production-ready design system for `miura-ui` that competes with Shadcn/ui, Radix, and Chakra, then rebuild the admin application using MiuraJS.

**Design Inspiration:** Microsoft Fluent UI 2 (Outlook/Teams aesthetic)

---

# PART 1: MIURA-UI DESIGN SYSTEM

## MiuraJS & Miura Render: Advanced Functionality to Leverage

### 1. Signals & Fine-Grained Reactivity
- All component properties are signal-backed for efficient updates.
- Use standalone signals and computed for derived state.
- Prefer signals for any state that changes frequently or is shared across components.

### 2. Two-Way Binding (`&` prefix)
- Use `&value`, `&checked`, etc. for direct two-way binding between DOM and component state.
- Enables instant sync for forms, toggles, and interactive primitives.

### 3. Directives (Core & Lazy)
- Use core directives: `#if`, `#for`, `#switch`, `#media`, `#resize`, `#focus`, `#mutation`, etc.
- Use `#media` for breakpoint-aware rendering and responsive logic (mobile-first, progressive enhancement).
- Use `#resize`, `#intersect`, `#lazy`, `#animate`, `#gesture`, `#validate` for advanced behaviors (resizable panels, lazy loading, animation, touch, validation, etc.).
- Custom directives can be registered for project-specific needs (see `@directive` and `@lazyDirective`).

### 4. Utility Bindings
- Use `:class` and `:style` for dynamic class and style maps (e.g., `:class=${this.classMap({...})}`).
- Use `%` utility bindings for utility-first styling (e.g., `%padding=${'1rem'}`).

### 5. Compiler Modes
- Use JIT (default) for full binding/directive support.
- Use AOT for high-frequency, performance-critical components (zero DOM queries after first render).

### 6. Theme & Token Management
- Use `this.theme`, `this.setTheme()`, `this.getToken()`, `this.setToken()` for runtime theming and token overrides.
- Use CSS custom properties for all tokens; update via theme provider or programmatically.

### 7. Accessibility & RTL
- Use built-in helpers: `this.setAria()`, `this.setRole()`, `this.announce()`, `this.handleArrowNavigation()`, `this.focusVisible()`.
- RTL/LTR support via `this.dir` and `this.isRTL`.

### 8. Responsive Patterns
- Use `#media` for conditional rendering/layout at breakpoints.
- Support responsive props (e.g., `padding`, `columns`, `display`) with `-sm`, `-md`, `-lg` suffixes.
- All styles and layouts should be mobile-first, with progressive enhancement for larger screens.

### 9. Form Integration
- Use `this.attachInternalsIfNeeded()`, `this.setCustomValidity()`, `this.reportValidity()` for native form support.
- Use two-way binding for seamless form state sync.

### 10. Custom Bindings & Extensibility
- Register custom directives for project-specific behaviors (e.g., analytics, drag-and-drop, custom animation triggers).
- Use the directive manager for advanced directive lifecycle control.

**Recommendation:**
All new primitives, layouts, and admin components should leverage these advanced MiuraJS/miura-render features for maximum performance, flexibility, and maintainability. Avoid direct DOM/style mutation; prefer signals, bindings, and directives for all dynamic/reactive logic.

## MiuraJS Features Reference

Before implementing, these MiuraJS features should be leveraged:

### Signals (Fine-Grained Reactivity)
```typescript
// Properties are automatically signal-backed
static properties = { count: { type: Number, default: 0 } };

// In template - pass signal for fine-grained updates
html`<p>${this.count}</p>` // Signal passed → only this binding updates

// Read/write
this.count()       // read
this.count(5)      // write

// Standalone signals
const price = signal(9.99);
const tax = computed(() => price() * 0.2);
price.subscribe(v => console.log(v));
```

### Two-Way Binding (`&` prefix)
```html
<!-- Syncs DOM property with component property -->
<input &value=${[this.name, (v) => this.name = v]}>
<input &checked=${[this.agree, (v) => this.agree = v]}>

<!-- Or using bind helper -->
<input &value=${this.bind('name')}>
```

### Directives (Core - Always Available)
```html
<!-- Conditional -->
<div #if=${this.isVisible}>Shown</div>

<!-- List rendering -->
<li #for=${[this.items, (item) => html`<span>${item.name}</span>`]}></li>

<!-- Switch/Case -->
<div #switch=${this.tab}>
  <template case="a">Tab A</template>
  <template case="b">Tab B</template>
  <template default>Default</template>
</div>
```

### Directives (Lazy-Loaded - On Demand)
```html
<!-- Responsive/Media queries -->
<div #media=${{ 
  mobile: () => html`<mobile-layout></mobile-layout>`,
  desktop: () => html`<desktop-layout></desktop-layout>` 
}}></div>

<!-- Element resize observer -->
<div #resize=${(entry) => this.handleResize(entry)}>Resizable</div>

<!-- Intersection observer (visibility) -->
<div #intersect=${(visible) => this.onVisible(visible)}>Watch me</div>

<!-- Lazy load content -->
<div #lazy=${{ placeholder: html`<mui-skeleton></mui-skeleton>` }}>
  <heavy-content></heavy-content>
</div>

<!-- Animations -->
<div #animate=${{ trigger: 'hover', animation: 'fadeIn' }}>Animated</div>

<!-- Focus tracking -->
<input #focus=${(focused) => this.onFocus(focused)}>

<!-- Gestures -->
<div #gesture=${{ swipe: (dir) => ..., pinch: (scale) => ... }}>Touch me</div>

<!-- Form validation -->
<input #validate=${{ rules: { required: true }, onValid: (v) => ... }}>
```

### MuiBase Features (Inherited by All Components)
```typescript
// Theming
this.theme                    // 'light' | 'dark'
this.setTheme('dark')
this.getToken('--mui-primary')
this.setToken('--mui-primary', '#0078d4')

// RTL/LTR
this.dir                      // 'ltr' | 'rtl'
this.isRTL                    // boolean

// Accessibility
this.setAria('label', 'Button')
this.setRole('button')
this.announce('Item deleted', 'polite')
this.handleArrowNavigation(event, items, 'horizontal')
this.focusVisible()

// Events
this.emit('change', { value })
this.emitDebounced('search', { query })
this.emitThrottled('scroll', { top })

// Responsive (use #media directive for breakpoint rendering)
this.isMobile                 // window.matchMedia check
this.isTablet
this.isDesktop

// Slots
this.hasSlot('icon')
this.onSlotChange('default', callback)

// Utilities
this.classMap({ active: true, disabled: false })
this.styleMap({ width: '100%', padding: '8px' })

// Form integration (ElementInternals)
this.attachInternalsIfNeeded()
this.setCustomValidity('Error message')
this.reportValidity()
```

### Compiler Modes
```typescript
// JIT (default) - Full binding support, directives, async
class MyComponent extends MiuraElement {
  static compiler = 'JIT' as const;
}

// AOT - Optimized for high-frequency updates, zero DOM queries after first render
class PerfCounter extends MiuraElement {
  static compiler = 'AOT' as const;
}
```

---

## Phase 1: Design Tokens

### 1.1 Token Files Structure

```
packages/miura-ui/src/
├── tokens/
│   ├── index.ts              # Export all tokens
│   ├── colors.ts             # Color palette + semantic colors
│   ├── typography.ts         # Font sizes, weights, line heights
│   ├── spacing.ts            # Spacing scale (4px base)
│   ├── shadows.ts            # Elevation levels
│   ├── radius.ts             # Border radius scale
│   ├── motion.ts             # Durations, easings
│   └── z-index.ts            # Layer stack
├── styles/
│   ├── reset.css             # Modern CSS reset
│   ├── tokens.css            # CSS custom properties (generated)
│   └── utilities.css         # Utility classes
```

### 1.2 Color Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--mui-background` | #fafafa | #1b1a19 | Page background |
| `--mui-surface` | #ffffff | #292827 | Card/panel backgrounds |
| `--mui-surface-subtle` | #f3f2f1 | #323130 | Subtle backgrounds |
| `--mui-border` | #edebe9 | #3b3a39 | Default borders |
| `--mui-border-strong` | #d2d0ce | #484644 | Emphasized borders |
| `--mui-text` | #242424 | #f3f2f1 | Primary text |
| `--mui-text-secondary` | #605e5c | #b3b0ad | Secondary text |
| `--mui-text-disabled` | #a19f9d | #6e6d6c | Disabled text |
| `--mui-primary` | #0078d4 | #4da3ff | Primary brand |
| `--mui-primary-hover` | #106ebe | #5caeff | Primary hover |
| `--mui-success` | #107c10 | #54b054 | Success states |
| `--mui-warning` | #ffb900 | #ffc83d | Warning states |
| `--mui-error` | #d13438 | #ff6b6b | Error states |
| `--mui-info` | #0078d4 | #4da3ff | Info states |

**Status:** ⬜ Not started

### 1.3 Typography Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--mui-font-family` | system-ui, -apple-system, sans-serif | Base font |
| `--mui-font-mono` | 'SF Mono', Consolas, monospace | Code |
| `--mui-text-xs` | 0.75rem (12px) | Captions, badges |
| `--mui-text-sm` | 0.875rem (14px) | Body small |
| `--mui-text-md` | 1rem (16px) | Body default |
| `--mui-text-lg` | 1.125rem (18px) | Body large |
| `--mui-text-xl` | 1.25rem (20px) | Heading 4 |
| `--mui-text-2xl` | 1.5rem (24px) | Heading 3 |
| `--mui-text-3xl` | 1.875rem (30px) | Heading 2 |
| `--mui-text-4xl` | 2.25rem (36px) | Heading 1 |
| `--mui-weight-normal` | 400 | Normal text |
| `--mui-weight-medium` | 500 | Emphasized |
| `--mui-weight-semibold` | 600 | Headings |
| `--mui-weight-bold` | 700 | Strong emphasis |

**Status:** ⬜ Not started

### 1.4 Spacing Tokens (4px Base Grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--mui-space-0` | 0 | None |
| `--mui-space-1` | 4px | Tight |
| `--mui-space-2` | 8px | Compact |
| `--mui-space-3` | 12px | Default gap |
| `--mui-space-4` | 16px | Standard |
| `--mui-space-5` | 20px | Comfortable |
| `--mui-space-6` | 24px | Relaxed |
| `--mui-space-8` | 32px | Spacious |
| `--mui-space-10` | 40px | Section gap |
| `--mui-space-12` | 48px | Large section |
| `--mui-space-16` | 64px | Page section |

**Status:** ⬜ Not started

### 1.5 Other Tokens

**Shadows (Elevation)**
| Token | Light Theme |
|-------|-------------|
| `--mui-shadow-none` | none |
| `--mui-shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) |
| `--mui-shadow-md` | 0 4px 6px rgba(0,0,0,0.1) |
| `--mui-shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) |
| `--mui-shadow-xl` | 0 20px 25px rgba(0,0,0,0.1) |

**Border Radius**
| Token | Value |
|-------|-------|
| `--mui-radius-none` | 0 |
| `--mui-radius-sm` | 2px |
| `--mui-radius-md` | 4px |
| `--mui-radius-lg` | 8px |
| `--mui-radius-xl` | 12px |
| `--mui-radius-full` | 9999px |

**Motion**
| Token | Value |
|-------|-------|
| `--mui-duration-fast` | 100ms |
| `--mui-duration-normal` | 200ms |
| `--mui-duration-slow` | 300ms |
| `--mui-easing-standard` | cubic-bezier(0.4, 0, 0.2, 1) |
| `--mui-easing-emphasized` | cubic-bezier(0.2, 0, 0, 1) |

**Z-Index**
| Token | Value |
|-------|-------|
| `--mui-z-dropdown` | 1000 |
| `--mui-z-sticky` | 1100 |
| `--mui-z-modal` | 1200 |
| `--mui-z-popover` | 1300 |
| `--mui-z-tooltip` | 1400 |
| `--mui-z-toast` | 1500 |

**Status:** ⬜ Not started

---

## Phase 2: Theme System

### 2.1 Theme Provider

**File:** `packages/miura-ui/src/theme/theme-provider.ts`

```typescript
// Usage
<mui-theme-provider theme="light">
  <app-content></app-content>
</mui-theme-provider>

// Or programmatic
MuiTheme.setTheme('dark');
MuiTheme.setTheme('system'); // auto-detect
```

| Feature | Description | Status |
|---------|-------------|--------|
| Light theme | Default theme | ⬜ |
| Dark theme | Dark mode colors | ⬜ |
| System detection | prefers-color-scheme | ⬜ |
| Persist preference | localStorage | ⬜ |
| Theme toggle animation | Smooth transition | ⬜ |
| Custom themes | User-defined | ⬜ |

**Status:** ⬜ Not started

---

## Phase 3: Layout System (Flexbox-Based)

### 3.1 Core Layout Components

All layouts use **CSS Flexbox** with configurable columns/rows.

#### `mui-stack` - Vertical/Horizontal Stack
```html
<mui-stack direction="column" gap="4" align="start">
  <div>Item 1</div>
  <div>Item 2</div>
</mui-stack>

<mui-stack direction="row" gap="2" justify="between" wrap>
  <div>Left</div>
  <div>Right</div>
</mui-stack>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `row` \| `column` | `column` | Flex direction |
| `gap` | `0-16` | `0` | Gap using spacing tokens |
| `align` | `start` \| `center` \| `end` \| `stretch` | `stretch` | align-items |
| `justify` | `start` \| `center` \| `end` \| `between` \| `around` | `start` | justify-content |
| `wrap` | boolean | `false` | flex-wrap |
| `inline` | boolean | `false` | display: inline-flex |

**Status:** ⬜ Not started

#### `mui-grid` - Flexbox Grid with Columns
```html
<mui-grid columns="3" gap="4">
  <div>Col 1</div>
  <div>Col 2</div>
  <div>Col 3</div>
</mui-grid>

<!-- Responsive columns using #media directive -->
<div #media=${{
  mobile: () => html`<mui-grid columns="1" gap="4">...</mui-grid>`,
  tablet: () => html`<mui-grid columns="2" gap="4">...</mui-grid>`,
  desktop: () => html`<mui-grid columns="4" gap="4">...</mui-grid>`
}}></div>

<!-- Or with responsive props -->
<mui-grid columns="1" columns-md="2" columns-lg="4" gap="4">
  ...
</mui-grid>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `1-12` \| `auto` | `1` | Number of columns |
| `columns-sm` | `1-12` | - | Columns at sm breakpoint |
| `columns-md` | `1-12` | - | Columns at md breakpoint |
| `columns-lg` | `1-12` | - | Columns at lg breakpoint |
| `gap` | `0-16` | `0` | Grid gap |
| `gap-x` | `0-16` | - | Horizontal gap |
| `gap-y` | `0-16` | - | Vertical gap |

**Implementation:** Uses `display: flex; flex-wrap: wrap` with calculated child widths based on column count.

**Status:** ⬜ Not started

#### `mui-box` - Flexible Container
```html
<mui-box padding="4" bg="surface" radius="md" shadow="sm">
  Content
</mui-box>
```

| Prop | Type | Description |
|------|------|-------------|
| `padding` / `p` | `0-16` | All sides |
| `padding-x` / `px` | `0-16` | Horizontal |
| `padding-y` / `py` | `0-16` | Vertical |
| `margin` / `m` | `0-16` \| `auto` | All sides |
| `bg` | token name | Background color |
| `border` | boolean \| token | Border |
| `radius` | `none` \| `sm` \| `md` \| `lg` \| `xl` \| `full` | Border radius |
| `shadow` | `none` \| `sm` \| `md` \| `lg` \| `xl` | Box shadow |
| `display` | CSS display | Display type |
| `overflow` | CSS overflow | Overflow behavior |

**Status:** ⬜ Not started

#### `mui-container` - Max-Width Container
```html
<mui-container size="lg" center>
  <page-content></page-content>
</mui-container>
```

| Prop | Type | Max-Width |
|------|------|-----------|
| `size="sm"` | - | 640px |
| `size="md"` | - | 768px |
| `size="lg"` | - | 1024px |
| `size="xl"` | - | 1280px |
| `size="2xl"` | - | 1536px |
| `size="full"` | - | 100% |
| `center` | boolean | margin: 0 auto |

**Status:** ⬜ Not started

### 3.2 Admin Layout System

```
┌──────────────────────────────────────────────────────────────────┐
│ <mui-admin-layout>                                               │
├────────┬─────────────┬───────────────────────────────────────────┤
│        │             │ <slot name="header">                      │
│        │             │   <mui-page-header>                       │
│ <slot  │ <slot       │     Title / Breadcrumbs / Actions         │
│ name=  │ name=       │   </mui-page-header>                      │
│ "rail">│ "nav">      ├───────────────────────────────────────────┤
│        │             │ <slot name="subheader">                   │
│ 48px   │ 240-320px   │   Tabs / Filters (optional)               │
│        │ collapsible ├───────────────────────────────────────────┤
│        │             │                                           │
│        │             │ <slot> (default)                          │
│        │             │   Main content                            │
│        │             │                                           │
└────────┴─────────────┴───────────────────────────────────────────┘
```

#### `mui-admin-layout`
```html
<mui-admin-layout>
  <mui-icon-rail slot="rail">
    <mui-rail-item icon="dashboard" href="/dashboard" active></mui-rail-item>
    <mui-rail-item icon="folder" href="/content"></mui-rail-item>
    <mui-rail-divider></mui-rail-divider>
    <mui-rail-item icon="settings" href="/settings" position="bottom"></mui-rail-item>
  </mui-icon-rail>
  
  <mui-side-nav slot="nav" collapsible>
    <mui-nav-header>Content</mui-nav-header>
    <mui-nav-item href="/content/labs">Labs</mui-nav-item>
    <mui-nav-group label="Series">
      <mui-nav-item href="/content/series/1">Frontend Labs</mui-nav-item>
    </mui-nav-group>
  </mui-side-nav>
  
  <mui-page-header slot="header">
    <span slot="title">Dashboard</span>
    <span slot="description">Editorial command center</span>
    <mui-button slot="actions">New Story</mui-button>
  </mui-page-header>
  
  <main>
    <!-- Page content -->
  </main>
</mui-admin-layout>
```

| Component | Description | Status |
|-----------|-------------|--------|
| `mui-admin-layout` | Main layout shell (flexbox) | ⬜ |
| `mui-icon-rail` | Vertical icon navigation (48px fixed) | ⬜ |
| `mui-rail-item` | Rail navigation item | ⬜ |
| `mui-rail-divider` | Rail section divider | ⬜ |
| `mui-side-nav` | Collapsible side navigation | ⬜ |
| `mui-nav-header` | Nav section header | ⬜ |
| `mui-nav-item` | Nav link item | ⬜ |
| `mui-nav-group` | Collapsible nav group | ⬜ |
| `mui-page-header` | Page title/actions bar | ⬜ |
| `mui-subheader` | Secondary header (tabs/filters) | ⬜ |

**Icon Rail Features:**
- [ ] Tooltip on hover
- [ ] Active state indicator (left bar)
- [ ] Badge for notifications
- [ ] Keyboard navigation (arrow keys)
- [ ] Bottom-pinned items (theme, logout)

**Side Nav Features:**
- [ ] Expand/collapse with animation
- [ ] Nested groups (accordion)
- [ ] Search/filter items
- [ ] Resize by dragging (use `#resize` directive)
- [ ] Remember state (localStorage)
- [ ] Responsive: drawer on mobile (use `#media` directive)

**Status:** ⬜ Not started

### 3.3 Responsive Behavior (Mobile-First)

**All styles are mobile-first.** Base styles target mobile, then progressively enhance for larger screens.

```css
/* Mobile-first: base styles apply to all */
.component {
  flex-direction: column;  /* Mobile: stack vertically */
  padding: var(--mui-space-2);
}

/* Then enhance for larger screens */
@media (min-width: 640px) {  /* sm */
  .component { padding: var(--mui-space-4); }
}

@media (min-width: 1024px) {  /* lg */
  .component { 
    flex-direction: row;  /* Desktop: horizontal */
    padding: var(--mui-space-6);
  }
}
```

**Breakpoint Tokens:**
| Token | Min-Width | Target |
|-------|-----------|--------|
| `--mui-bp-sm` | 640px | Large phones, small tablets |
| `--mui-bp-md` | 768px | Tablets |
| `--mui-bp-lg` | 1024px | Laptops, desktops |
| `--mui-bp-xl` | 1280px | Large desktops |
| `--mui-bp-2xl` | 1536px | Ultra-wide |

**Using `#media` directive (mobile-first):**
```html
<!-- Default = mobile, override for larger -->
<div #media=${{
  default: () => html`<mui-drawer>Mobile nav</mui-drawer>`,
  lg: () => html`<mui-side-nav>Desktop nav</mui-side-nav>`
}}></div>

<!-- Grid columns: 1 on mobile, 2 on md, 4 on lg -->
<mui-grid columns="1" columns-md="2" columns-lg="4" gap="4">
  ...
</mui-grid>
```

**Component responsive props follow mobile-first:**
```html
<!-- padding: 2 on mobile, 4 on md+, 6 on lg+ -->
<mui-box p="2" p-md="4" p-lg="6">
  Content
</mui-box>

<!-- hidden on mobile, visible on lg+ -->
<mui-box display="none" display-lg="block">
  Desktop only content
</mui-box>
```

---

## Phase 4: Primitive Components

### 4.1 Button

**File:** `packages/miura-ui/src/primitives/button.ts`

```html
<mui-button variant="primary">Primary</mui-button>
<mui-button variant="secondary">Secondary</mui-button>
<mui-button variant="outline">Outline</mui-button>
<mui-button variant="ghost">Ghost</mui-button>
<mui-button variant="destructive">Delete</mui-button>
<mui-button variant="link">Link</mui-button>

<mui-button size="sm">Small</mui-button>
<mui-button size="md">Medium</mui-button>
<mui-button size="lg">Large</mui-button>

<mui-button loading>Saving...</mui-button>
<mui-button disabled>Disabled</mui-button>
<mui-button block>Full Width</mui-button>

<mui-button>
  <mui-icon slot="start" name="plus"></mui-icon>
  Add Item
</mui-button>
```

| Prop | Type | Default |
|------|------|---------|
| `variant` | `primary` \| `secondary` \| `outline` \| `ghost` \| `destructive` \| `link` | `primary` |
| `size` | `sm` \| `md` \| `lg` \| `icon` | `md` |
| `loading` | boolean | false |
| `disabled` | boolean | false |
| `block` | boolean | false |
| `type` | `button` \| `submit` \| `reset` | `button` |

| Slot | Description |
|------|-------------|
| `default` | Button label |
| `start` | Icon before label |
| `end` | Icon after label |

**Status:** 🟡 Partial (needs redesign)

### 4.2 Input

**File:** `packages/miura-ui/src/primitives/input.ts`

```html
<mui-input 
  label="Email"
  type="email"
  placeholder="you@example.com"
  helper="We'll never share your email"
></mui-input>

<mui-input 
  label="Password"
  type="password"
  error="Password must be 8+ characters"
></mui-input>

<mui-input label="Search" type="search" clearable>
  <mui-icon slot="start" name="search"></mui-icon>
</mui-input>

<!-- Two-way binding -->
<mui-input 
  label="Name"
  &value=${[this.name, (v) => this.name = v]}
></mui-input>
```

| Prop | Type | Default |
|------|------|---------|
| `type` | `text` \| `email` \| `password` \| `number` \| `search` \| `tel` \| `url` | `text` |
| `label` | string | - |
| `placeholder` | string | - |
| `helper` | string | - |
| `error` | string | - |
| `disabled` | boolean | false |
| `readonly` | boolean | false |
| `required` | boolean | false |
| `clearable` | boolean | false |
| `size` | `sm` \| `md` \| `lg` | `md` |

| Slot | Description |
|------|-------------|
| `start` | Prefix icon/text |
| `end` | Suffix icon/text |

**Status:** ⬜ Not started (needs new implementation)

### 4.3 Other Primitives

| Component | Props | Status |
|-----------|-------|--------|
| `mui-textarea` | label, rows, resize, maxlength, counter | ⬜ |
| `mui-select` | label, options, placeholder, multiple, searchable | ⬜ |
| `mui-checkbox` | label, checked, indeterminate, disabled | ⬜ |
| `mui-radio` | label, value, checked, disabled | ⬜ |
| `mui-switch` | label, checked, disabled, labelPosition | ⬜ |
| `mui-slider` | min, max, step, value, marks, range | ⬜ |
| `mui-icon` | name, size, color | 🟡 Partial |
| `mui-icon-button` | icon, variant, size, label (a11y) | 🟡 Partial |

---

## Phase 5: Data Display Components

### 5.1 Card

```html
<mui-card>
  <img slot="cover" src="..." alt="...">
  <h3 slot="title">Card Title</h3>
  <p slot="description">Card description text</p>
  <mui-button slot="actions">Action</mui-button>
</mui-card>

<mui-card clickable @click=${this.handleClick}>
  ...
</mui-card>
```

| Prop | Type | Default |
|------|------|---------|
| `clickable` | boolean | false |
| `selected` | boolean | false |
| `padding` | `none` \| `sm` \| `md` \| `lg` | `md` |
| `shadow` | `none` \| `sm` \| `md` \| `lg` | `sm` |

**Status:** 🟡 Partial

### 5.2 Data Table

```html
<mui-data-table
  .columns=${this.columns}
  .data=${this.rows}
  selectable
  sortable
  paginated
  page-size="10"
  @row-click=${this.onRowClick}
  @selection-change=${this.onSelect}
>
  <mui-table-toolbar slot="toolbar">
    <mui-input slot="search" type="search" placeholder="Search..."></mui-input>
    <mui-button slot="actions">Export</mui-button>
  </mui-table-toolbar>
</mui-data-table>
```

| Feature | Description | Status |
|---------|-------------|--------|
| Columns definition | width, align, sortable, render | ⬜ |
| Sorting | Single/multi column | ⬜ |
| Filtering | Global search, column filters | ⬜ |
| Pagination | Client/server-side | ⬜ |
| Selection | Checkbox, select all | ⬜ |
| Resizable columns | Drag to resize | ⬜ |
| Column visibility | Toggle columns | ⬜ |
| Row expansion | Expandable details | ⬜ |
| Virtual scrolling | Large datasets (use `#lazy`) | ⬜ |
| Sticky header | Keep visible on scroll | ⬜ |
| Empty state | Custom message | ⬜ |
| Loading state | Skeleton rows | ⬜ |
| Row actions | Inline/context menu | ⬜ |
| Bulk actions | Actions on selected | ⬜ |

**Status:** ⬜ Not started

### 5.3 Other Data Display

| Component | Description | Status |
|-----------|-------------|--------|
| `mui-badge` | Count/status badge | 🟡 Partial |
| `mui-tag` | Removable tag/chip | 🟡 Partial |
| `mui-avatar` | User avatar with fallback | 🟡 Partial |
| `mui-avatar-group` | Stacked avatars | ⬜ |
| `mui-stat-card` | Metric display | ⬜ |
| `mui-list` | Vertical list | 🟡 Partial |
| `mui-list-item` | List item with slots | 🟡 Partial |
| `mui-tree` | Hierarchical tree | ⬜ |
| `mui-timeline` | Vertical timeline | 🟡 Partial |
| `mui-progress` | Progress bar | 🟡 Partial |
| `mui-skeleton` | Loading placeholder | 🟡 Partial |

---

## Phase 6: Navigation Components

| Component | Description | Status |
|-----------|-------------|--------|
| `mui-tabs` | Horizontal tabs with panels | 🟡 Partial |
| `mui-breadcrumbs` | Navigation breadcrumbs | 🟡 Partial |
| `mui-pagination` | Page navigation | 🟡 Partial |
| `mui-stepper` | Step-by-step wizard | 🟡 Partial |
| `mui-dropdown` | Dropdown menu | 🟡 Partial |
| `mui-command-palette` | Cmd+K command search | ⬜ |

---

## Phase 7: Overlay Components

### 7.1 Dialog

```html
<mui-dialog open=${this.isOpen} @close=${() => this.isOpen = false}>
  <span slot="title">Confirm Delete</span>
  <p>Are you sure you want to delete this item?</p>
  <mui-stack slot="actions" direction="row" gap="2" justify="end">
    <mui-button variant="ghost" @click=${this.close}>Cancel</mui-button>
    <mui-button variant="destructive" @click=${this.confirm}>Delete</mui-button>
  </mui-stack>
</mui-dialog>
```

| Prop | Type | Default |
|------|------|---------|
| `open` | boolean | false |
| `size` | `sm` \| `md` \| `lg` \| `xl` \| `full` | `md` |
| `closeable` | boolean | true |
| `closeOnBackdrop` | boolean | true |
| `closeOnEscape` | boolean | true |

**Status:** 🟡 Partial

### 7.2 Other Overlays

| Component | Description | Status |
|-----------|-------------|--------|
| `mui-drawer` | Slide-in panel | 🟡 Partial |
| `mui-sheet` | Bottom sheet (mobile) | ⬜ |
| `mui-popover` | Content popover | 🟡 Partial |
| `mui-tooltip` | Hover tooltip | 🟡 Partial |
| `mui-context-menu` | Right-click menu | ⬜ |
| `mui-toast` | Toast notification | 🟡 Partial |
| `mui-alert` | Inline alert banner | 🟡 Partial |

---

## Phase 8: Form Components

| Component | Description | Status |
|-----------|-------------|--------|
| `mui-form-field` | Field wrapper with label/error | ⬜ |
| `mui-checkbox-group` | Multiple checkboxes | 🟡 Partial |
| `mui-radio-group` | Radio button group | 🟡 Partial |
| `mui-combobox` | Searchable select | ⬜ |
| `mui-multi-select` | Multi-value select | ⬜ |
| `mui-tag-input` | Tag input with chips | ⬜ |
| `mui-date-picker` | Date selection | 🟡 Partial |
| `mui-time-picker` | Time selection | 🟡 Partial |
| `mui-date-range-picker` | Date range | ⬜ |
| `mui-file-upload` | Drag & drop file upload | 🟡 Partial |
| `mui-color-picker` | Color selection | ⬜ |

---

## Phase 9: Specialized Components

| Component | Description | Status |
|-----------|-------------|--------|
| `mui-calendar` | Full calendar (month/week/day views) | 🟡 Partial |
| `mui-kanban` | Kanban board with drag & drop | ⬜ |
| `mui-bar-chart` | Bar chart | ⬜ |
| `mui-line-chart` | Line/area chart | ⬜ |
| `mui-pie-chart` | Pie/donut chart | ⬜ |
| `mui-sparkline` | Mini inline chart | ⬜ |

---

## Implementation Priority

### Sprint 1 (Week 1-2): Foundation
1. ⬜ Design tokens (colors, typography, spacing)
2. ⬜ CSS reset & base styles
3. ⬜ Theme provider (light/dark/system)
4. ⬜ `mui-stack`, `mui-grid`, `mui-box`, `mui-container`
5. ⬜ `mui-button` (redesign)
6. ⬜ `mui-input` (new)

### Sprint 2 (Week 3-4): Layout & Navigation
1. ⬜ `mui-admin-layout`
2. ⬜ `mui-icon-rail`
3. ⬜ `mui-side-nav`
4. ⬜ `mui-page-header`
5. ⬜ `mui-tabs`
6. ⬜ `mui-breadcrumbs`

### Sprint 3 (Week 5-6): Data Display
1. ⬜ `mui-card`
2. ⬜ `mui-data-table` (basic)
3. ⬜ `mui-badge`, `mui-tag`, `mui-avatar`
4. ⬜ `mui-list`, `mui-list-item`
5. ⬜ `mui-dialog`, `mui-drawer`
6. ⬜ `mui-toast`, `mui-alert`

### Sprint 4 (Week 7-8): Forms & Advanced
1. ⬜ `mui-form-field`
2. ⬜ `mui-select`, `mui-combobox`
3. ⬜ `mui-checkbox`, `mui-radio`, `mui-switch`
4. ⬜ `mui-data-table` (advanced features)
5. ⬜ `mui-date-picker`
6. ⬜ `mui-file-upload`

---

# PART 2: ADMIN APPLICATION MIGRATION

*This section will be populated after miura-ui design system is complete (Sprint 1-4).*

## Admin Pages Roadmap

| Page | Priority | miura-ui Dependencies |
|------|----------|----------------------|
| Login | Critical | input, button, card |
| Dashboard | Critical | stat-card, chart, list, card |
| Content Explorer | Critical | tree, card, sidebar, dialog |
| Story Editor | Critical | input, textarea, tabs, drawer |
| Kanban Pipeline | High | kanban (custom) |
| Editorial Calendar | High | calendar (custom) |
| Settings | Medium | form-field, tabs, inputs |
| Media Library | Medium | grid, card, file-upload |
| Subscribers | Medium | data-table |
| User Management | Medium | data-table, dialog |
| Performance | Low | charts |

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🟡 | Partial / needs redesign |
| 🟢 | Complete |
| 🔵 | Needs review |
| 🔴 | Blocked |
