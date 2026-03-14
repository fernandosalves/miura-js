/**
 * Performance monitoring utilities for miura Render
 */

export interface RenderPerformanceMetrics {
  processor: {
    parseTime: number;
    createTime: number;
    updateTime: number;
    cacheHits: number;
    cacheMisses: number;
  };
  bindingManager: {
    createTime: number;
    initTime: number;
    bindingCount: number;
  };
  parser: {
    parseTime: number;
    parseCount: number;
    cacheHits: number;
    cacheMisses: number;
  };
  html: {
    callCount: number;
    totalTime: number;
  };
  css: {
    callCount: number;
    totalTime: number;
    cacheHits: number;
    cacheMisses: number;
  };
}

/**
 * Global performance monitoring
 */
class PerformanceMonitor {
  private enabled = false;
  private metrics: RenderPerformanceMetrics = {
    processor: { parseTime: 0, createTime: 0, updateTime: 0, cacheHits: 0, cacheMisses: 0 },
    bindingManager: { createTime: 0, initTime: 0, bindingCount: 0 },
    parser: { parseTime: 0, parseCount: 0, cacheHits: 0, cacheMisses: 0 },
    html: { callCount: 0, totalTime: 0 },
    css: { callCount: 0, totalTime: 0, cacheHits: 0, cacheMisses: 0 }
  };

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  isEnabled() {
    return this.enabled;
  }

  updateMetrics(component: keyof RenderPerformanceMetrics, newMetrics: Partial<RenderPerformanceMetrics[keyof RenderPerformanceMetrics]>) {
    if (!this.enabled) return;
    
    Object.assign(this.metrics[component], newMetrics);
  }

  getMetrics(): RenderPerformanceMetrics {
    return { ...this.metrics };
  }

  resetMetrics() {
    this.metrics = {
      processor: { parseTime: 0, createTime: 0, updateTime: 0, cacheHits: 0, cacheMisses: 0 },
      bindingManager: { createTime: 0, initTime: 0, bindingCount: 0 },
      parser: { parseTime: 0, parseCount: 0, cacheHits: 0, cacheMisses: 0 },
      html: { callCount: 0, totalTime: 0 },
      css: { callCount: 0, totalTime: 0, cacheHits: 0, cacheMisses: 0 }
    };
  }

  logMetrics() {
    if (!this.enabled) return;
    
    console.group('miura Render Performance Metrics');
    console.table(this.metrics);
    console.groupEnd();
  }
}

export const performanceMonitor = new PerformanceMonitor(); 