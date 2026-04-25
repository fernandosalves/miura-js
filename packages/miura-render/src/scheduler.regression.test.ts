import { describe, expect, it } from 'vitest';
import { flushRenderQueue, queueRenderTask } from './scheduler';

describe('scheduler regressions', () => {
    it('does not deadlock if a flush is scheduled while another is running', async () => {
        let job2Run = false;
        
        // 1. Queue job 1
        const p1 = queueRenderTask({ key: 'job1' }, async () => {
            // 2. Inside Job 1 (running within FRQ1), queue Job 2
            // DO NOT await it here, because that would cause a deadlock 
            // in sequential processing.
            void queueRenderTask({ key: 'job2' }, () => {
                job2Run = true;
            });
        });
        
        await p1;
        await flushRenderQueue(); // Ensure everything finishes
        expect(job2Run).toBe(true);
    });

    it('recovers from early returns in FRQ', async () => {
        let job3Run = false;
        
        // Queue something to start a flush
        const p1 = queueRenderTask({ k: 1 }, async () => {
            await new Promise(r => setTimeout(r, 10));
        });
        
        // While p1 is running, queue another task
        // This sets flushScheduled = true in scheduleFlush()
        // FRQ2 will be queued but will return early because FRQ1 is still flushing.
        const p2 = queueRenderTask({ k: 2 }, () => {
             job3Run = true;
        });
        
        await p1;
        await p2;
        expect(job3Run).toBe(true);
    });
});
