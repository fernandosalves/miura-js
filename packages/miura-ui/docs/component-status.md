# miura UI Component Status

A quick audit of the components under `packages/miura-ui/src`. Use this to prioritize stabilization work (stories, docs, tests).

## Legend

- ✅ Implemented & registered (initial pass complete)
- ⚠️ Present but needs verification (check export/registration/tests)
- ⏳ Stub or missing implementation file

_Note: Status is based on file presence/initial inspection. Detailed testing still required._

| Category | Component | Tag | Status | Notes |
|----------|-----------|-----|--------|-------|
| Base | MuiBase | n/a | ✅ | Extends MiuraElement with theming/a11y helpers |
| Inputs | Button | `<mui-button>` | ✅ | Variants/sizes/tones, loading state, token-driven styles |
| Inputs | Input | `<mui-input>` | ✅ | Prefix/suffix slots, statuses, size props, token-driven focus states |
| Inputs | Checkbox | `<mui-checkbox>` | ✅ | Tokenized control with check/indeterminate states, events |
| Inputs | Checkbox Group | `<mui-checkbox-group>` | ✅ | Label, orientation, gap props, group change events |
| Inputs | Radio | `<mui-radio>` | ✅ | Tokenized radio button with size variants and keyboard support |
| Inputs | Radio Group | `<mui-radio-group>` | ✅ | Radiogroup roles, orientation/gap props, keyboard navigation |
| Inputs | Range Slider | `<mui-range>` | ✅ | Tokenized track/thumb, value badge, mui-input/mui-change events |
| Inputs | Rating | `<mui-rating>` | ✅ | Tokenized stars, allowHalf, keyboard + click handlers |
| Inputs | File Drop | `<mui-file-drop>` | ✅ | Tokenized dropzone, drag/hover states, mui-files event |
| Layout | Box | `<mui-box>` | ✅ | Token-driven surface utility (padding/margin/radius/elevation/background) |
| Layout | Container | `<mui-container>` | ✅ | Responsive sizes (sm–xl/full), gutters toggle, padded flag |
| Layout | Grid | `<mui-grid>` | ✅ | Responsive columns (fixed/auto-fit), tokenized gaps, minWidth prop |
| Layout | Stack | `<mui-stack>` | ✅ | Attribute-driven flex layout (direction, gap, align, justify, wrap, inline) |
| Layout | Spacer | `<mui-spacer>` | ✅ | Orientation (horizontal/vertical), size tokens, flex + inline options |
| Layout | Scroll Area | `<mui-scroll-area>` | ✅ | Tokenized surface, maxHeight prop, optional hidden scrollbars, focus ring |
| Layout | Draggable | `<mui-draggable>` | ✅ | Pointer-based drag (axis constraint, ghost mode, boundary, drag events) |
| Layout | Resizable | `<mui-resizable>` | ✅ | Tokenized surface with min/max bounds, axis constraints, resize handles |
| Layout | Overlay | `<mui-overlay>` | ✅ | Toned backdrops (dark/light/blur), open/dismiss props, close event |
| Layout | Portal | `<mui-portal>` | ✅ | Teleports children to target selector, optional class inheritance |
| Layout | Focus Trap Zone | `<mui-focus-trap-zone>` | ✅ | Focus sentinels, return focus option, traps keyboard navigation |
| Layout | Visually Hidden | `<mui-visually-hidden>` | ⚠️ | Should be simple span |
| Data Display | Avatar | `<mui-avatar>` | ✅ | Tokenized sizes/shapes, image fallback, status indicator |
| Data Display | Badge | `<mui-badge>` | ✅ | Variants (solid/soft/outline), tone, dot + placement options, max value |
| Data Display | Card | `<mui-card>` | ✅ | Header/footer slots, variant + padding props, tokenized surface |
| Data Display | Chip/Tag | `<mui-chip>` / `<mui-tag>` | ✅ | Variant/tone/size props, removable events, icon slot |
| Data Display | Timeline | `<mui-timeline>` | ✅ | Vertical/horizontal support, tokenized indicator line |
| Data Display | Table | `<mui-table>` | ✅ | Tokenized wrapper, density/zebra/hover props, sticky headers |
| Data Display | Progress | `<mui-progress>` | ✅ | Linear/circular modes, determinate/indeterminate tokenized styling |
| Data Display | Skeleton/Shimmer | `<mui-skeleton>` / `<mui-shimmer>` | ✅ | Tokenized sizes/radius, optional animation toggle |
| Navigation | Accordion | `<mui-accordion>` | ✅ | Accessible toggle button, emits open state, tokenized surface |
| Navigation | Breadcrumbs | `<mui-breadcrumbs>` | ✅ | Slot-driven items with separator prop and aria labels |
| Navigation | Dropdown/Menu | `<mui-dropdown>` / `<mui-menu>` | ✅ | Toggleable dropdown with placement + overlay dismissal |
| Navigation | Nav Drawer | `<mui-nav-drawer>` | ✅ | Sliding drawer with modal overlay, ESC/click dismissal |
| Navigation | Command Bar | `<mui-command-bar>` | ✅ | Tokenized surface/transparent variants, compact/comfortable density, spacer slot |
| Overlay & Feedback | Dialog | `<mui-dialog>` | ✅ | Tokenized modal overlay, header/actions slots, ESC/click dismiss |
| Overlay & Feedback | Drawer | `<mui-drawer>` | ✅ | Sliding overlay (4 positions), modal option, ESC/click dismiss |
| Overlay & Feedback | Tooltip | `<mui-tooltip>` | ✅ | Tokenized placement/delay, hover/focus triggers, arrow indicator |
| Overlay & Feedback | Alert | `<mui-alert>` | ✅ | Tokenized tones (success/danger/warning/info), dismissible, icon slot |
| Overlay & Feedback | Snackbar/Toast | `<mui-snackbar>` / `<mui-toast>` | ✅ | Tokenized placement, auto-dismiss, action slot, timeout/action events |
| Typography | Text | `<mui-text>` | ✅ | Tokenized variants (body/caption/overline/subtitle), display prop, tone support |
| Typography | Heading | `<mui-heading>` | ✅ | Semantic h1-h6, tokenized sizes/weights, tone support |
| Typography | Link | `<mui-link>` | ✅ | Tokenized variants/tone, href/target forwarding, rel handling |
| Typography | Code/Kbd | `<mui-code>` / `<mui-kbd>` | ✅ | Tokenized mono styling, semantic tags, border/shadow on kbd |

## Next Actions

1. ✅ **Registration/Export Pass** – updated `packages/miura-ui/src/index.ts` to export upgraded components with correct paths.
2. ✅ **Storybook Verification** – updated stories for button, input, avatar, accordion, text, dialog, snackbar, and alert to showcase new variants/props. Added theme provider wrapper and Storybook config for proper styling.
3. **Status Updates** – as components are verified, flip their status to ✅ and note any missing features/tests.
4. **Testing** – add vitest smoke tests per component (render + basic interaction) using existing jsdom setup.
5. **Docs** – eventually split this table per category with links to stories/tests for transparency.
