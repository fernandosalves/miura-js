export type RenderJob = () => void | Promise<void>;

type ScheduledJob = {
    job: RenderJob;
    resolve: (value: boolean) => void;
    reject: (reason?: unknown) => void;
};

const queue = new Map<object, ScheduledJob>();
let flushScheduled = false;
let flushing = false;

function scheduleFlush(): void {
    if (flushScheduled) return;
    flushScheduled = true;
    queueMicrotask(flushRenderQueue);
}

export function queueRenderTask(key: object, job: RenderJob): Promise<boolean> {
    const existing = queue.get(key);
    if (existing) {
        existing.job = job;
        return new Promise((resolve, reject) => {
            const previousResolve = existing.resolve;
            const previousReject = existing.reject;
            existing.resolve = (value) => {
                previousResolve(value);
                resolve(value);
            };
            existing.reject = (reason) => {
                previousReject(reason);
                reject(reason);
            };
        });
    }

    const promise = new Promise<boolean>((resolve, reject) => {
        queue.set(key, { job, resolve, reject });
    });
    scheduleFlush();
    return promise;
}

export async function flushRenderQueue(): Promise<void> {
    if (flushing) return;
    flushing = true;
    flushScheduled = false;

    try {
        while (queue.size > 0) {
            const batch = Array.from(queue.entries());
            queue.clear();

            for (const [, scheduled] of batch) {
                try {
                    await scheduled.job();
                    scheduled.resolve(true);
                } catch (error) {
                    scheduled.reject(error);
                }
            }
        }
    } finally {
        flushing = false;
        if (queue.size > 0) {
            scheduleFlush();
        }
    }
}

export function getRenderQueueSize(): number {
    return queue.size;
}
