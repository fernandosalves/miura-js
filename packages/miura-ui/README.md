# miura UI

A modern, unstyled, accessible UI component library for [miura](https://github.com/miura). Build beautiful, accessible web apps with composable primitives—your way.

---

## ✨ Philosophy

- **Unstyled by default:** Bring your own design system, CSS, or utility classes. miura UI provides only structure and accessibility.
- **Accessible:** All components are WAI-ARIA compliant, keyboard navigable, and screen reader friendly.
- **Composable:** Designed for flexible composition and slotting.
- **Themeable:** Use CSS custom properties or your own classes for theming.
- **Type-safe:** Full TypeScript support.

---

## 🚀 Features

- Unstyled, accessible primitives
- Easy to style with CSS, Tailwind, or any system
- Composable APIs and slot support
- Focus on accessibility and developer experience
- Ready for theming and customization

---

## 🧩 Component Primitives & Advanced Components

### Primitives & Inputs
- **Button** (`<mui-button>`)
- **IconButton** (`<mui-icon-button>`)
- **Input** (`<mui-input>`)
- **Textarea** (`<mui-textarea>`)
- **Checkbox** (`<mui-checkbox>`)
- **Radio** (`<mui-radio>`)
- **Switch/Toggle** (`<mui-switch>`)
- **Select/Dropdown** (`<mui-select>`)
- **Slider** (`<mui-slider>`)
- **Pin Input** (`<mui-pin-input>`)
- **File Upload** (`<mui-file-upload>`)
- **Combobox** (`<mui-combobox>`)
- **Autocomplete** (`<mui-autocomplete>`)
- **Segmented Control** (`<mui-segmented-control>`)

### Navigation
- **Tabs** (`<mui-tabs>`)
- **Breadcrumbs** (`<mui-breadcrumbs>`)
- **Pagination** (`<mui-pagination>`)
- **Menu** (`<mui-menu>`)
- **Dropdown** (`<mui-dropdown>`)
- **Accordion** (`<mui-accordion>`)
- **Stepper** (`<mui-stepper>`)
- **Navigation Drawer** (`<mui-nav-drawer>`)
- **Sidebar** (`<mui-sidebar>`)
- **Command Bar** (`<mui-command-bar>`)
- **Toolbar** (`<mui-toolbar>`)

### Overlay & Feedback
- **Dialog / Modal** (`<mui-dialog>`)
- **Drawer** (`<mui-drawer>`)
- **Popover** (`<mui-popover>`)
- **Tooltip** (`<mui-tooltip>`)
- **Alert** (`<mui-alert>`)
- **Snackbar / Toast** (`<mui-snackbar>`)
- **Progress (Linear, Circular)** (`<mui-progress>`)
- **Spinner / Loader** (`<mui-spinner>`)
- **Backdrop** (`<mui-backdrop>`)
- **MessageBar** (`<mui-message-bar>`)
- **TeachingBubble** (`<mui-teaching-bubble>`)

### Data Display
- **List** (`<mui-list>`)
- **Table** (`<mui-table>`)
- **Avatar** (`<mui-avatar>`)
- **Badge** (`<mui-badge>`)
- **Card** (`<mui-card>`)
- **Divider** (`<mui-divider>`)
- **Calendar** (`<mui-calendar>`)
- **Date Picker** (`<mui-date-picker>`)
- **Time Picker** (`<mui-time-picker>`)
- **Tag / Chip** (`<mui-tag>`)
- **Collapse** (`<mui-collapse>`)
- **Timeline** (`<mui-timeline>`)
- **DetailsList** (`<mui-details-list>`)
- **Persona** (`<mui-persona>`)
- **Shimmer** (`<mui-shimmer>`)

### Layout & Utility
- **Stack (vertical/horizontal)** (`<mui-stack>`)
- **Grid** (`<mui-grid>`)
- **Box** (`<mui-box>`)
- **Container** (`<mui-container>`)
- **Spacer** (`<mui-spacer>`)
- **Portal** (`<mui-portal>`)
- **Visually Hidden** (`<mui-visually-hidden>`)
- **Scroll Area** (`<mui-scroll-area>`)
- **Resizable** (`<mui-resizable>`)
- **Draggable** (`<mui-draggable>`)
- **FocusTrapZone** (`<mui-focus-trap-zone>`)
- **Overlay** (`<mui-overlay>`)

### Typography
- **Text** (`<mui-text>`)
- **Heading** (`<mui-heading>`)
- **Link** (`<mui-link>`)
- **Code** (`<mui-code>`)
- **Kbd (Keyboard key)** (`<mui-kbd>`)
- **Blockquote** (`<mui-blockquote>`)
- **Label** (`<mui-label>`)

---


---

## 📦 Installation

```bash
npm install @miurajs/ui
```

---

## 🛠 Usage Example

```ts
import '@miurajs/ui/button';
```

```html
<mui-button>Click me</mui-button>
```

### Styling

miura UI components are unstyled by default. Style them however you like:

```css
mui-button button {
  background: #0078d4;
  color: #fff;
  border-radius: 4px;
  padding: 0.5em 1em;
}
```

Or use utility classes:

```html
<mui-button class="bg-blue-600 text-white rounded px-4 py-2">Save</mui-button>
```

---

## 🎨 Theming

Override CSS custom properties or add your own classes for theming. Example:

```css
:root {
  --mui-primary: #0078d4;
  --mui-radius: 4px;
}
```

---

## ♿ Accessibility

All components are:
- WAI-ARIA compliant
- Keyboard navigable
- Screen reader friendly

---

## 🛤 Roadmap
- [ ] Add more primitives and advanced components (see list above)
- [ ] Provide accessibility documentation for each component
- [ ] Add Storybook with usage and styling examples
- [ ] Support for dark mode and theming tokens

---

## 🤝 Contributing

Contributions are welcome! Please open issues or PRs for new components, bug fixes, or documentation improvements.

---

## 📄 License

MIT
