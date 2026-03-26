import { BaseDirective } from './directive';
import { debugLog } from '../utils/debug';

interface GestureOptions {
    // Boolean flags to enable/disable gestures
    swipe?: boolean | ((direction: 'left' | 'right' | 'up' | 'down') => void);
    swipeLeft?: boolean | (() => void);
    swipeRight?: boolean | (() => void);
    swipeUp?: boolean | (() => void);
    swipeDown?: boolean | (() => void);
    pinch?: boolean | ((scale: number) => void);
    pinchIn?: boolean | ((scale: number) => void);
    pinchOut?: boolean | ((scale: number) => void);
    longPress?: boolean | (() => void);
    doubleTap?: boolean | (() => void);
    tap?: boolean | (() => void);
    drag?: boolean | ((deltaX: number, deltaY: number) => void);
    rotate?: boolean | ((angle: number) => void);
    
    // Configuration options
    threshold?: number;
    longPressDelay?: number;
    velocityThreshold?: number;
    tolerance?: number;
    
    // Callback functions (legacy support)
    onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onPinch?: (scale: number) => void;
    onPinchIn?: (scale: number) => void;
    onPinchOut?: (scale: number) => void;
    onLongPress?: () => void;
    onDoubleTap?: () => void;
    onTap?: () => void;
    onDrag?: (deltaX: number, deltaY: number) => void;
    onRotate?: (angle: number) => void;
}

interface TouchPoint {
    x: number;
    y: number;
    timestamp: number;
}

export class GestureDirective extends BaseDirective {
    private options: GestureOptions = {};
    private startPoint: TouchPoint | null = null;
    private lastPoint: TouchPoint | null = null;
    private longPressTimer: number | null = null;
    private lastTapTime = 0;
    private isDragging = false;
    private listeningElement: HTMLElement | null = null;

    mount(element: Element) {
        debugLog('gesture', 'Mounting gesture directive');
        this.element = element;

        this.options = {
            threshold: 50,
            longPressDelay: 500,
            velocityThreshold: 500,
            tolerance: 10,
            ...this.options
        };

        if (element instanceof HTMLElement) {
            this.listeningElement = element;
            // Touch events
            element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
            element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
            element.addEventListener('touchend', this.handleTouchEnd, { passive: false });

            // Mouse events for desktop
            element.addEventListener('mousedown', this.handleMouseDown);
            element.addEventListener('mousemove', this.handleMouseMove);
            element.addEventListener('mouseup', this.handleMouseUp);
        }
    }

    private isGestureEnabled(gesture: keyof GestureOptions): boolean {
        const option = this.options[gesture];
        return typeof option === 'boolean' ? option : !!option;
    }

    private callGestureCallback(gesture: keyof GestureOptions, ...args: unknown[]): void {
        const option = this.options[gesture];
        const legacyCallback = this.options[`on${gesture.charAt(0).toUpperCase() + gesture.slice(1)}` as keyof GestureOptions];
        
        // Create a custom event with the gesture data
        const eventData = this.createGestureEventData(gesture, args);
        const customEvent = new CustomEvent(`gesture-${gesture}`, {
            detail: eventData,
            bubbles: true,
            cancelable: true
        });
        
        // Set the target manually since CustomEvent doesn't set it automatically
        Object.defineProperty(customEvent, 'target', {
            value: this.element,
            writable: false
        });
        
        // Dispatch the event on the element
        if (this.element) {
            this.element.dispatchEvent(customEvent);
        }
        
        // Also call the callback functions if they exist, matching the public typed API.
        if (typeof option === 'function') {
            (option as (...cbArgs: unknown[]) => void)(...args);
        } else if (typeof legacyCallback === 'function') {
            (legacyCallback as (...cbArgs: unknown[]) => void)(...args);
        }
    }

    private createGestureEventData(gesture: keyof GestureOptions, args: unknown[]): any {
        const baseData = {
            type: gesture,
            timestamp: Date.now(),
            element: this.element
        };

        switch (gesture) {
            case 'swipe':
                return {
                    ...baseData,
                    direction: args[0] as string,
                    distance: this.calculateDistance(),
                    velocity: this.calculateVelocity(),
                    duration: this.calculateDuration()
                };
            case 'swipeLeft':
            case 'swipeRight':
            case 'swipeUp':
            case 'swipeDown':
                return {
                    ...baseData,
                    direction: gesture.replace('swipe', '').toLowerCase(),
                    distance: this.calculateDistance(),
                    velocity: this.calculateVelocity(),
                    duration: this.calculateDuration()
                };
            case 'drag':
                return {
                    ...baseData,
                    deltaX: args[0] as number,
                    deltaY: args[1] as number,
                    distance: this.calculateDistance(),
                    velocity: this.calculateVelocity()
                };
            case 'tap':
            case 'doubleTap':
            case 'longPress':
                return {
                    ...baseData,
                    duration: this.calculateDuration()
                };
            case 'pinch':
            case 'pinchIn':
            case 'pinchOut':
                return {
                    ...baseData,
                    scale: args[0] as number,
                    duration: this.calculateDuration()
                };
            case 'rotate':
                return {
                    ...baseData,
                    angle: args[0] as number,
                    duration: this.calculateDuration()
                };
            default:
                return baseData;
        }
    }

    private calculateDistance(): number {
        if (!this.startPoint || !this.lastPoint) return 0;
        const deltaX = this.lastPoint.x - this.startPoint.x;
        const deltaY = this.lastPoint.y - this.startPoint.y;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    private calculateVelocity(): number {
        if (!this.startPoint || !this.lastPoint) return 0;
        const distance = this.calculateDistance();
        const duration = this.calculateDuration();
        return duration > 0 ? distance / (duration / 1000) : 0;
    }

    private calculateDuration(): number {
        if (!this.startPoint || !this.lastPoint) return 0;
        return this.lastPoint.timestamp - this.startPoint.timestamp;
    }

    private handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.startPoint = {
            x: touch.clientX,
            y: touch.clientY,
            timestamp: Date.now()
        };
        this.lastPoint = { ...this.startPoint };

        // Start long press timer
        if (this.isGestureEnabled('longPress')) {
            this.longPressTimer = window.setTimeout(() => {
                this.callGestureCallback('longPress');
                debugLog('gesture', 'Long press detected');
            }, this.options.longPressDelay);
        }
    };

    private handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        const currentPoint = {
            x: touch.clientX,
            y: touch.clientY,
            timestamp: Date.now()
        };

        // Clear long press timer if moving
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        // Handle drag
        if (this.lastPoint && this.isGestureEnabled('drag')) {
            const deltaX = currentPoint.x - this.lastPoint.x;
            const deltaY = currentPoint.y - this.lastPoint.y;
            this.callGestureCallback('drag', deltaX, deltaY);
            this.isDragging = true;
        }

        this.lastPoint = currentPoint;
    };

    private handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        
        // Clear long press timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        if (this.startPoint && this.lastPoint && !this.isDragging) {
            const deltaX = this.lastPoint.x - this.startPoint.x;
            const deltaY = this.lastPoint.y - this.startPoint.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Check for swipe
            if (distance > this.options.threshold!) {
                const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
                let direction: 'left' | 'right' | 'up' | 'down';

                if (angle > -45 && angle < 45) direction = 'right';
                else if (angle > 45 && angle < 135) direction = 'down';
                else if (angle > 135 || angle < -135) direction = 'left';
                else direction = 'up';

                // Call general swipe callback
                if (this.isGestureEnabled('swipe')) {
                    this.callGestureCallback('swipe', direction);
                }

                // Call directional swipe callbacks
                if (this.isGestureEnabled(`swipe${direction.charAt(0).toUpperCase() + direction.slice(1)}` as keyof GestureOptions)) {
                    this.callGestureCallback(`swipe${direction.charAt(0).toUpperCase() + direction.slice(1)}` as keyof GestureOptions);
                }

                debugLog('gesture', 'Swipe detected:', direction);
            } else {
                // Check for tap/double tap
                const now = Date.now();
                if (now - this.lastTapTime < 300) {
                    if (this.isGestureEnabled('doubleTap')) {
                        this.callGestureCallback('doubleTap');
                    }
                    debugLog('gesture', 'Double tap detected');
                    this.lastTapTime = 0;
                } else {
                    this.lastTapTime = now;
                    if (this.isGestureEnabled('tap')) {
                        this.callGestureCallback('tap');
                    }
                }
            }
        }

        this.isDragging = false;
        this.startPoint = null;
        this.lastPoint = null;
    };

    private handleMouseDown = (e: MouseEvent) => {
        this.startPoint = {
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now()
        };
        this.lastPoint = { ...this.startPoint };

        // Start long press timer
        if (this.isGestureEnabled('longPress')) {
            this.longPressTimer = window.setTimeout(() => {
                this.callGestureCallback('longPress');
                debugLog('gesture', 'Long press detected (mouse)');
            }, this.options.longPressDelay);
        }
    };

    private handleMouseMove = (e: MouseEvent) => {
        // Clear long press timer if moving
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        // Handle drag
        if (this.lastPoint && this.isGestureEnabled('drag')) {
            const deltaX = e.clientX - this.lastPoint.x;
            const deltaY = e.clientY - this.lastPoint.y;
            this.callGestureCallback('drag', deltaX, deltaY);
            this.isDragging = true;
        }

        this.lastPoint = {
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now()
        };
    };

    private handleMouseUp = (e: MouseEvent) => {
        // Clear long press timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        if (this.startPoint && this.lastPoint && !this.isDragging) {
            const deltaX = this.lastPoint.x - this.startPoint.x;
            const deltaY = this.lastPoint.y - this.startPoint.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Check for swipe
            if (distance > this.options.threshold!) {
                const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
                let direction: 'left' | 'right' | 'up' | 'down';

                if (angle > -45 && angle < 45) direction = 'right';
                else if (angle > 45 && angle < 135) direction = 'down';
                else if (angle > 135 || angle < -135) direction = 'left';
                else direction = 'up';

                // Call general swipe callback
                if (this.isGestureEnabled('swipe')) {
                    this.callGestureCallback('swipe', direction);
                }

                // Call directional swipe callbacks
                if (this.isGestureEnabled(`swipe${direction.charAt(0).toUpperCase() + direction.slice(1)}` as keyof GestureOptions)) {
                    this.callGestureCallback(`swipe${direction.charAt(0).toUpperCase() + direction.slice(1)}` as keyof GestureOptions);
                }

                debugLog('gesture', 'Swipe detected (mouse):', direction);
            } else {
                // Check for double click
                const now = Date.now();
                if (now - this.lastTapTime < 300) {
                    if (this.isGestureEnabled('doubleTap')) {
                        this.callGestureCallback('doubleTap');
                    }
                    debugLog('gesture', 'Double click detected');
                    this.lastTapTime = 0;
                } else {
                    this.lastTapTime = now;
                    if (this.isGestureEnabled('tap')) {
                        this.callGestureCallback('tap');
                    }
                }
            }
        }

        this.isDragging = false;
        this.startPoint = null;
        this.lastPoint = null;
    };

    update(options: GestureOptions) {
        this.options = { ...this.options, ...options };
    }

    unmount() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
        }
        if (this.listeningElement) {
            this.listeningElement.removeEventListener('touchstart', this.handleTouchStart);
            this.listeningElement.removeEventListener('touchmove', this.handleTouchMove);
            this.listeningElement.removeEventListener('touchend', this.handleTouchEnd);
            this.listeningElement.removeEventListener('mousedown', this.handleMouseDown);
            this.listeningElement.removeEventListener('mousemove', this.handleMouseMove);
            this.listeningElement.removeEventListener('mouseup', this.handleMouseUp);
            this.listeningElement = null;
        }
    }
}
