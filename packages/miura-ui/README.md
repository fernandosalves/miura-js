# Miura UI Next

Miura UI should be rebuilt as a workspace-grade design system for Miura applications: fast web components, accessible interaction primitives, and higher-level surfaces for admin, editorial, notebook, kanban, calendar, and graph-like product UIs.

This README is an implementation plan for the new package. The current source remains useful as reference material, but it should not be treated as the target architecture.

## Why Rebuild

The current `packages/miura-ui` package has the right ambition but the wrong center of gravity:

- It exports many components from `src/index.ts`, but several listed APIs are missing, duplicated, or only partially implemented.
- It mixes primitives, styled components, application widgets, token files, and Storybook demos without a stable contract between layers.
- Component quality is uneven: some controls are simple and reusable, while complex components such as kanban/calendar are too domain-specific and under-specified for a general package.
- The docs claim """unstyled by default""", while the source ships opinionated styling and tokens.
- The package does not yet expose subpath exports, so consumers pay too much conceptual and bundle cost for small usage.

The blog admin UI in `/Users/fernandoalves/Desktop/blog-gesys/apps/admin/src/components/ui` is a better design seed. It contains the product patterns Miura UI can own: icon rails, foldable navigation, split panes, content trees, context panels, dense forms, markdown surfaces, kanban boards, calendars, and mindmap canvases.

## Competitive Read

Modern design-system libraries cluster into five groups:

| Group | Examples | What they teach us | What Miura should avoid |
| --- | --- | --- | --- |
| Headless primitives | Radix UI, Headless UI, Angular Primitives, UI Ingredients | Behavior and accessibility should be reusable independently from styling. | Do not make users fight hard-coded DOM, colors, or layout. |
| Copy-owned components | shadcn/ui | Developers like owning the final component source and design language. | Do not make the package feel like an opaque theme prison. |
| Enterprise web components | Adobe Spectrum, UI5 Web Components, Shoelace/Web Awesome, Lion | Framework-agnostic custom elements are strong for design systems and multi-app adoption. | Do not ship huge monolithic imports or inconsistent theming contracts. |
| App-shell systems | Fluent, Atlassian, Linear-like internal systems | Real products need navigation density, panels, command surfaces, data grids, context areas, and workflow states. | Do not stop at buttons, inputs, cards, and badges. |
| Canvas/workspace tools | Notion, Linear, Muse, Excalidraw, Milanote, Fibery | The next useful UI layer is spatial, multi-panel, keyboard-first, and context-aware. | Do not force everything into isolated cards and dialogs. |

The opening for Miura UI is not """yet another component library""". It is **a native-web workspace UI system for Miura**.

## Design Thesis

Miura UI should feel like a precise workbench:

- Compact, scannable, and keyboard-friendly by default.
- Built around panels, rails, trees, tabs, boards, calendars, inspectors, and command surfaces.
- Accessible at the behavior layer, themeable at the token layer, expressive at the recipe layer.
- Fast enough that base UI primitives can be used everywhere without hesitation.
- Plain web components first, Miura-enhanced when reactivity/forms/router/context are needed.

## Package Layers

Use layered packages or layered subpaths. The important part is that each layer has a clear job.

```text
@miurajs/miura-ui
  /tokens       design tokens, themes, density, motion, CSS layers
  /nano         tiny HTMLElement base and DOM helpers, no MiuraElement dependency
  /primitives   accessible headless behavior primitives
  /elements     styled Miura web components
  /forms        controls integrated with Miura form support
  /workspace    panels, rails, navigation, split panes, command surfaces
  /data         tables, lists, trees, calendar, timeline, virtualized views
  /canvas       kanban, mindmap, node graph, spatial board primitives
  /recipes      composed app patterns and copy-owned examples
```

Subpath exports should allow this:

```ts
import '@miurajs/miura-ui/elements/button';
import '@miurajs/miura-ui/workspace/shell';
import { createDisclosure } from '@miurajs/miura-ui/primitives/disclosure';
import { tokens } from '@miurajs/miura-ui/tokens';
```

## The `miura-nano` Decision

Create a tiny internal base, but do not replace `MiuraElement` with it.

`MiuraElement` is valuable for components that need signals, forms, resources, context, global shared state, lifecycle helpers, debugger integration, and AOT/JIT rendering. Workspace components such as notebook trees, nav panels, command palettes, calendars, kanban boards, and mindmaps should keep those features.

`miura-nano` should exist for the smallest pieces:

- icon
- spinner
- badge
- visually-hidden
- primitive button wrapper when native button is enough
- theme-provider attribute bridge
- token/style registration helpers
- low-level popover/positioning anchors if they do not render dynamic templates

Suggested contract:

```ts
export class MiuraNanoElement extends HTMLElement {
  static tagName?: string;
  static styles?: CSSStyleSheet | string | Array<CSSStyleSheet | string>;
  static observedAttributes: string[];

  protected root: ShadowRoot;
  protected mounted(): void | (() => void);
  protected updated(name: string, oldValue: string | null, value: string | null): void;
  protected render(): Node | string | void;
  protected emit<T>(type: string, detail?: T, options?: EventInit): boolean;
}
```

Rules:

- Use `MiuraNanoElement` only when the component does not need signals, template directives, form controller access, resources, context consumption, router bridge, or debugger snapshots.
- Use `MiuraElement` for anything with meaningful state, lists, async data, forms, or app-shell coordination.
- Keep the `nano` layer private at first. Promote it only after bundle-size measurements prove the split is worthwhile.

## Core Architecture

### 1. Tokens First

Define a token system before components are rebuilt.

Token families:

- `color`: background, surface, surface-hover, border, text, muted, accent, danger, warning, success.
- `space`: dense admin rhythm from `2px` to `48px`.
- `radius`: sharp professional defaults, mostly `2px`, `4px`, `6px`, `8px`.
- `density`: `compact`, `cozy`, `comfortable`.
- `type`: UI text, label, code, title, mono.
- `motion`: duration and easing, plus reduced-motion behavior.
- `z`: overlay, toast, popover, modal, command, drag layer.
- `layout`: rail width, panel width, inspector width, toolbar height.

Use CSS cascade layers:

```css
@layer miura.reset, miura.tokens, miura.base, miura.components, miura.recipes, app.overrides;
```

The blog tokens are a strong starting point because they already encode compact admin behavior. Clean up naming and remove product-specific colors from base tokens.

### 2. Behavior Primitives

Create unstyled behavior controllers before styled elements.

Initial primitive controllers:

- `createDisclosure`
- `createRovingFocus`
- `createListbox`
- `createMenu`
- `createDialog`
- `createPopover`
- `createTabs`
- `createTree`
- `createResizablePane`
- `createSortable`
- `createCalendarGrid`
- `createDragDropBoard`
- `createNodeCanvas`

These should be plain TypeScript state machines/controllers that can be used by Miura components, external web components, or future adapters.

### 3. Styled Elements

Build styled custom elements on top of primitives.

Element standards:

- One element per file.
- No default mega-import side effects.
- Every element exposes `part` names and data-state attributes.
- Every interactive component supports keyboard usage and focus-visible styling.
- Every component has a controlled/uncontrolled contract where relevant.
- Every component documents events with `detail` payloads.
- Components use tokens only, not hard-coded product colors.

### 4. Forms

Miura already has form support under the hood via `createForm`, field refs, validation, async validation, touched/dirty state, submit lifecycle, and debugger snapshots. Miura UI forms should not invent a second form model.

Form controls should integrate with Miura forms by convention:

```html
<mui-field name="title" label="Title">
  <mui-input name="title"></mui-input>
</mui-field>
```

Recommended form component set:

- `mui-form`
- `mui-field`
- `mui-label`
- `mui-help-text`
- `mui-error-text`
- `mui-input`
- `mui-textarea`
- `mui-checkbox`
- `mui-radio-group`
- `mui-switch`
- `mui-select`
- `mui-combobox`
- `mui-date-field`
- `mui-file-drop`
- `mui-segmented-control`

Controls should expose native form semantics where possible and bridge to `Form.field(name)` when used inside a Miura form context.

### 5. Workspace Components

This is Miura UI""'s differentiator.

Build these early:

- `mui-app-shell`: rail + nav panel + content + inspector slots.
- `mui-icon-rail`: compact primary navigation with active state, tooltips, fold/unfold behavior.
- `mui-nav-panel`: secondary navigation with sections, resize, compact/hidden states.
- `mui-content-tree`: generic tree model extracted from the blog notebook/content panels.
- `mui-split-pane`: robust horizontal/vertical resize with persisted sizes.
- `mui-context-panel`: inspector/detail panel connected through context or events.
- `mui-command`: command palette and command bar.
- `mui-toolbar`: icon-heavy command surface.
- `mui-empty-state`, `mui-status-bar`, `mui-presence`, `mui-shortcut`.

### 6. Canvas Components

Treat kanban, mindmap, and calendar as first-class workspace primitives, not special demos.

Canvas family:

- `mui-kanban-board`: generic columns/cards with reorder, drop zones, render hooks, keyboard movement.
- `mui-calendar-grid`: year/month/week modes, cell render hooks, drag/drop events.
- `mui-node-canvas`: pan/zoom/select/drag/resize foundation.
- `mui-mindmap`: recipe built on `mui-node-canvas`.
- `mui-notebook`: recipe combining tree + board/canvas + inspector.

The blog mindmap proves Miura can own spatial UI, but the reusable package should separate canvas mechanics from blog-specific page/card data.

## Blog Component Migration Map

| Blog component | Target package area | Action |
| --- | --- | --- |
| `mui-button`, `mui-input`, `mui-textarea`, `mui-checkbox`, `mui-switch` | `/elements`, `/forms` | Rebuild around form integration, parts, states, density. |
| `mui-panel`, `mui-card`, `mui-stack` | `/elements`, `/workspace` | Keep compact geometry, normalize tokens. |
| `mui-icon`, `icons.ts` | `/nano`, `/elements` | Keep tiny and tree-shakeable; define icon registry. |
| `mui-icon-rail`, `mui-nav-panel` | `/workspace` | Generalize data model, remove app route coupling. |
| `mui-content-tree-panel`, `mui-notebook-tree-panel` | `/workspace/content-tree` | Extract generic tree, then add notebook recipe. |
| `mui-split-pane`, `mui-master-detail` | `/workspace/layout` | Merge into pane system with persisted sizes. |
| `mui-calendar-grid` | `/data/calendar` | Promote; add keyboard/a11y and view adapters. |
| `mui-kanban-board`, `mui-kanban-card` | `/canvas/kanban` | Promote as generic board with render callbacks. |
| `mui-mindmap-view` | `/canvas/node-canvas` and `/recipes/mindmap` | Split pan/zoom/drag mechanics from node rendering. |
| `mui-md-editor`, `mui-md-preview`, `mui-code-block` | `/recipes/editor` | Keep as optional recipe; avoid core dependency bloat. |
| `mui-uploader` | `/forms/file-drop` and `/recipes/media-picker` | Split file control from CMS media-library assumptions. |
| `mui-chart` | `/data/chart` or external recipe | Keep optional; avoid chart dependency in core. |

## API Principles

### Events

Events should be predictable and composed:

```ts
this.emit('change', { value }, { bubbles: true, composed: true });
this.emit('open-change', { open: this.open }, { bubbles: true, composed: true });
this.emit('item-move', { itemId, from, to, index }, { bubbles: true, composed: true });
```

### State Attributes

Every interactive element should expose stable selectors:

```html
<mui-button data-variant="primary" data-size="sm" data-state="loading"></mui-button>
<mui-nav-item data-active="true" data-disabled="false"></mui-nav-item>
```

### Parts

Shadow DOM components must expose parts:

```css
mui-button::part(control) {}
mui-field::part(label) {}
mui-dialog::part(panel) {}
mui-kanban-board::part(column) {}
```

### Slots

Use slots for composition, render callbacks for data-heavy views, and recipes for opinionated layouts.

## Accessibility Bar

Before a component is considered stable, it needs:

- Keyboard behavior documented and tested.
- Focus-visible styling.
- ARIA roles and labels where native semantics are insufficient.
- Disabled/read-only/loading states.
- Reduced-motion behavior.
- High-contrast token checks.
- Screen-reader smoke tests for dialog, menu, listbox, tree, tabs, calendar, and board interactions.

## Implementation Phases

### Phase 0: Freeze and Document

- Mark current `miura-ui` source as legacy/reference.
- Keep exports working during the rebuild.
- Add a migration note to release docs.
- Decide package name: keep `@miurajs/miura-ui` for stable package, build next version behind subpaths or `src-next`.

### Phase 1: Foundations

- Add token CSS with cascade layers.
- Add density/theme provider.
- Add icon registry.
- Add `MiuraNanoElement` experiment behind `/nano/internal`.
- Add subpath exports in `package.json`.
- Add test harness for custom-element accessibility and keyboard interactions.

### Phase 2: Primitive Controllers

- Implement disclosure, roving focus, dialog, popover, menu, tabs, tree, resizable pane.
- Unit-test behavior without rendering.
- Use these controllers inside components instead of duplicating logic.

### Phase 3: Core Elements

- Rebuild button, icon button, input, textarea, checkbox, switch, field, select/combobox, tabs, dialog, popover, menu, toast.
- Integrate form fields with Miura form support.
- Add stories for states, density, dark mode, keyboard use, and invalid states.

### Phase 4: Workspace Kit

- Rebuild app shell, icon rail, nav panel, split pane, content tree, context panel, command palette, toolbar.
- Migrate blog admin to consume these components.
- Keep app-specific route/store logic outside UI components.

### Phase 5: Canvas Kit

- Extract node canvas from mindmap.
- Rebuild kanban on top of generic drag/drop board primitives.
- Promote calendar grid with view adapters and cell render hooks.
- Add performance tests for large boards/trees/calendars.

### Phase 6: Recipes

- Notebook workspace recipe.
- Editorial CMS recipe.
- Admin dashboard recipe.
- Markdown editor/media picker as optional imports.

## Source Strategy

Do not delete all current source immediately. Use a staged replacement:

1. Move current code mentally into """legacy/reference""".
2. Build new foundations in parallel under clear subfolders.
3. Port one vertical slice first: tokens + button + field + input + dialog + split-pane + icon-rail.
4. Once the new slice is used by the blog admin, remove or rewrite legacy equivalents.

Deleting everything first would remove useful blog-proven interaction details and make migration harder. The better move is controlled replacement.

## First Vertical Slice

Build this slice first because it exercises every important layer:

```text
tokens
icon
button
field
input
switch
dialog
split-pane
icon-rail
nav-panel
content-tree
```

Success criteria:

- Blog admin can replace its local equivalents for these components.
- Components work in light/dark themes and compact density.
- Keyboard behavior is covered by tests.
- Each component can be imported by subpath.
- Bundle size is measured for a single button, a form field, and the workspace shell.

## Open Decisions

- Whether `MiuraNanoElement` becomes public or stays internal.
- Whether the package ships styled defaults only, or also headless controllers as public API.
- Whether complex recipes live in `@miurajs/miura-ui/recipes` or a separate `@miurajs/miura-recipes` package.
- Whether chart/editor/media-picker remain optional recipes to avoid core bloat.
- How much of the debugger metadata should be surfaced for UI component state inspection.

## Recommendation

Build Miura UI Next as a layered web-component design system with a strong workspace/canvas identity. Keep `MiuraElement` as the default base for serious components. Add a tiny `MiuraNanoElement` only for ultra-small static primitives after measurement. Use the blog admin components as design and interaction prototypes, but extract generic controllers and data models before moving them into the package.
