import { MiuraElement, html, css } from '../../packages/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

class GestureDirectiveDemo extends MiuraElement {
    declare gestureCount: number;
    declare lastGesture: string;
    declare gestureData: {
        type: string;
        direction?: string;
        distance?: number;
        velocity?: number;
        duration?: number;
    };

    static properties = {
        gestureCount: { type: Number, default: 0, state: true },
        lastGesture: { type: String, default: 'None', state: true },
        gestureData: {
            type: Object, default: () => ({
                type: '',
                direction: '',
                distance: 0,
                velocity: 0,
                duration: 0
            }), state: true
        }
    };

    static get styles() {
        return css`
            :host {
                display: block;
                font-family: 'Helvetica Neue', Arial, sans-serif;
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
            }

            .gesture-demo {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                padding: 20px;
            }

            .demo-section {
                margin-bottom: 30px;
                padding: 20px;
                border: 1px solid #eee;
                border-radius: 8px;
                background: #fafafa;
            }

            h3 {
                color: #FF6B35;
                margin-top: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .gesture-stats {
                background: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                font-family: monospace;
            }

            .stats-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 4px 0;
                border-bottom: 1px solid #ddd;
            }

            .stats-row:last-child {
                border-bottom: none;
            }

            .gesture-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }

            .gesture-item {
                height: 150px;
                background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 16px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                user-select: none;
                touch-action: none;
            }

            .gesture-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            }

            .gesture-item.active {
                transform: scale(0.95);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .gesture-item.swipe-left {
                animation: swipeLeft 0.3s ease;
            }

            .gesture-item.swipe-right {
                animation: swipeRight 0.3s ease;
            }

            .gesture-item.swipe-up {
                animation: swipeUp 0.3s ease;
            }

            .gesture-item.swipe-down {
                animation: swipeDown 0.3s ease;
            }

            .gesture-item.pinch {
                animation: pinch 0.3s ease;
            }

            .gesture-item.rotate {
                animation: rotate 0.3s ease;
            }

            @keyframes swipeLeft {
                0% { transform: translateX(0); }
                50% { transform: translateX(-20px); }
                100% { transform: translateX(0); }
            }

            @keyframes swipeRight {
                0% { transform: translateX(0); }
                50% { transform: translateX(20px); }
                100% { transform: translateX(0); }
            }

            @keyframes swipeUp {
                0% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
                100% { transform: translateY(0); }
            }

            @keyframes swipeDown {
                0% { transform: translateY(0); }
                50% { transform: translateY(20px); }
                100% { transform: translateY(0); }
            }

            @keyframes pinch {
                0% { transform: scale(1); }
                50% { transform: scale(0.8); }
                100% { transform: scale(1); }
            }

            @keyframes rotate {
                0% { transform: rotate(0deg); }
                50% { transform: rotate(180deg); }
                100% { transform: rotate(360deg); }
            }

            .controls {
                display: flex;
                gap: 10px;
                margin: 20px 0;
                flex-wrap: wrap;
            }

            button {
                background: #FF6B35;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }

            button:hover {
                background: #e55a2b;
            }

            .gesture-examples {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }

            .example-card {
                background: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                border: 1px solid #eee;
            }

            .example-title {
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
            }

            .example-description {
                color: #666;
                font-size: 14px;
                margin-bottom: 15px;
            }

            .gesture-area {
                width: 100%;
                height: 120px;
                background: linear-gradient(45deg, #FF6B35, #F7931E);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                margin: 10px 0;
                user-select: none;
                touch-action: none;
                position: relative;
                overflow: hidden;
            }

            .gesture-feedback {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.9);
                color: #333;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .gesture-feedback.show {
                opacity: 1;
            }

            .code-example {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                padding: 15px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                overflow-x: auto;
                margin: 10px 0;
            }

            .gesture-history {
                max-height: 200px;
                overflow-y: auto;
                background: #f9f9f9;
                padding: 10px;
                border-radius: 4px;
                font-size: 12px;
            }

            .history-item {
                padding: 5px 8px;
                margin: 3px 0;
                background: white;
                border-radius: 3px;
                border-left: 3px solid #FF6B35;
                font-family: monospace;
            }

            .icon {
                font-size: 16px;
            }

            .gesture-indicator {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                color: white;
                background: #FF6B35;
                margin: 2px;
            }

            .direction-indicator {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: bold;
                color: white;
                background: #666;
                margin: 1px;
            }
        `;
    }

    handleGesture = (gestureType: string) => (event: CustomEvent) => {
        this.gestureCount++;
        this.lastGesture = gestureType;

        const detail = event.detail;
        this.gestureData = {
            type: gestureType,
            direction: detail.direction,
            distance: detail.distance,
            velocity: detail.velocity,
            duration: detail.duration
        };

        console.log(`${gestureType} gesture detected:`, detail);

        // Add visual feedback
        const target = event.target as HTMLElement;
        target.classList.add(gestureType.toLowerCase().replace(' ', '-'));
        setTimeout(() => target.classList.remove(gestureType.toLowerCase().replace(' ', '-')), 300);
    };

    showFeedback = (message: string, element: HTMLElement) => {
        const feedback = element.querySelector('.gesture-feedback') as HTMLElement;
        if (feedback) {
            feedback.textContent = message;
            feedback.classList.add('show');
            setTimeout(() => feedback.classList.remove('show'), 1000);
        }
    };

    resetStats = () => {
        this.gestureCount = 0;
        this.lastGesture = 'None';
        this.gestureData = {
            type: '',
            direction: '',
            distance: 0,
            velocity: 0,
            duration: 0
        };
    };

    protected override template() {
        return html`
            <div class="gesture-demo">
                <h2>👆 Gesture Directive Demo</h2>
                <p>Touch and mouse gesture recognition for interactive interfaces.</p>

                <!-- Gesture Statistics -->
                <div class="gesture-stats">
                    <div class="stats-row">
                        <span>Total Gestures:</span>
                        <span>${this.gestureCount}</span>
                    </div>
                    <div class="stats-row">
                        <span>Last Gesture:</span>
                        <span class="gesture-indicator">${this.lastGesture}</span>
                    </div>
                    <div class="stats-row">
                        <span>Direction:</span>
                        <span class="direction-indicator">${this.gestureData.direction || 'N/A'}</span>
                    </div>
                    <div class="stats-row">
                        <span>Distance:</span>
                        <span>${this.gestureData.distance ? Math.round(this.gestureData.distance) + 'px' : 'N/A'}</span>
                    </div>
                    <div class="stats-row">
                        <span>Velocity:</span>
                        <span>${this.gestureData.velocity ? Math.round(this.gestureData.velocity) + 'px/s' : 'N/A'}</span>
                    </div>
                    <div class="stats-row">
                        <span>Duration:</span>
                        <span>${this.gestureData.duration ? Math.round(this.gestureData.duration) + 'ms' : 'N/A'}</span>
                    </div>
                </div>

                <button @click="${this.resetStats}">Reset Statistics</button>

                <!-- Basic Gestures -->
                <div class="demo-section">
                    <h3>🎯 Basic Gestures</h3>
                    <p>Try these gestures on the elements below:</p>
                    
                    <div class="gesture-grid">
                        <div 
                            class="gesture-item"
                            #gesture=${{
                swipe: true,
                threshold: 50,
                onSwipe: this.handleGesture('Swipe')
            }}
                        >
                            Swipe Any Direction
                        </div>
                        
                        <div 
                            class="gesture-item"
                            #gesture=${{
                swipeLeft: true,
                threshold: 50,
                onSwipeLeft: this.handleGesture('Swipe Left')
            }}
                        >
                            Swipe Left
                        </div>
                        
                        <div 
                            class="gesture-item"
                            #gesture=${{
                swipeRight: true,
                threshold: 50,
                onSwipeRight: this.handleGesture('Swipe Right')
            }}
                        >
                            Swipe Right
                        </div>
                        
                        <div 
                            class="gesture-item"
                            #gesture=${{
                swipeUp: true,
                threshold: 50,
                onSwipeUp: this.handleGesture('Swipe Up')
            }}
                        >
                            Swipe Up
                        </div>
                        
                        <div 
                            class="gesture-item"
                            #gesture=${{
                swipeDown: true,
                threshold: 50,
                onSwipeDown: this.handleGesture('Swipe Down')
            }}
                        >
                            Swipe Down
                        </div>
                        
                        <div 
                            class="gesture-item"
                            #gesture=${{
                tap: true,
                onTap: this.handleGesture('Tap')
            }}
                        >
                            Tap
                        </div>
                        
                        <div 
                            class="gesture-item"
                            #gesture=${{
                doubleTap: true,
                onDoubleTap: this.handleGesture('Double Tap')
            }}
                        >
                            Double Tap
                        </div>
                        
                        <div 
                            class="gesture-item"
                            #gesture=${{
                longPress: true,
                duration: 1000,
                onLongPress: this.handleGesture('Long Press')
            }}
                        >
                            Long Press (1s)
                        </div>
                    </div>
                </div>

                <!-- Advanced Gestures -->
                <div class="demo-section">
                    <h3>🚀 Advanced Gestures</h3>
                    
                    <div class="gesture-examples">
                        <div class="example-card">
                            <div class="example-title">Pinch to Zoom</div>
                            <div class="example-description">Pinch in/out to zoom the element</div>
                            <div 
                                class="gesture-area"
                                #gesture=${{
                pinch: true,
                onPinchIn: (event: CustomEvent) => {
                    this.handleGesture('Pinch In')(event);
                    this.showFeedback('Pinch In', event.target as HTMLElement);
                },
                onPinchOut: (event: CustomEvent) => {
                    this.handleGesture('Pinch Out')(event);
                    this.showFeedback('Pinch Out', event.target as HTMLElement);
                }
            }}
                            >
                                Pinch Here
                                <div class="gesture-feedback"></div>
                            </div>
                        </div>
                        
                        <div class="example-card">
                            <div class="example-title">Rotate Gesture</div>
                            <div class="example-description">Rotate with two fingers</div>
                            <div 
                                class="gesture-area"
                                #gesture=${{
                rotate: true,
                onRotate: (event: CustomEvent) => {
                    this.handleGesture('Rotate')(event);
                    this.showFeedback(`Rotate ${Math.round(event.detail.angle)}°`, event.target as HTMLElement);
                }
            }}
                            >
                                Rotate Here
                                <div class="gesture-feedback"></div>
                            </div>
                        </div>
                        
                        <div class="example-card">
                            <div class="example-title">Multi-touch Gestures</div>
                            <div class="example-description">Try different multi-touch combinations</div>
                            <div 
                                class="gesture-area"
                                #gesture=${{
                swipe: true,
                pinch: true,
                rotate: true,
                onSwipe: (event: CustomEvent) => {
                    this.handleGesture('Multi Swipe')(event);
                    this.showFeedback(`Swipe ${event.detail.direction}`, event.target as HTMLElement);
                },
                onPinchIn: (event: CustomEvent) => {
                    this.handleGesture('Multi Pinch In')(event);
                    this.showFeedback('Pinch In', event.target as HTMLElement);
                },
                onPinchOut: (event: CustomEvent) => {
                    this.handleGesture('Multi Pinch Out')(event);
                    this.showFeedback('Pinch Out', event.target as HTMLElement);
                },
                onRotate: (event: CustomEvent) => {
                    this.handleGesture('Multi Rotate')(event);
                    this.showFeedback(`Rotate ${Math.round(event.detail.angle)}°`, event.target as HTMLElement);
                }
            }}
                            >
                                Multi-touch Area
                                <div class="gesture-feedback"></div>
                            </div>
                        </div>
                        
                        <div class="example-card">
                            <div class="example-title">Gesture with Velocity</div>
                            <div class="example-description">Fast swipes trigger different actions</div>
                            <div 
                                class="gesture-area"
                                #gesture=${{
                swipe: true,
                velocityThreshold: 500,
                onSwipe: (event: CustomEvent) => {
                    const isFast = event.detail.velocity > 500;
                    this.handleGesture(isFast ? 'Fast Swipe' : 'Slow Swipe')(event);
                    this.showFeedback(isFast ? 'Fast Swipe!' : 'Slow Swipe', event.target as HTMLElement);
                }
            }}
                            >
                                Swipe Fast or Slow
                                <div class="gesture-feedback"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Code Examples -->
                <div class="demo-section">
                    <h3>💻 Code Examples</h3>
                    
                    <div class="code-example">
// Basic swipe gesture
&lt;div #gesture=\${{
  swipe: true,
  threshold: 50,
  onSwipe: (event) => console.log('Swiped:', event.detail)
}}&gt;
  Swipe me!
&lt;/div&gt;

// Directional swipe
&lt;div #gesture=\${{
  swipeLeft: true,
  swipeRight: true,
  onSwipeLeft: () => console.log('Swiped left'),
  onSwipeRight: () => console.log('Swiped right')
}}&gt;
  Swipe left or right
&lt;/div&gt;

// Pinch gesture
&lt;div #gesture=\${{
  pinch: true,
  onPinchIn: (event) => console.log('Pinched in:', event.detail.scale),
  onPinchOut: (event) => console.log('Pinched out:', event.detail.scale)
}}&gt;
  Pinch to zoom
&lt;/div&gt;

// Multiple gestures
&lt;div #gesture=\${{
  tap: true,
  doubleTap: true,
  longPress: true,
  swipe: true,
  onTap: () => console.log('Tapped'),
  onDoubleTap: () => console.log('Double tapped'),
  onLongPress: () => console.log('Long pressed'),
  onSwipe: (event) => console.log('Swiped:', event.detail.direction)
}}&gt;
  Multi-gesture area
&lt;/div&gt;
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('gesture-directive-demo', GestureDirectiveDemo);

const meta: Meta<GestureDirectiveDemo> = {
    title: 'Miura/Directives/Utility/12. Gestures',
    component: 'gesture-directive-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Gesture Directive (#gesture)

The gesture directive provides comprehensive touch and mouse gesture recognition for creating interactive and intuitive user interfaces.

## Features

- **Multiple Gesture Types**: Swipe, tap, pinch, rotate, and more
- **Directional Support**: Left, right, up, down swipe detection
- **Velocity Detection**: Fast vs slow gesture recognition
- **Multi-touch Support**: Pinch, rotate, and multi-finger gestures
- **Customizable Thresholds**: Adjust sensitivity and timing
- **Event Callbacks**: Detailed gesture event information

## Basic Usage

\`\`\`typescript
<div #gesture=\${{
  swipe: true,
  threshold: 50,
  onSwipe: (event) => console.log('Swiped:', event.detail)
}}>
  Swipe me!
</div>
\`\`\`

## Available Gestures

- **swipe**: General swipe in any direction
- **swipeLeft/swipeRight/swipeUp/swipeDown**: Directional swipes
- **tap**: Single tap/click
- **doubleTap**: Double tap/click
- **longPress**: Long press/hold
- **pinch**: Pinch in/out gestures
- **rotate**: Rotation gestures

## Gesture Options

- **threshold**: Number - Minimum distance for swipe gestures (px)
- **velocityThreshold**: Number - Minimum velocity for fast gestures (px/s)
- **duration**: Number - Duration for long press (ms)
- **tolerance**: Number - Tolerance for gesture recognition (px)

## Event Details

Each gesture event provides:
- **direction**: Swipe direction (left, right, up, down)
- **distance**: Distance traveled (px)
- **velocity**: Gesture velocity (px/s)
- **duration**: Gesture duration (ms)
- **scale**: Scale factor for pinch gestures
- **angle**: Rotation angle for rotate gestures

## Use Cases

- **Mobile Apps**: Touch-friendly navigation and interactions
- **Image Galleries**: Swipe to navigate, pinch to zoom
- **Games**: Touch controls and gesture-based gameplay
- **Web Applications**: Modern touch interfaces
- **Accessibility**: Alternative input methods

## Best Practices

1. Provide visual feedback for gesture recognition
2. Use appropriate thresholds for your use case
3. Consider both touch and mouse interactions
4. Test on actual devices, not just simulators
5. Handle edge cases and gesture conflicts
                `
            }
        }
    }
};

export default meta;
type Story = StoryObj<GestureDirectiveDemo>;

export const Default: Story = {
    args: {}
}; 