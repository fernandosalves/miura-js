# MiuraUI Design System - Enterprise Component Library

## Project Vision

Build a **production-grade component library**. This is not a minimal starter kit—it's a comprehensive enterprise UI system.

**Design Philosophy:** Clean, minimal, professional. Inspired by Radix Primitives + Vercel's design language.

---

# COMPONENT INVENTORY

Based on analysis of the existing admin application, here's the complete component inventory needed.

---

## 1. FOUNDATION LAYER

### 1.1 Icon System (`mui-icon`)

**Critical:** Every enterprise app needs icons. Integrate Lucide Icons (MIT licensed, 1000+ icons).

```html
<!-- Basic usage -->
<mui-icon name="folder"></mui-icon>
<mui-icon name="chevron-right" size="sm"></mui-icon>
<mui-icon name="settings" size="lg" color="primary"></mui-icon>

<!-- Spinning/loading -->
<mui-icon name="loader-2" spin></mui-icon>

<!-- Custom SVG slot -->
<mui-icon>
  <svg viewBox="0 0 24 24">...</svg>
</mui-icon>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | - | Lucide icon name |
| `size` | `xs` \| `sm` \| `md` \| `lg` \| `xl` | `md` | Icon size (12/16/20/24/32px) |
| `color` | string | `currentColor` | Icon color (CSS or token name) |
| `stroke-width` | number | 2 | SVG stroke width |
| `spin` | boolean | false | Continuous rotation animation |
| `flip` | `horizontal` \| `vertical` \| `both` | - | Flip transform |

**Implementation:** Lazy-load SVG sprites or use dynamic imports for tree-shaking.

**Status:** ⬜ Not started

---

### 1.2 Typography System

```html
<mui-text variant="h1">Heading 1</mui-text>
<mui-text variant="h2">Heading 2</mui-text>
<mui-text variant="body">Body text</mui-text>
<mui-text variant="caption" color="secondary">Caption</mui-text>
<mui-text variant="code">const x = 42</mui-text>
<mui-text variant="label" weight="semibold">LABEL</mui-text>

<!-- Truncation -->
<mui-text truncate lines="2">Long text that truncates...</mui-text>
```

| Prop | Type | Default |
|------|------|---------|
| `variant` | `h1-h6` \| `body` \| `body-sm` \| `caption` \| `code` \| `label` | `body` |
| `weight` | `normal` \| `medium` \| `semibold` \| `bold` | inherit |
| `color` | `primary` \| `secondary` \| `muted` \| `success` \| `warning` \| `error` | inherit |
| `align` | `left` \| `center` \| `right` | `left` |
| `truncate` | boolean | false |
| `lines` | number | 1 |

**Status:** ⬜ Not started

---

### 1.3 Color/Theme Tokens

Already partially implemented. Ensure comprehensive coverage:

```css
/* Semantic */
--mui-background, --mui-surface, --mui-surface-hover, --mui-surface-active
--mui-border, --mui-border-strong, --mui-border-focus
--mui-text, --mui-text-secondary, --mui-text-muted, --mui-text-disabled

/* Brand */  
--mui-primary, --mui-primary-hover, --mui-primary-active
--mui-accent

/* Feedback */
--mui-success, --mui-warning, --mui-error, --mui-info

/* Component-specific */
--mui-input-bg, --mui-input-border, --mui-input-focus
--mui-card-bg, --mui-card-shadow
--mui-menu-bg, --mui-menu-shadow
```

**Status:** 🟡 Partial

---

## 2. LAYOUT SYSTEM

### 2.1 Flexible Panel Layout (`mui-layout`)

The core layout system for admin apps. **Flexbox-based multi-column layout** with dockable, resizable panels.

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  ┌──────┬─────────────┬─────────────────────────┬────────────────┐ │
│  │      │             │                         │                │ │
│  │ Rail │ Nav Panel   │ Main Content            │ Side Panel     │ │
│  │ 48px │ 240-400px   │ flex: 1                 │ 280-400px      │ │
│  │      │ resizable   │                         │ optional       │ │
│  │      │ collapsible │                         │ collapsible    │ │
│  │      │             │                         │                │ │
│  └──────┴─────────────┴─────────────────────────┴────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

```html
<mui-layout>
  <!-- Icon Rail - always visible, fixed width -->
  <mui-layout-rail slot="rail">
    <mui-rail-item icon="home" href="/" active></mui-rail-item>
    <mui-rail-item icon="folder" href="/content"></mui-rail-item>
    <mui-rail-divider></mui-rail-divider>
    <mui-rail-item icon="settings" href="/settings" position="end"></mui-rail-item>
  </mui-layout-rail>

  <!-- Navigation Panel - collapsible, resizable -->
  <mui-layout-panel 
    slot="nav" 
    collapsible 
    resizable 
    min-width="200" 
    max-width="400"
    default-width="280"
  >
    <mui-panel-header>
      <span slot="title">Content</span>
      <mui-icon-button slot="actions" icon="plus" size="sm"></mui-icon-button>
    </mui-panel-header>
    <mui-tree-view>...</mui-tree-view>
  </mui-layout-panel>

  <!-- Main Content Area -->
  <mui-layout-main>
    <mui-toolbar slot="header">
      <mui-breadcrumb slot="start">...</mui-breadcrumb>
      <mui-button slot="end">Save</mui-button>
    </mui-toolbar>
    <slot></slot>
  </mui-layout-main>

  <!-- Side Panel - optional, can dock left or right -->
  <mui-layout-panel 
    slot="end" 
    collapsible 
    resizable
    position="right"
  >
    <mui-panel-header>
      <span slot="title">Properties</span>
    </mui-panel-header>
    <slot name="properties"></slot>
  </mui-layout-panel>
</mui-layout>
```

#### Components:

| Component | Description |
|-----------|-------------|
| `mui-layout` | Container with flexbox row layout |
| `mui-layout-rail` | Fixed-width icon navigation (48px) |
| `mui-layout-panel` | Collapsible/resizable side panel |
| `mui-layout-main` | Main content area (flex: 1) |
| `mui-panel-header` | Panel header with title/actions |
| `mui-rail-item` | Icon button in rail |
| `mui-rail-divider` | Visual separator in rail |

#### Panel Props:

| Prop | Type | Description |
|------|------|-------------|
| `collapsed` | boolean | Panel collapsed state |
| `collapsible` | boolean | Allow collapse |
| `resizable` | boolean | Allow resize with drag handle |
| `min-width` | number | Minimum width in pixels |
| `max-width` | number | Maximum width in pixels |
| `default-width` | number | Initial width |
| `position` | `start` \| `end` | Dock position |

**Status:** 🟡 Basic panel exists, needs full layout system

---

### 2.2 Existing Layout Components

Already implemented:
- `mui-stack` - Flex stack (row/column)
- `mui-grid` - Flexbox grid with columns  
- `mui-box` - Generic container with spacing props
- `mui-container` - Max-width centered container

**Status:** ✅ Complete

---

## 3. NAVIGATION COMPONENTS

### 3.1 Toolbar (`mui-toolbar`)

Universal toolbar for page headers, sub-headers, and action bars.

```html
<!-- Page Header Toolbar -->
<mui-toolbar size="lg" border="bottom">
  <mui-stack slot="start" direction="row" gap="3" align="center">
    <mui-icon name="file-text" size="lg"></mui-icon>
    <mui-stack direction="column" gap="0">
      <mui-text variant="h2">Dashboard</mui-text>
      <mui-text variant="caption" color="secondary">Overview of your content</mui-text>
    </mui-stack>
  </mui-stack>
  
  <mui-stack slot="end" direction="row" gap="2">
    <mui-button variant="ghost" icon="refresh">Refresh</mui-button>
    <mui-button variant="primary" icon="plus">New Story</mui-button>
  </mui-stack>
</mui-toolbar>

<!-- Filter Toolbar -->
<mui-toolbar size="sm" bg="surface-subtle">
  <mui-tabs slot="start" size="sm">
    <mui-tab active>All</mui-tab>
    <mui-tab>Published</mui-tab>
    <mui-tab>Drafts</mui-tab>
  </mui-tabs>
  
  <mui-stack slot="end" direction="row" gap="2">
    <mui-input type="search" placeholder="Search..." size="sm"></mui-input>
    <mui-select placeholder="Filter by lab" size="sm">...</mui-select>
  </mui-stack>
</mui-toolbar>
```

| Prop | Type | Default |
|------|------|---------|
| `size` | `sm` \| `md` \| `lg` | `md` |
| `sticky` | boolean | false |
| `border` | `none` \| `top` \| `bottom` \| `both` | `none` |
| `bg` | string | `surface` |
| `padding` | `none` \| `sm` \| `md` \| `lg` | `md` |

**Status:** ⬜ Not started

---

### 3.2 Breadcrumb (`mui-breadcrumb`)

```html
<mui-breadcrumb>
  <mui-breadcrumb-item href="/">Home</mui-breadcrumb-item>
  <mui-breadcrumb-item href="/content">Content</mui-breadcrumb-item>
  <mui-breadcrumb-item active>Story Editor</mui-breadcrumb-item>
</mui-breadcrumb>

<!-- With custom separator -->
<mui-breadcrumb separator="/">
  ...
</mui-breadcrumb>

<!-- Collapsible for long paths -->
<mui-breadcrumb max-items="4" collapse="start">
  <!-- Shows: Home / ... / Parent / Current -->
</mui-breadcrumb>
```

**Status:** ⬜ Not started

---

### 3.3 Tabs (`mui-tabs`)

```html
<mui-tabs value="tab1" @change=${this.handleTabChange}>
  <mui-tab value="tab1" icon="file">Documents</mui-tab>
  <mui-tab value="tab2" icon="image">Media</mui-tab>
  <mui-tab value="tab3" icon="settings" disabled>Settings</mui-tab>
</mui-tabs>

<!-- Contained style -->
<mui-tabs variant="contained">...</mui-tabs>

<!-- Vertical -->
<mui-tabs orientation="vertical">...</mui-tabs>
```

| Prop | Type | Default |
|------|------|---------|
| `value` | string | - |
| `variant` | `line` \| `contained` \| `pills` | `line` |
| `orientation` | `horizontal` \| `vertical` | `horizontal` |
| `size` | `sm` \| `md` | `md` |
| `stretch` | boolean | false |

**Status:** ⬜ Not started

---

### 3.4 Tree View (`mui-tree-view`)

Already implemented with drag-drop. Enhancements needed:

```html
<mui-tree-view 
  selectable
  expandable
  draggable
  @select=${this.onSelect}
>
  <mui-tree-item id="root" label="Root" icon="folder">
    <mui-tree-item id="child1" label="Child 1" icon="file"></mui-tree-item>
    <mui-tree-item id="child2" label="Child 2" icon="file" 
      meta="Draft" 
      color="#f59e0b"
    ></mui-tree-item>
  </mui-tree-item>
</mui-tree-view>
```

New props:
- `meta` - Secondary text (e.g., status)
- `color` - Accent color dot
- `actions` - Slot for hover actions

**Status:** 🟡 Basic exists, needs enhancements

---

### 3.5 Existing Navigation

Already implemented:
- `mui-icon-rail` - Vertical icon navigation
- `mui-menu` - Dropdown menu
- `mui-pagination` - Page navigation
- `mui-stepper` - Step wizard

**Status:** ✅ Complete

---

## 4. DATA DISPLAY COMPONENTS

### 4.1 Card (`mui-card`)

Flexible card with header, content, footer, and media slots.

```html
<!-- Basic Card -->
<mui-card>
  <p>Card content</p>
</mui-card>

<!-- Card with Header -->
<mui-card>
  <mui-card-header>
    <mui-icon slot="icon" name="folder" color="primary"></mui-icon>
    <span slot="title">Frontend Labs</span>
    <span slot="subtitle">12 stories</span>
    <mui-icon-button slot="action" icon="more-vertical"></mui-icon-button>
  </mui-card-header>
  <mui-card-content>
    <p>Description text goes here...</p>
  </mui-card-content>
  <mui-card-footer>
    <mui-button variant="ghost" size="sm">View</mui-button>
    <mui-button variant="primary" size="sm">Edit</mui-button>
  </mui-card-footer>
</mui-card>

<!-- Stat Card -->
<mui-card variant="stat" accent="#ec4899">
  <mui-icon slot="icon" name="folder" size="lg"></mui-icon>
  <span slot="label">Total Labs</span>
  <span slot="value">12</span>
  <span slot="change" positive>+3 this week</span>
</mui-card>

<!-- Media Card -->
<mui-card clickable @click=${this.handleClick}>
  <img slot="media" src="..." alt="...">
  <mui-card-header>
    <span slot="title">Article Title</span>
  </mui-card-header>
</mui-card>

<!-- Horizontal Card -->
<mui-card direction="horizontal">
  <img slot="media" src="..." alt="...">
  <mui-card-content>...</mui-card-content>
</mui-card>
```

| Prop | Type | Default |
|------|------|---------|
| `variant` | `default` \| `outlined` \| `elevated` \| `stat` | `default` |
| `padding` | `none` \| `sm` \| `md` \| `lg` | `md` |
| `clickable` | boolean | false |
| `selected` | boolean | false |
| `direction` | `vertical` \| `horizontal` | `vertical` |
| `accent` | string (color) | - |

**Status:** ⬜ Not started

---

### 4.2 Avatar (`mui-avatar`)

```html
<!-- Image Avatar -->
<mui-avatar src="/user.jpg" alt="John Doe"></mui-avatar>

<!-- Initials Fallback -->
<mui-avatar name="John Doe"></mui-avatar> <!-- Shows "JD" -->

<!-- Icon Fallback -->
<mui-avatar icon="user"></mui-avatar>

<!-- Sizes -->
<mui-avatar size="xs" src="..."></mui-avatar> <!-- 24px -->
<mui-avatar size="sm" src="..."></mui-avatar> <!-- 32px -->
<mui-avatar size="md" src="..."></mui-avatar> <!-- 40px -->
<mui-avatar size="lg" src="..."></mui-avatar> <!-- 48px -->
<mui-avatar size="xl" src="..."></mui-avatar> <!-- 64px -->

<!-- With Status -->
<mui-avatar src="..." status="online"></mui-avatar>
<mui-avatar src="..." status="busy"></mui-avatar>
<mui-avatar src="..." status="away"></mui-avatar>

<!-- Avatar Group -->
<mui-avatar-group max="3">
  <mui-avatar src="..."></mui-avatar>
  <mui-avatar src="..."></mui-avatar>
  <mui-avatar src="..."></mui-avatar>
  <mui-avatar src="..."></mui-avatar>
  <mui-avatar src="..."></mui-avatar>
  <!-- Shows 3 avatars + "+2" counter -->
</mui-avatar-group>
```

| Prop | Type | Default |
|------|------|---------|
| `src` | string | - |
| `alt` | string | - |
| `name` | string | - |
| `icon` | string | `user` |
| `size` | `xs` \| `sm` \| `md` \| `lg` \| `xl` | `md` |
| `shape` | `circle` \| `square` | `circle` |
| `status` | `online` \| `offline` \| `busy` \| `away` | - |
| `color` | string | auto from name |

**Status:** ⬜ Not started

---

### 4.3 Persona (`mui-persona`)

User display with avatar, name, and details.

```html
<!-- Basic -->
<mui-persona
  name="John Doe"
  secondary="Software Engineer"
  avatar="/user.jpg"
></mui-persona>

<!-- With Status -->
<mui-persona
  name="John Doe"
  secondary="Available"
  avatar="/user.jpg"
  status="online"
></mui-persona>

<!-- Sizes -->
<mui-persona size="sm" name="John" secondary="JD"></mui-persona>
<mui-persona size="lg" name="John Doe" secondary="Admin" tertiary="Last active 2h ago"></mui-persona>

<!-- Clickable -->
<mui-persona clickable @click=${this.showProfile} ...></mui-persona>

<!-- With Actions -->
<mui-persona name="John Doe" secondary="Admin">
  <mui-icon-button slot="action" icon="message"></mui-icon-button>
  <mui-icon-button slot="action" icon="more-vertical"></mui-icon-button>
</mui-persona>
```

**Status:** ⬜ Not started

---

### 4.4 Badge (`mui-badge`)

```html
<!-- Basic -->
<mui-badge>New</mui-badge>

<!-- Variants -->
<mui-badge variant="solid" color="success">Published</mui-badge>
<mui-badge variant="soft" color="warning">Draft</mui-badge>
<mui-badge variant="outline" color="error">Error</mui-badge>

<!-- Dot Badge -->
<mui-badge dot color="success"></mui-badge>

<!-- With Icon -->
<mui-badge icon="check" color="success">Done</mui-badge>

<!-- As Counter (attached) -->
<div style="position: relative;">
  <mui-icon-button icon="bell"></mui-icon-button>
  <mui-badge count="5" position="top-right"></mui-badge>
</div>
```

| Prop | Type | Default |
|------|------|---------|
| `variant` | `solid` \| `soft` \| `outline` | `soft` |
| `color` | `default` \| `primary` \| `success` \| `warning` \| `error` | `default` |
| `size` | `sm` \| `md` | `md` |
| `dot` | boolean | false |
| `icon` | string | - |
| `count` | number | - |
| `max` | number | 99 |
| `position` | `top-right` \| `top-left` \| `bottom-right` \| `bottom-left` | - |

**Status:** ⬜ Not started

---

### 4.5 List (`mui-list`)

```html
<!-- Basic List -->
<mui-list>
  <mui-list-item>Item 1</mui-list-item>
  <mui-list-item>Item 2</mui-list-item>
  <mui-list-item>Item 3</mui-list-item>
</mui-list>

<!-- Interactive List -->
<mui-list selectable @select=${this.onSelect}>
  <mui-list-item value="1" selected>
    <mui-icon slot="start" name="file"></mui-icon>
    <span slot="primary">Document.pdf</span>
    <span slot="secondary">2.4 MB</span>
    <mui-icon-button slot="end" icon="download"></mui-icon-button>
  </mui-list-item>
  <mui-list-item value="2">
    <mui-icon slot="start" name="image"></mui-icon>
    <span slot="primary">Photo.jpg</span>
    <span slot="secondary">1.2 MB</span>
    <mui-icon-button slot="end" icon="download"></mui-icon-button>
  </mui-list-item>
</mui-list>

<!-- With Dividers and Headers -->
<mui-list>
  <mui-list-header>Section A</mui-list-header>
  <mui-list-item>...</mui-list-item>
  <mui-list-divider></mui-list-divider>
  <mui-list-header>Section B</mui-list-header>
  <mui-list-item>...</mui-list-item>
</mui-list>

<!-- Navigation List -->
<mui-list variant="nav">
  <mui-list-item href="/dashboard" icon="home" active>Dashboard</mui-list-item>
  <mui-list-item href="/content" icon="folder">Content</mui-list-item>
  <mui-list-item href="/settings" icon="settings">Settings</mui-list-item>
</mui-list>
```

| Prop | Type | Default |
|------|------|---------|
| `variant` | `default` \| `nav` \| `menu` | `default` |
| `selectable` | boolean | false |
| `multi` | boolean | false |
| `dense` | boolean | false |

**Status:** ⬜ Not started

---

### 4.6 Data Table (`mui-data-table`)

```html
<mui-data-table
  .columns=${[
    { key: 'title', label: 'Title', sortable: true },
    { key: 'status', label: 'Status', render: (v) => html`<mui-badge ...>${v}</mui-badge>` },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'actions', label: '', width: 80, render: (_, row) => html`<mui-menu>...</mui-menu>` }
  ]}
  .data=${this.stories}
  selectable
  sortable
  paginated
  page-size="20"
  @row-click=${this.onRowClick}
  @selection-change=${this.onSelect}
>
  <mui-toolbar slot="header">
    <mui-input slot="start" type="search" placeholder="Search..."></mui-input>
    <mui-button slot="end">Export</mui-button>
  </mui-toolbar>
  
  <mui-empty-state slot="empty" icon="inbox" 
    title="No stories" 
    description="Create your first story to get started."
  >
    <mui-button>Create Story</mui-button>
  </mui-empty-state>
</mui-data-table>
```

Features needed:
- [ ] Column definitions with render functions
- [ ] Sorting (single/multi)
- [ ] Filtering
- [ ] Pagination (client/server)
- [ ] Row selection (checkbox)
- [ ] Resizable columns
- [ ] Column visibility toggle
- [ ] Row expansion
- [ ] Empty state
- [ ] Loading state (skeleton rows)
- [ ] Sticky header
- [ ] Virtual scrolling for large datasets

**Status:** ⬜ Not started

---

### 4.7 Empty State (`mui-empty-state`)

```html
<mui-empty-state
  icon="inbox"
  title="No items"
  description="You don't have any items yet."
>
  <mui-button variant="primary">Add Item</mui-button>
</mui-empty-state>
```

**Status:** ⬜ Not started

---

### 4.8 Progress (`mui-progress`)

```html
<!-- Linear -->
<mui-progress value="65" max="100"></mui-progress>
<mui-progress value="65" max="100" show-value></mui-progress>
<mui-progress indeterminate></mui-progress>

<!-- Circular -->
<mui-progress variant="circular" value="65" size="md"></mui-progress>
<mui-progress variant="circular" indeterminate></mui-progress>

<!-- With Label -->
<mui-progress value="65" label="Uploading..."></mui-progress>
```

**Status:** ⬜ Not started

---

### 4.9 Skeleton (`mui-skeleton`)

```html
<!-- Text -->
<mui-skeleton variant="text" width="200px"></mui-skeleton>
<mui-skeleton variant="text" lines="3"></mui-skeleton>

<!-- Shapes -->
<mui-skeleton variant="circular" size="40px"></mui-skeleton>
<mui-skeleton variant="rectangular" width="100%" height="200px"></mui-skeleton>

<!-- Card Skeleton -->
<mui-skeleton-card></mui-skeleton-card>
```

**Status:** ⬜ Not started

---

### 4.10 Timeline (`mui-timeline`)

```html
<mui-timeline>
  <mui-timeline-item color="success" icon="check">
    <span slot="title">Published to Blog</span>
    <span slot="time">2 hours ago</span>
  </mui-timeline-item>
  <mui-timeline-item color="primary" icon="edit">
    <span slot="title">Content Updated</span>
    <span slot="time">Yesterday</span>
  </mui-timeline-item>
  <mui-timeline-item color="muted" icon="file-plus">
    <span slot="title">Created</span>
    <span slot="time">3 days ago</span>
  </mui-timeline-item>
</mui-timeline>
```

**Status:** ⬜ Not started

---

## 5. FORM COMPONENTS

### 5.1 Form Field Wrapper (`mui-field`)

Consistent wrapper for all form inputs with label, helper, error.

```html
<mui-field label="Email" required helper="We'll never share your email">
  <mui-input type="email" placeholder="you@example.com"></mui-input>
</mui-field>

<mui-field label="Password" error="Password must be 8+ characters">
  <mui-input type="password"></mui-input>
</mui-field>
```

**Status:** ⬜ Not started

---

### 5.2 Input (`mui-input`)

Already implemented. Enhancements:
- Add `clearable` prop
- Add `prefix`/`suffix` slots
- Add `loading` state

**Status:** 🟡 Partial

---

### 5.3 Select (`mui-select`)

```html
<mui-select 
  label="Choose Lab" 
  placeholder="Select a lab..."
  &value=${this.bind('selectedLab')}
>
  <mui-option value="frontend">Frontend Labs</mui-option>
  <mui-option value="ai">AI Labs</mui-option>
  <mui-option value="backend" disabled>Backend Labs</mui-option>
</mui-select>

<!-- Multiple Selection -->
<mui-select multiple label="Tags">
  <mui-option value="react">React</mui-option>
  <mui-option value="vue">Vue</mui-option>
  <mui-option value="angular">Angular</mui-option>
</mui-select>

<!-- Searchable -->
<mui-select searchable label="Country">
  <!-- Filter options as user types -->
</mui-select>

<!-- With Groups -->
<mui-select label="Assign to">
  <mui-option-group label="Team A">
    <mui-option value="john">John</mui-option>
    <mui-option value="jane">Jane</mui-option>
  </mui-option-group>
  <mui-option-group label="Team B">
    <mui-option value="bob">Bob</mui-option>
  </mui-option-group>
</mui-select>
```

**Status:** ⬜ Not started

---

### 5.4 Textarea (`mui-textarea`)

```html
<mui-textarea
  label="Description"
  placeholder="Enter description..."
  rows="4"
  maxlength="500"
  counter
  resize="vertical"
  &value=${this.bind('description')}
></mui-textarea>
```

**Status:** ⬜ Not started

---

### 5.5 Checkbox (`mui-checkbox`)

```html
<mui-checkbox &checked=${this.bind('agree')}>
  I agree to the terms
</mui-checkbox>

<mui-checkbox indeterminate>Select all</mui-checkbox>

<mui-checkbox-group label="Notifications" &value=${this.bind('notifications')}>
  <mui-checkbox value="email">Email</mui-checkbox>
  <mui-checkbox value="push">Push</mui-checkbox>
  <mui-checkbox value="sms">SMS</mui-checkbox>
</mui-checkbox-group>
```

**Status:** ⬜ Not started

---

### 5.6 Radio (`mui-radio`)

```html
<mui-radio-group label="Plan" &value=${this.bind('plan')}>
  <mui-radio value="free">Free</mui-radio>
  <mui-radio value="pro">Pro - $9/mo</mui-radio>
  <mui-radio value="enterprise" disabled>Enterprise</mui-radio>
</mui-radio-group>

<!-- Card Style Radios -->
<mui-radio-group variant="card" &value=${this.bind('plan')}>
  <mui-radio value="free">
    <span slot="title">Free</span>
    <span slot="description">For personal projects</span>
  </mui-radio>
  ...
</mui-radio-group>
```

**Status:** ⬜ Not started

---

### 5.7 Switch (`mui-switch`)

```html
<mui-switch &checked=${this.bind('darkMode')}>
  Dark Mode
</mui-switch>

<mui-switch size="sm" &checked=${this.bind('notifications')}>
  Enable notifications
</mui-switch>
```

**Status:** ⬜ Not started

---

### 5.8 Slider (`mui-slider`)

```html
<mui-slider 
  min="0" 
  max="100" 
  step="1" 
  &value=${this.bind('volume')}
  label="Volume"
></mui-slider>

<!-- Range Slider -->
<mui-slider 
  range 
  min="0" 
  max="1000" 
  &value=${this.bind('priceRange')}
  format="$%s"
></mui-slider>

<!-- With Marks -->
<mui-slider 
  min="0" 
  max="100" 
  marks=${[0, 25, 50, 75, 100]}
></mui-slider>
```

**Status:** ⬜ Not started

---

### 5.9 Date Picker (`mui-date-picker`)

```html
<mui-date-picker 
  label="Publish Date"
  &value=${this.bind('publishDate')}
  min=${new Date()}
></mui-date-picker>

<!-- Date Range -->
<mui-date-range-picker
  label="Date Range"
  &value=${this.bind('dateRange')}
></mui-date-range-picker>

<!-- With Time -->
<mui-date-picker
  label="Schedule"
  include-time
  &value=${this.bind('scheduleAt')}
></mui-date-picker>
```

**Status:** ⬜ Not started

---

### 5.10 File Upload (`mui-file-upload`)

```html
<mui-file-upload
  accept="image/*"
  max-size="5mb"
  @upload=${this.handleUpload}
>
  <mui-icon slot="icon" name="upload-cloud" size="lg"></mui-icon>
  <span slot="title">Drop files here</span>
  <span slot="subtitle">or click to browse</span>
</mui-file-upload>

<!-- Multiple with Preview -->
<mui-file-upload
  multiple
  preview
  max-files="5"
  .files=${this.files}
  @change=${this.handleFilesChange}
></mui-file-upload>

<!-- Avatar Upload (circular) -->
<mui-avatar-upload
  src=${this.avatarUrl}
  @upload=${this.handleAvatarUpload}
></mui-avatar-upload>
```

**Status:** ⬜ Not started

---

### 5.11 Color Picker (`mui-color-picker`)

```html
<mui-color-picker 
  label="Accent Color"
  &value=${this.bind('color')}
  presets=${['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']}
></mui-color-picker>
```

**Status:** ⬜ Not started

---

## 6. OVERLAY COMPONENTS

### 6.1 Dialog (`mui-dialog`)

```html
<mui-dialog ?open=${this.dialogOpen} @close=${() => this.dialogOpen = false}>
  <span slot="title">Confirm Delete</span>
  <p>Are you sure you want to delete this item? This action cannot be undone.</p>
  <mui-stack slot="actions" direction="row" gap="2" justify="end">
    <mui-button variant="ghost" @click=${this.close}>Cancel</mui-button>
    <mui-button variant="destructive" @click=${this.confirm}>Delete</mui-button>
  </mui-stack>
</mui-dialog>

<!-- Controlled alert dialog -->
<mui-alert-dialog
  ?open=${this.alertOpen}
  title="Unsaved Changes"
  description="You have unsaved changes. Do you want to save before leaving?"
  cancel-text="Discard"
  confirm-text="Save"
  @cancel=${this.discard}
  @confirm=${this.save}
></mui-alert-dialog>
```

**Status:** 🟡 Basic exists, needs polish

---

### 6.2 Drawer (`mui-drawer`)

Already implemented. Ensure all features:
- Positions: left, right, top, bottom
- Sizes: sm, md, lg, full
- Overlay backdrop
- Slide animations
- Close on escape/backdrop click

**Status:** ✅ Complete

---

### 6.3 Popover (`mui-popover`)

```html
<mui-popover>
  <mui-button slot="trigger">Open Popover</mui-button>
  <div slot="content">
    <p>Popover content here</p>
  </div>
</mui-popover>

<!-- Controlled -->
<mui-popover ?open=${this.isOpen} placement="bottom-start">
  ...
</mui-popover>
```

**Status:** ⬜ Not started

---

### 6.4 Tooltip (`mui-tooltip`)

```html
<mui-tooltip content="Save document (Ctrl+S)">
  <mui-icon-button icon="save"></mui-icon-button>
</mui-tooltip>

<!-- Rich content -->
<mui-tooltip>
  <mui-button slot="trigger">Hover me</mui-button>
  <div slot="content">
    <strong>Title</strong>
    <p>Description text</p>
  </div>
</mui-tooltip>
```

**Status:** ⬜ Not started

---

### 6.5 Toast & Alert

Already implemented.

**Status:** ✅ Complete

---

### 6.6 Command Palette (`mui-command-palette`)

```html
<mui-command-palette ?open=${this.commandOpen}>
  <mui-command-input placeholder="Type a command..."></mui-command-input>
  <mui-command-list>
    <mui-command-group label="Navigation">
      <mui-command-item icon="home" shortcut="G H">Go to Dashboard</mui-command-item>
      <mui-command-item icon="folder" shortcut="G C">Go to Content</mui-command-item>
    </mui-command-group>
    <mui-command-group label="Actions">
      <mui-command-item icon="plus" shortcut="N">New Story</mui-command-item>
      <mui-command-item icon="search" shortcut="/">Search</mui-command-item>
    </mui-command-group>
  </mui-command-list>
</mui-command-palette>
```

**Status:** ⬜ Not started

---

## 7. SPECIALIZED COMPONENTS

### 7.1 Kanban Board (`mui-kanban`)

```html
<mui-kanban
  .columns=${this.columns}
  .items=${this.stories}
  @item-move=${this.handleMove}
  @column-drop=${this.handleColumnDrop}
>
  <template slot="column-header" let:column>
    <mui-stack direction="row" align="center" gap="2">
      <span class="dot" style="background: ${column.color}"></span>
      <span>${column.label}</span>
      <mui-badge count="${column.items.length}"></mui-badge>
    </mui-stack>
  </template>
  
  <template slot="card" let:item>
    <mui-card variant="outlined" padding="sm">
      <span slot="title">${item.title}</span>
      <mui-badge slot="meta" color="${item.statusColor}">${item.status}</mui-badge>
    </mui-card>
  </template>
</mui-kanban>
```

**Status:** ⬜ Not started

---

### 7.2 Calendar (`mui-calendar`)

```html
<mui-calendar
  view="month"
  .events=${this.events}
  @date-click=${this.handleDateClick}
  @event-click=${this.handleEventClick}
  @event-drop=${this.handleEventDrop}
>
  <template slot="event" let:event>
    <div class="event-chip" style="background: ${event.color}">
      ${event.title}
    </div>
  </template>
</mui-calendar>
```

Views: month, week, day, agenda

**Status:** ⬜ Not started

---

### 7.3 Rich Text Editor (`mui-editor`)

Markdown editor with preview, toolbar, and image upload.

```html
<mui-editor
  &value=${this.bind('content')}
  placeholder="Write your story..."
  toolbar="full"
  preview="split"
  @image-upload=${this.handleImageUpload}
></mui-editor>
```

**Status:** ⬜ Not started

---

## IMPLEMENTATION PRIORITY

### Phase 1: Core Foundation (Week 1)
1. ✅ Design Tokens (complete)
2. ⬜ `mui-icon` with Lucide
3. ⬜ `mui-text` typography
4. ⬜ `mui-avatar` + `mui-avatar-group`
5. ⬜ `mui-badge`

### Phase 2: Layout & Navigation (Week 2)
1. ⬜ `mui-layout` system (rail + panels)
2. ⬜ `mui-toolbar`
3. ⬜ `mui-breadcrumb`
4. ⬜ `mui-tabs`
5. 🟡 Tree view enhancements

### Phase 3: Cards & Lists (Week 3)
1. ⬜ `mui-card` with all variants
2. ⬜ `mui-card-header`
3. ⬜ `mui-persona`
4. ⬜ `mui-list` + `mui-list-item`
5. ⬜ `mui-empty-state`

### Phase 4: Forms (Week 4)
1. ⬜ `mui-field` wrapper
2. ⬜ `mui-select` + `mui-option`
3. ⬜ `mui-textarea`
4. ⬜ `mui-checkbox` + `mui-checkbox-group`
5. ⬜ `mui-radio` + `mui-radio-group`
6. ⬜ `mui-switch`

### Phase 5: Advanced Forms (Week 5)
1. ⬜ `mui-slider`
2. ⬜ `mui-date-picker`
3. ⬜ `mui-file-upload`
4. ⬜ `mui-color-picker`

### Phase 6: Data Display (Week 6)
1. ⬜ `mui-data-table`
2. ⬜ `mui-progress`
3. ⬜ `mui-skeleton`
4. ⬜ `mui-timeline`

### Phase 7: Overlays & Advanced (Week 7-8)
1. ⬜ `mui-dialog` polish
2. ⬜ `mui-popover`
3. ⬜ `mui-tooltip`
4. ⬜ `mui-command-palette`
5. ⬜ `mui-kanban`
6. ⬜ `mui-calendar`

---

## STATUS LEGEND

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🟡 | Partial/needs work |
| ✅ | Complete |
