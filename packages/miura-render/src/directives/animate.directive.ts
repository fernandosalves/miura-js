import { BaseDirective } from './directive';
import { debugLog } from '../utils/debug';

interface AnimationOptions {
    // Animation configuration
    trigger?: 'click' | 'hover' | 'visible' | 'custom';
    animation?: string;
    duration?: string | number;
    delay?: string | number;
    easing?: string;
    threshold?: number;
    
    // Event callbacks
    onStart?: () => void;
    onEnd?: () => void;
    onCancel?: () => void;
    
    // Legacy support
    enter?: string;
    exit?: string;
    onEnter?: () => void;
    onExit?: () => void;
    onComplete?: () => void;
}

export class AnimateDirective extends BaseDirective {
    private options: AnimationOptions = {};
    private isAnimating = false;
    private animationId: number | null = null;
    private intersectionObserver: IntersectionObserver | null = null;
    private eventListeners: Array<{ element: Element; event: string; handler: EventListener }> = [];

    mount(element: Element) {
        debugLog('animate', 'Mounting animate directive');

        this.options = {
            trigger: 'click',
            duration: '0.3s',
            easing: 'ease-out',
            threshold: 0.1,
            ...this.options
        };

        this.setupTriggers(element);
        this.addAnimationStyles();
    }

    private setupTriggers(element: Element) {
        if (element instanceof HTMLElement) {
            switch (this.options.trigger) {
                case 'click':
                    this.addEventListener(element, 'click', this.handleClick.bind(this));
                    break;
                case 'hover':
                    this.addEventListener(element, 'mouseenter', this.handleHover.bind(this));
                    break;
                case 'visible':
                    this.setupIntersectionObserver(element);
                    break;
                case 'custom':
                    // Custom trigger - no automatic setup
                    break;
            }
        }
    }

    private addEventListener(element: Element, event: string, handler: EventListener) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    private setupIntersectionObserver(element: Element) {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.playAnimation(element);
                        }
                    });
                },
                {
                    threshold: this.options.threshold,
                    rootMargin: '50px'
                }
            );
            this.intersectionObserver.observe(element);
        }
    }

    private handleClick = (event: Event) => {
        event.preventDefault();
        this.playAnimation(event.target as Element);
    };

    private handleHover = (event: Event) => {
        this.playAnimation(event.target as Element);
    };

    private playAnimation(element: Element) {
        if (this.isAnimating || !element) return;

        debugLog('animate', 'Playing animation:', this.options.animation);
        
        this.isAnimating = true;
        this.options.onStart?.();

        if (element instanceof HTMLElement) {
            const animationType = this.options.animation || 'fadeIn';
            const duration = this.getDuration();
            const delay = this.getDelay();

            // Apply animation
            this.applyAnimation(element, animationType, duration, delay);

            // Set up completion callback
            const handleAnimationEnd = () => {
                element.removeEventListener('animationend', handleAnimationEnd);
                element.removeEventListener('transitionend', handleAnimationEnd);
                this.isAnimating = false;
                this.options.onEnd?.();
                debugLog('animate', 'Animation completed');
            };

            element.addEventListener('animationend', handleAnimationEnd);
            element.addEventListener('transitionend', handleAnimationEnd);
        }
    }

    private applyAnimation(element: HTMLElement, animationType: string, duration: string, delay: string) {
        // Clear any existing animations and transitions to prevent conflicts
        element.style.animation = '';
        element.style.transition = '';
        element.style.transform = '';
        element.style.opacity = '';

        // Force a reflow to ensure styles are cleared
        element.offsetHeight;

        switch (animationType) {
            case 'bounce':
                element.style.animation = `bounce ${duration} ${delay} ease-in-out`;
                break;
            case 'fadeIn':
                element.style.opacity = '0';
                element.style.animation = `fadeIn ${duration} ${delay} ease-out`;
                break;
            case 'fadeOut':
                element.style.animation = `fadeOut ${duration} ${delay} ease-in`;
                break;
            case 'slideInLeft':
                element.style.transform = 'translate3d(-100%, 0, 0)';
                element.style.opacity = '0';
                element.style.animation = `slideInLeft ${duration} ${delay} ease-out`;
                break;
            case 'slideInRight':
                element.style.transform = 'translate3d(100%, 0, 0)';
                element.style.opacity = '0';
                element.style.animation = `slideInRight ${duration} ${delay} ease-out`;
                break;
            case 'slideInUp':
                element.style.transform = 'translate3d(0, 100%, 0)';
                element.style.opacity = '0';
                element.style.animation = `slideInUp ${duration} ${delay} ease-out`;
                break;
            case 'slideInDown':
                element.style.transform = 'translate3d(0, -100%, 0)';
                element.style.opacity = '0';
                element.style.animation = `slideInDown ${duration} ${delay} ease-out`;
                break;
            case 'rotate':
                element.style.animation = `rotate ${duration} ${delay} ease-in-out`;
                break;
            case 'scale':
                element.style.animation = `scale ${duration} ${delay} ease-out`;
                break;
            case 'shake':
                element.style.animation = `shake ${duration} ${delay} ease-in-out`;
                break;
            case 'pulse':
                element.style.animation = `pulse ${duration} ${delay} ease-in-out`;
                break;
            case 'progress':
                element.style.transition = `width ${duration} ${delay} ease-out`;
                element.style.width = '100%';
                break;
            default:
                // Custom animation or fallback
                if (this.options.enter) {
                    element.style.animation = `${this.options.enter} ${duration} ${delay}`;
                } else {
                    // Default fade in
                    element.style.opacity = '0';
                    element.style.animation = `fadeIn ${duration} ${delay} ease-out`;
                }
        }
    }

    private getDuration(): string {
        const duration = this.options.duration;
        if (typeof duration === 'number') {
            return `${duration}ms`;
        }
        return duration as string;
    }

    private getDelay(): string {
        const delay = this.options.delay;
        if (typeof delay === 'number') {
            return `${delay}ms`;
        }
        return delay ? `${delay}` : '0s';
    }

    private addAnimationStyles() {
        // Add CSS keyframes if they don't exist
        if (!document.getElementById('miura-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'miura-animation-styles';
            style.textContent = `
                @keyframes bounce {
                    0%, 20%, 53%, 80%, 100% { 
                        transform: translate3d(0,0,0); 
                    }
                    40%, 43% { 
                        transform: translate3d(0,-30px,0); 
                    }
                    70% { 
                        transform: translate3d(0,-15px,0); 
                    }
                    90% { 
                        transform: translate3d(0,-4px,0); 
                    }
                }
                
                @keyframes fadeIn {
                    from { 
                        opacity: 0; 
                        transform: scale(0.9);
                    }
                    to { 
                        opacity: 1; 
                        transform: scale(1);
                    }
                }
                
                @keyframes fadeOut {
                    from { 
                        opacity: 1; 
                        transform: scale(1);
                    }
                    to { 
                        opacity: 0; 
                        transform: scale(0.9);
                    }
                }
                
                @keyframes slideInLeft {
                    from { 
                        transform: translate3d(-100%, 0, 0); 
                        opacity: 0; 
                    }
                    to { 
                        transform: translate3d(0, 0, 0); 
                        opacity: 1; 
                    }
                }
                
                @keyframes slideInRight {
                    from { 
                        transform: translate3d(100%, 0, 0); 
                        opacity: 0; 
                    }
                    to { 
                        transform: translate3d(0, 0, 0); 
                        opacity: 1; 
                    }
                }
                
                @keyframes slideInUp {
                    from { 
                        transform: translate3d(0, 100%, 0); 
                        opacity: 0; 
                    }
                    to { 
                        transform: translate3d(0, 0, 0); 
                        opacity: 1; 
                    }
                }
                
                @keyframes slideInDown {
                    from { 
                        transform: translate3d(0, -100%, 0); 
                        opacity: 0; 
                    }
                    to { 
                        transform: translate3d(0, 0, 0); 
                        opacity: 1; 
                    }
                }
                
                @keyframes rotate {
                    from { 
                        transform: rotate(0deg); 
                    }
                    to { 
                        transform: rotate(360deg); 
                    }
                }
                
                @keyframes scale {
                    0% { 
                        transform: scale(1); 
                    }
                    50% { 
                        transform: scale(1.2); 
                    }
                    100% { 
                        transform: scale(1); 
                    }
                }
                
                @keyframes shake {
                    0%, 100% { 
                        transform: translateX(0); 
                    }
                    10%, 30%, 50%, 70%, 90% { 
                        transform: translateX(-10px); 
                    }
                    20%, 40%, 60%, 80% { 
                        transform: translateX(10px); 
                    }
                }
                
                @keyframes pulse {
                    0% { 
                        transform: scale(1); 
                    }
                    50% { 
                        transform: scale(1.1); 
                    }
                    100% { 
                        transform: scale(1); 
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    update(options: AnimationOptions) {
        this.options = { ...this.options, ...options };
        
        // Re-setup triggers if trigger changed
        if (this.element) {
            this.cleanup();
            this.setupTriggers(this.element);
        }
    }

    private cleanup() {
        // Remove event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        // Disconnect intersection observer
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }
    }

    unmount() {
        this.cleanup();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.isAnimating = false;
    }

    // Public methods for programmatic control
    play() {
        if (this.element) {
            this.playAnimation(this.element);
        }
    }

    stop() {
        if (this.element && this.isAnimating) {
            this.isAnimating = false;
            this.options.onCancel?.();
            
            if (this.element instanceof HTMLElement) {
                this.element.style.animation = '';
                this.element.style.transition = '';
            }
        }
    }
} 