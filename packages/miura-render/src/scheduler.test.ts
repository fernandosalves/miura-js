import { describe, expect, it, vi } from 'vitest';
import { flushRenderQueue, getRenderQueueSize, queueRenderTask } from './scheduler';

describe('render scheduler', () => {
    it('coalesces multiple jobs for the same key into one flush', async () => {
        const key = {};
        const first = vi.fn();
        const second = vi.fn();

        const firstDone = queueRenderTask(key, first);
        const secondDone = queueRenderTask(key, second);

        await secondDone;
        await firstDone;

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
        expect(getRenderQueueSize()).toBe(0);
    });

    it('flushes work queued by another render job before settling', async () => {
        const order: string[] = [];
        const childKey = {};

        await queueRenderTask({}, () => {
            order.push('parent');
            queueRenderTask(childKey, () => {
                order.push('child');
            });
        });
        await flushRenderQueue();

        expect(order).toEqual(['parent', 'child']);
    });
});
