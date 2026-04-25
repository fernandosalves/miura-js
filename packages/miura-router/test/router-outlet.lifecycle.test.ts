// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import '../src/router-outlet.js';
import type { RouteRenderContext } from '../src/types.js';
import { RouterOutlet } from '../src/router-outlet.js';

const events: string[] = [];

class OutletLifecyclePage extends HTMLElement {
    routeContext?: RouteRenderContext;

    onRouteEnter(context: RouteRenderContext) {
        events.push(`enter:${context.fullPath}`);
    }

    onRouteUpdate(context: RouteRenderContext) {
        events.push(`update:${context.fullPath}`);
    }

    onRouteLeave(context: RouteRenderContext) {
        events.push(`leave:${context.fullPath}`);
    }
}

class OutletLifecycleOther extends HTMLElement {
    onRouteEnter(context: RouteRenderContext) {
        events.push(`other-enter:${context.fullPath}`);
    }
}

if (!customElements.get('outlet-lifecycle-page')) {
    customElements.define('outlet-lifecycle-page', OutletLifecyclePage);
}

if (!customElements.get('outlet-lifecycle-other')) {
    customElements.define('outlet-lifecycle-other', OutletLifecycleOther);
}

function context(component: string, fullPath: string): RouteRenderContext {
    return {
        route: { path: fullPath.split('?')[0], component },
        matched: [{ path: fullPath.split('?')[0], component }],
        pathname: fullPath.split('?')[0],
        fullPath,
        params: {},
        query: new URLSearchParams(fullPath.split('?')[1] ?? ''),
        hash: '',
        data: {},
        loaders: { status: 'idle', data: {}, entries: {} },
        timestamp: Date.now(),
        previous: null,
    };
}

describe('RouterOutlet route lifecycle hooks', () => {
    it('calls enter, update, and leave when route components are reused or replaced', () => {
        events.length = 0;
        document.body.innerHTML = '';

        const outlet = document.createElement('miura-router-outlet') as RouterOutlet;
        document.body.appendChild(outlet);

        const first = context('outlet-lifecycle-page', '/users/1');
        const firstElement = outlet.renderRoute(first.route, first);

        expect(firstElement).toBeInstanceOf(OutletLifecyclePage);
        expect((firstElement as OutletLifecyclePage).routeContext).toBe(first);
        expect(events).toEqual(['enter:/users/1']);

        const second = context('outlet-lifecycle-page', '/users/2');
        const reusedElement = outlet.renderRoute(second.route, second);

        expect(reusedElement).toBe(firstElement);
        expect((reusedElement as OutletLifecyclePage).routeContext).toBe(second);
        expect(events).toEqual(['enter:/users/1', 'update:/users/2']);

        const third = context('outlet-lifecycle-other', '/settings');
        const replacement = outlet.renderRoute(third.route, third);

        expect(replacement).toBeInstanceOf(OutletLifecycleOther);
        expect(events).toEqual([
            'enter:/users/1',
            'update:/users/2',
            'leave:/users/2',
            'other-enter:/settings',
        ]);
    });

    it('calls leave when cleared', () => {
        events.length = 0;
        document.body.innerHTML = '';

        const outlet = document.createElement('miura-router-outlet') as RouterOutlet;
        document.body.appendChild(outlet);

        const first = context('outlet-lifecycle-page', '/users/1');
        outlet.renderRoute(first.route, first);
        outlet.clear();

        expect(events).toEqual(['enter:/users/1', 'leave:/users/1']);
        expect(outlet.childElementCount).toBe(0);
    });

    it('calls leave when disconnected while a route component is active', () => {
        events.length = 0;
        document.body.innerHTML = '';

        const outlet = document.createElement('miura-router-outlet') as RouterOutlet;
        document.body.appendChild(outlet);

        const first = context('outlet-lifecycle-page', '/users/1');
        outlet.renderRoute(first.route, first);
        outlet.remove();

        expect(events).toEqual(['enter:/users/1', 'leave:/users/1']);
    });
});
