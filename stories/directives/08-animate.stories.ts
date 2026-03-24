import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

class AnimateDirectiveDemo extends MiuraElement {
    declare animationCount: number;
    declare isAnimating: boolean;

    static properties = {
        animationCount: { type: Number, default: 0, state: true },
        isAnimating: { type: Boolean, default: false, state: true }
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

            .animate-demo {
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
                color: #FF5722;
                margin-top: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .animation-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }

            .animation-item {
                height: 120px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
                text-align: center;
                cursor: pointer;
                transition: transform 0.2s ease;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .animation-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            }

            .controls {
                display: flex;
                gap: 10px;
                margin: 20px 0;
                flex-wrap: wrap;
            }

            button {
                background: #FF5722;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }

            button:hover {
                background: #e64a19;
            }

            button:disabled {
                background: #ccc;
                cursor: not-allowed;
            }

            .stats {
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

            .animation-examples {
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

            .animated-element {
                width: 100%;
                height: 80px;
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                margin: 10px 0;
            }

            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }

            .notification.show {
                transform: translateX(0);
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: #f0f0f0;
                border-radius: 4px;
                overflow: hidden;
                margin: 10px 0;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                border-radius: 4px;
                transition: width 0.3s ease;
            }

            .floating-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: #FF5722;
                color: white;
                border: none;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                z-index: 1000;
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

            .icon {
                font-size: 20px;
            }
        `;
    }

    triggerAnimation = (animationType: string) => {
        this.animationCount++;
        this.isAnimating = true;
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = `🎬 ${animationType} animation triggered!`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
        
        setTimeout(() => this.isAnimating = false, 1000);
    };

    resetStats = () => {
        this.animationCount = 0;
        this.isAnimating = false;
    };

    protected override template() {
        return html`
            <div class="animate-demo">
                <h2>🎬 Animation Directive Demo</h2>
                <p>Create smooth, performant animations with CSS transitions and keyframes.</p>

                <!-- Statistics -->
                <div class="stats">
                    <div class="stats-row">
                        <span>Total Animations:</span>
                        <span>${this.animationCount}</span>
                    </div>
                    <div class="stats-row">
                        <span>Currently Animating:</span>
                        <span>${this.isAnimating ? 'Yes' : 'No'}</span>
                    </div>
                    <div class="stats-row">
                        <span>Animation Rate:</span>
                        <span>${this.animationCount > 0 ? 'Active' : 'Idle'}</span>
                    </div>
                </div>

                <button @click="${this.resetStats}">Reset Statistics</button>

                <!-- Basic Animations -->
                <div class="demo-section">
                    <h3>🎯 Basic Animations</h3>
                    <p>Click on any element to trigger its animation.</p>
                    
                    <div class="animation-grid">
                        <div 
                            class="animation-item"
                            #animate=${{
                                trigger: 'click',
                                animation: 'bounce',
                                duration: '0.6s',
                                onStart: () => this.triggerAnimation('Bounce')
                            }}
                        >
                            Bounce
                        </div>
                        
                        <div 
                            class="animation-item"
                            #animate=${{
                                trigger: 'click',
                                animation: 'fadeIn',
                                duration: '0.8s',
                                onStart: () => this.triggerAnimation('Fade In')
                            }}
                        >
                            Fade In
                        </div>
                        
                        <div 
                            class="animation-item"
                            #animate=${{
                                trigger: 'click',
                                animation: 'slideInLeft',
                                duration: '0.7s',
                                onStart: () => this.triggerAnimation('Slide Left')
                            }}
                        >
                            Slide Left
                        </div>
                        
                        <div 
                            class="animation-item"
                            #animate=${{
                                trigger: 'click',
                                animation: 'rotate',
                                duration: '1s',
                                onStart: () => this.triggerAnimation('Rotate')
                            }}
                        >
                            Rotate
                        </div>
                        
                        <div 
                            class="animation-item"
                            #animate=${{
                                trigger: 'click',
                                animation: 'scale',
                                duration: '0.5s',
                                onStart: () => this.triggerAnimation('Scale')
                            }}
                        >
                            Scale
                        </div>
                        
                        <div 
                            class="animation-item"
                            #animate=${{
                                trigger: 'click',
                                animation: 'shake',
                                duration: '0.6s',
                                onStart: () => this.triggerAnimation('Shake')
                            }}
                        >
                            Shake
                        </div>
                    </div>
                </div>

                <!-- Advanced Examples -->
                <div class="demo-section">
                    <h3>🚀 Advanced Animation Examples</h3>
                    
                    <div class="animation-examples">
                        <div class="example-card">
                            <div class="example-title">Progress Bar Animation</div>
                            <div class="example-description">Animated progress bar with smooth transitions</div>
                            <div class="progress-bar">
                                <div 
                                    class="progress-fill"
                                    #animate=${{
                                        trigger: 'visible',
                                        animation: 'progress',
                                        duration: '2s',
                                        delay: '0.5s',
                                        onStart: () => this.triggerAnimation('Progress Bar')
                                    }}
                                    style="width: 0%"
                                ></div>
                            </div>
                        </div>
                        
                        <div class="example-card">
                            <div class="example-title">Hover Effects</div>
                            <div class="example-description">Interactive hover animations</div>
                            <div 
                                class="animated-element"
                                #animate=${{
                                    trigger: 'hover',
                                    animation: 'pulse',
                                    duration: '0.3s',
                                    onStart: () => this.triggerAnimation('Hover Pulse')
                                }}
                            >
                                Hover Me!
                            </div>
                        </div>
                        
                        <div class="example-card">
                            <div class="example-title">Scroll Triggered</div>
                            <div class="example-description">Animations that trigger on scroll</div>
                            <div 
                                class="animated-element"
                                #animate=${{
                                    trigger: 'visible',
                                    animation: 'slideInUp',
                                    duration: '1s',
                                    threshold: 0.5,
                                    onStart: () => this.triggerAnimation('Scroll Animation')
                                }}
                            >
                                Scroll to Animate
                            </div>
                        </div>
                        
                        <div class="example-card">
                            <div class="example-title">Staggered Animation</div>
                            <div class="example-description">Multiple elements with staggered timing</div>
                            <div style="display: flex; gap: 10px;">
                                <div 
                                    style="width: 30px; height: 30px; background: #ff6b6b; border-radius: 50%;"
                                    #animate=${{
                                        trigger: 'visible',
                                        animation: 'bounce',
                                        duration: '0.6s',
                                        delay: '0s',
                                        onStart: () => this.triggerAnimation('Stagger 1')
                                    }}
                                ></div>
                                <div 
                                    style="width: 30px; height: 30px; background: #4ecdc4; border-radius: 50%;"
                                    #animate=${{
                                        trigger: 'visible',
                                        animation: 'bounce',
                                        duration: '0.6s',
                                        delay: '0.1s',
                                        onStart: () => this.triggerAnimation('Stagger 2')
                                    }}
                                ></div>
                                <div 
                                    style="width: 30px; height: 30px; background: #45b7d1; border-radius: 50%;"
                                    #animate=${{
                                        trigger: 'visible',
                                        animation: 'bounce',
                                        duration: '0.6s',
                                        delay: '0.2s',
                                        onStart: () => this.triggerAnimation('Stagger 3')
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Code Examples -->
                <div class="demo-section">
                    <h3>💻 Code Examples</h3>
                    
                    <div class="code-example">
// Basic click animation
&lt;div #animate=\${{
  trigger: 'click',
  animation: 'bounce',
  duration: '0.6s',
  onStart: () => console.log('Animation started')
}}&gt;
  Click me!
&lt;/div&gt;

// Scroll-triggered animation
&lt;div #animate=\${{
  trigger: 'visible',
  animation: 'fadeIn',
  duration: '0.8s',
  threshold: 0.5
}}&gt;
  Animate on scroll
&lt;/div&gt;

// Hover animation
&lt;div #animate=\${{
  trigger: 'hover',
  animation: 'scale',
  duration: '0.3s'
}}&gt;
  Hover me!
&lt;/div&gt;
                    </div>
                </div>

                <!-- Floating Action Button -->
                <button 
                    class="floating-button"
                    #animate=${{
                        trigger: 'visible',
                        animation: 'slideInUp',
                        duration: '0.8s',
                        delay: '1s',
                        onStart: () => this.triggerAnimation('Floating Button')
                    }}
                >
                    ⭐
                </button>
            </div>
        `;
    }
}

customElements.define('animate-directive-demo', AnimateDirectiveDemo);

const meta: Meta<AnimateDirectiveDemo> = {
    title: 'Miura/Directives/Utility/09. Animation',
    component: 'animate-directive-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Animation Directive (#animate)

The animation directive provides a powerful and flexible way to add smooth animations to your components using CSS transitions and keyframes.

## Features

- **Multiple Triggers**: Click, hover, visible, and custom triggers
- **Pre-built Animations**: Bounce, fade, slide, rotate, scale, shake, and more
- **Custom Timing**: Configurable duration, delay, and easing
- **Event Callbacks**: onStart, onEnd, and onCancel events
- **Performance Optimized**: Uses CSS transforms and opacity for smooth animations

## Basic Usage

\`\`\`typescript
<div #animate=\${{
  trigger: 'click',
  animation: 'bounce',
  duration: '0.6s',
  onStart: () => console.log('Animation started')
}}>
  Click me!
</div>
\`\`\`

## Available Animations

- **bounce**: Bouncing effect
- **fadeIn/fadeOut**: Fade in/out transitions
- **slideInLeft/slideInRight/slideInUp/slideInDown**: Slide animations
- **rotate**: Rotation animation
- **scale**: Scaling effect
- **shake**: Shaking effect
- **pulse**: Pulsing effect
- **progress**: Progress bar animation

## Triggers

- **click**: Triggers on click
- **hover**: Triggers on hover
- **visible**: Triggers when element becomes visible
- **custom**: Custom trigger function

## Options

- \`trigger\`: String - When to trigger the animation
- \`animation\`: String - Animation type to apply
- \`duration\`: String - Animation duration (e.g., '0.6s')
- \`delay\`: String - Delay before animation starts
- \`easing\`: String - CSS easing function
- \`threshold\`: Number - Visibility threshold for 'visible' trigger
- \`onStart\`: Function - Called when animation starts
- \`onEnd\`: Function - Called when animation ends
- \`onCancel\`: Function - Called when animation is cancelled

## Use Cases

- **Interactive Elements**: Buttons, cards, and interactive components
- **Page Transitions**: Smooth page loading and navigation
- **Loading States**: Animated loading indicators
- **Micro-interactions**: Small animations for better UX
- **Scroll Animations**: Animate content as it comes into view

## Best Practices

1. Keep animations short and purposeful (0.2s - 0.8s)
2. Use appropriate easing functions for natural motion
3. Consider reduced motion preferences
4. Test animations on different devices and browsers
5. Use transform and opacity for best performance
                `
            }
        }
    }
};

export default meta;
type Story = StoryObj<AnimateDirectiveDemo>;

export const Default: Story = {
    args: {}
}; 