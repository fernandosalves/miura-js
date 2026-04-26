import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    startTrace, 
    endTrace, 
    getCurrentTraceId, 
    reportTimelineEvent, 
    getTimelineEvents,
    clearTimelineEvents,
    enableMiuraDebugger
} from './src/miura-debugger';

describe('Miura Trace Engine', () => {
    beforeEach(() => {
        clearTimelineEvents();
        enableMiuraDebugger({ disabled: false, devtools: true });
        // Reset internal trace state if possible, or just ensure we start fresh
        while (getCurrentTraceId()) {
            endTrace();
        }
    });

    it('should start a trace and generate a unique ID', () => {
        const id = startTrace('Test Trace', 'framework');
        expect(id).toBeDefined();
        expect(id).toContain('trace_');
        expect(getCurrentTraceId()).toBe(id);
    });

    it('should automatically attach traceId to timeline events', () => {
        const traceId = startTrace('User Click', 'element');
        
        reportTimelineEvent({
            subsystem: 'signal',
            stage: 'runtime',
            message: 'Signal updated'
        });

        const events = getTimelineEvents();
        const updateEvent = events.find(e => e.message === 'Signal updated');
        
        expect(updateEvent).toBeDefined();
        expect(updateEvent?.traceId).toBe(traceId);
    });

    it('should handle nested traces', () => {
        const parentId = startTrace('Parent', 'framework');
        const childId = startTrace('Child', 'element');
        
        expect(getCurrentTraceId()).toBe(childId);
        
        reportTimelineEvent({
            subsystem: 'signal',
            stage: 'runtime',
            message: 'Child work'
        });
        
        const events = getTimelineEvents();
        const childEvent = events.find(e => e.message === 'Child work');
        expect(childEvent?.traceId).toBe(childId);
        expect(childEvent?.parentTraceId).toBe(parentId);

        endTrace(childId);
        expect(getCurrentTraceId()).toBe(parentId);
        
        reportTimelineEvent({
            subsystem: 'signal',
            stage: 'runtime',
            message: 'Parent work'
        });
        
        const parentEvent = getTimelineEvents().find(e => e.message === 'Parent work');
        expect(parentEvent?.traceId).toBe(parentId);
        expect(parentEvent?.parentTraceId).toBeUndefined();
    });

    it('should pop the stack correctly with endTrace()', () => {
        const id1 = startTrace('T1', 'framework');
        const id2 = startTrace('T2', 'framework');
        
        endTrace(); // Ends T2
        expect(getCurrentTraceId()).toBe(id1);
        
        endTrace(); // Ends T1
        expect(getCurrentTraceId()).toBeNull();
    });
});
