// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { TemplateCompiler } from './compiler';
import { html } from '../html';

describe('TemplateCompiler events', () => {
  it('applies prevent and stop modifiers in compiled event handlers', () => {
    const compiler = new TemplateCompiler();
    const parentHandler = vi.fn();
    const childHandler = vi.fn();

    const template = html`
      <div @mousedown=${parentHandler}>
        <button @mousedown|prevent,stop=${childHandler}>Drag</button>
      </div>
    `;

    const compiled = compiler.compile(template);
    const { fragment } = compiled.render(template.values);
    document.body.appendChild(fragment);

    const button = document.querySelector('button');
    expect(button).not.toBeNull();

    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    button!.dispatchEvent(event);

    expect(childHandler).toHaveBeenCalledTimes(1);
    expect(parentHandler).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);

    document.body.innerHTML = '';
  });

  it('applies static and dynamic % utilities in compiled templates', () => {
    const compiler = new TemplateCompiler();
    const template = html`
      <div id="compiled" %="flex p-2" %grow=${'1'}>
        Content
      </div>
    `;

    const compiled = compiler.compile(template);
    const { fragment, refs } = compiled.render(template.values);
    document.body.appendChild(fragment);

    const element = document.getElementById('compiled') as HTMLDivElement;
    expect(element.classList.contains('miura-u-flex')).toBe(true);
    expect(element.classList.contains('miura-u-p-2')).toBe(true);
    expect(element.style.flexGrow).toBe('1');

    compiled.update(refs, ['0']);
    expect(element.style.flexGrow).toBe('0');

    document.body.innerHTML = '';
  });

  it('supports object values on class and style in compiled templates', () => {
    const compiler = new TemplateCompiler();
    const template = html`
      <div id="compiled-box" class=${{ active: true }} style=${{ width: 10, color: 'red' }}></div>
    `;

    const compiled = compiler.compile(template);
    const { fragment, refs } = compiled.render(template.values);
    document.body.appendChild(fragment);

    const element = document.getElementById('compiled-box') as HTMLDivElement;
    expect(element.classList.contains('active')).toBe(true);
    expect(element.style.width).toBe('10px');
    expect(element.style.color).toBe('red');

    compiled.update(refs, [{ active: false, hidden: true }, { height: 18, color: 'blue' }]);
    expect(element.classList.contains('active')).toBe(false);
    expect(element.classList.contains('hidden')).toBe(true);
    expect(element.style.width).toBe('');
    expect(element.style.height).toBe('18px');
    expect(element.style.color).toBe('blue');

    document.body.innerHTML = '';
  });

  it('keeps a simple button click handler working with an inline svg child', () => {
    const compiler = new TemplateCompiler();
    const clickHandler = vi.fn();

    const template = html`
      <button id="simple-svg-btn" @click=${clickHandler}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        Back
      </button>
    `;

    const compiled = compiler.compile(template);
    const { fragment } = compiled.render(template.values);
    document.body.appendChild(fragment);

    const button = document.getElementById('simple-svg-btn') as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(clickHandler).toHaveBeenCalledTimes(1);

    document.body.innerHTML = '';
  });

  it('preserves refs for a single button with :class, @click, and a conditional svg child', () => {
    const compiler = new TemplateCompiler();
    const clickHandler = vi.fn();
    const darkIcon = html`
      <svg data-icon="dark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="4"></circle>
      </svg>
    `;
    const lightIcon = html`
      <svg data-icon="light" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
      </svg>
    `;

    const renderButton = (active: boolean, dark: boolean) => html`
      <button
        id="compound-btn"
        class="tool-btn"
        :class=${{ active }}
        @click=${clickHandler}
      >
        ${dark ? darkIcon : lightIcon}
      </button>
    `;

    const template = renderButton(false, true);
    const compiled = compiler.compile(template);
    const { fragment, refs } = compiled.render(template.values);
    document.body.appendChild(fragment);

    const button = document.getElementById('compound-btn') as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(clickHandler).toHaveBeenCalledTimes(1);

    const updated = renderButton(true, false);
    compiled.update(refs, updated.values);

    expect(button!.classList.contains('active')).toBe(true);

    document.body.innerHTML = '';
  });

  it('preserves button event handlers with conditional inline svg children across updates', () => {
    const compiler = new TemplateCompiler();
    const themeHandler = vi.fn();
    const markersHandler = vi.fn();
    const sidebarHandler = vi.fn();

    const darkIcon = html`
      <svg data-icon="dark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="4"></circle>
      </svg>
    `;
    const lightIcon = html`
      <svg data-icon="light" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
      </svg>
    `;
    const sidebarOpenIcon = html`
      <svg data-icon="sidebar-open" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect width="18" height="18" x="3" y="3" rx="2"></rect>
      </svg>
    `;
    const sidebarClosedIcon = html`
      <svg data-icon="sidebar-closed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M15 3h6v6"></path>
      </svg>
    `;

    const renderToolbar = (theme: 'dark' | 'light', showMarkers: boolean, sidebarOpen: boolean) => html`
      <div class="reader-toolbar">
        <button
          id="theme-btn"
          class="tool-btn"
          title="Toggle Theme"
          @click=${themeHandler}
        >
          ${theme === 'dark' ? darkIcon : lightIcon}
        </button>
        <button
          id="markers-btn"
          class="tool-btn"
          title="Toggle Markers"
          :class=${{ active: showMarkers }}
          @click=${markersHandler}
        >
          <svg data-icon="markers" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2v8"></path>
          </svg>
        </button>
        <button
          id="sidebar-btn"
          class="tool-btn"
          title="Toggle Focus Mode"
          :class=${{ active: !sidebarOpen }}
          @click=${sidebarHandler}
        >
          ${sidebarOpen ? sidebarOpenIcon : sidebarClosedIcon}
        </button>
      </div>
    `;

    const template = renderToolbar('dark', false, true);
    const compiled = compiler.compile(template);
    expect(compiled.html).toContain('data-b2'); // :class on #markers-btn
    expect(compiled.html).toContain('data-b4'); // :class on #sidebar-btn
    const { fragment, refs } = compiled.render(template.values);
    document.body.appendChild(fragment);

    const click = (id: string) => {
      const button = document.getElementById(id) as HTMLButtonElement | null;
      expect(button).not.toBeNull();
      button!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    };

    click('theme-btn');
    click('markers-btn');
    click('sidebar-btn');

    expect(themeHandler).toHaveBeenCalledTimes(1);
    expect(markersHandler).toHaveBeenCalledTimes(1);
    expect(sidebarHandler).toHaveBeenCalledTimes(1);

    const updated = renderToolbar('light', true, false);
    compiled.update(refs, updated.values);

    click('theme-btn');
    click('markers-btn');
    click('sidebar-btn');

    expect(themeHandler).toHaveBeenCalledTimes(2);
    expect(markersHandler).toHaveBeenCalledTimes(2);
    expect(sidebarHandler).toHaveBeenCalledTimes(2);
    expect((document.getElementById('markers-btn') as HTMLButtonElement).classList.contains('active')).toBe(true);
    expect((document.getElementById('sidebar-btn') as HTMLButtonElement).classList.contains('active')).toBe(true);

    document.body.innerHTML = '';
  });
});
