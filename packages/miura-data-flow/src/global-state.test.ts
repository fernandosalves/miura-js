import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GlobalStateManager } from './global-state';

describe('GlobalStateManager', () => {
  let state: GlobalStateManager;

  beforeEach(() => {
    state = GlobalStateManager.getInstance();
    state.unsubscribe('component-a');
    state.set('theme', 'light');
    state.set('language', 'en');
    state.set('notifications', []);
  });

  it('only notifies multi-property subscribers when one of the selected properties changes', () => {
    const callback = vi.fn();

    state.subscribe('component-a', ['theme', 'language'], callback);

    state.set('notifications', [
      { id: '1', message: 'hello', type: 'info' },
    ]);
    expect(callback).not.toHaveBeenCalled();

    state.set('theme', 'dark');
    expect(callback).toHaveBeenCalledTimes(1);

    state.set('language', 'pt');
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('unsubscribe(componentId) removes all active listeners for that component', () => {
    const themeCallback = vi.fn();
    const languageCallback = vi.fn();

    state.subscribeTo('component-a', 'theme', themeCallback);
    state.subscribeTo('component-a', 'language', languageCallback);

    state.unsubscribe('component-a');

    state.set('theme', 'dark');
    state.set('language', 'pt');

    expect(themeCallback).not.toHaveBeenCalled();
    expect(languageCallback).not.toHaveBeenCalled();
  });

  it('manual unsubscribe removes only that specific subscription', () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

    const unsubscribeFirst = state.subscribeTo('component-a', 'theme', firstCallback);
    state.subscribeTo('component-a', 'theme', secondCallback);

    unsubscribeFirst();
    state.set('theme', 'dark');

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });
});
