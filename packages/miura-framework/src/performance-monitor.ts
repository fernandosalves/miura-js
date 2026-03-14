import { PerformanceMonitor as IPerformanceMonitor, PerformanceMetric } from './types.js';

export class PerformanceMonitor implements IPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers = new Map<string, number>();

  startTimer(name: string): () => void {
    const startTime = performance.now();
    this.timers.set(name, startTime);
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.record({
        name: `${name}-duration`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        metadata: { timer: name }
      });
      
      this.timers.delete(name);
    };
  }

  measure<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.record({
      name: `${name}-measurement`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: { function: name }
    });
    
    return result;
  }

  record(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clear(): void {
    this.metrics = [];
    this.timers.clear();
  }

  // Additional performance utilities

  getAverageMetric(name: string): number {
    const metrics = this.metrics.filter(m => m.name === name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  getSlowestMetrics(limit: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  getMetricsByTimeRange(startTime: number, endTime: number): PerformanceMetric[] {
    return this.metrics.filter(m => 
      m.timestamp >= startTime && m.timestamp <= endTime
    );
  }
} 