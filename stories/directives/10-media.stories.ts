import { MiuraElement, html, css } from '@miurajsjs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

class MediaDirectiveDemo extends MiuraElement {
    declare currentBreakpoint: string;
    declare mediaQueries: Record<string, boolean>;
    declare deviceInfo: {
        width: number;
        height: number;
        orientation: string;
        pixelRatio: number;
    };

    static properties = {
        currentBreakpoint: { type: String, default: 'unknown', state: true },
        mediaQueries: { type: Object, default: () => ({}), state: true },
        deviceInfo: { type: Object, default: () => ({
            width: 0,
            height: 0,
            orientation: 'unknown',
            pixelRatio: 1
        }), state: true }
    };

    static get styles() {
        return css`
            :host {
                display: block;
                font-family: 'Helvetica Neue', Arial, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }

            .media-demo {
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
                color: #9C27B0;
                margin-top: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .device-info {
                background: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                font-family: monospace;
            }

            .info-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 4px 0;
                border-bottom: 1px solid #ddd;
            }

            .info-row:last-child {
                border-bottom: none;
            }

            .breakpoint-indicator {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                color: white;
                background: #9C27B0;
            }

            .responsive-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }

            .responsive-card {
                background: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                border: 2px solid #e0e0e0;
                transition: all 0.3s ease;
            }

            .responsive-card.mobile {
                border-color: #FF5722;
                background: #fff3e0;
            }

            .responsive-card.tablet {
                border-color: #FF9800;
                background: #fff8e1;
            }

            .responsive-card.desktop {
                border-color: #4CAF50;
                background: #f1f8e9;
            }

            .responsive-card.large {
                border-color: #2196F3;
                background: #e3f2fd;
            }

            .card-title {
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
            }

            .card-content {
                color: #666;
                font-size: 14px;
                line-height: 1.5;
            }

            .media-examples {
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

            .responsive-element {
                padding: 15px;
                border-radius: 6px;
                margin: 10px 0;
                text-align: center;
                font-weight: bold;
                color: white;
                transition: all 0.3s ease;
            }

            .responsive-element.mobile {
                background: #FF5722;
            }

            .responsive-element.tablet {
                background: #FF9800;
            }

            .responsive-element.desktop {
                background: #4CAF50;
            }

            .responsive-element.large {
                background: #2196F3;
            }

            .responsive-element.hidden {
                display: none;
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

            .media-status {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin: 15px 0;
            }

            .status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                color: white;
            }

            .status-badge.active {
                background: #4CAF50;
            }

            .status-badge.inactive {
                background: #f44336;
            }

            .orientation-indicator {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                color: white;
                background: #607D8B;
            }

            .controls {
                display: flex;
                gap: 10px;
                margin: 20px 0;
                flex-wrap: wrap;
            }

            button {
                background: #9C27B0;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }

            button:hover {
                background: #7b1fa2;
            }

            .icon {
                font-size: 16px;
            }

            .responsive-layout {
                display: grid;
                gap: 15px;
                margin: 20px 0;
            }

            .layout-item {
                padding: 15px;
                background: white;
                border-radius: 6px;
                border: 1px solid #ddd;
                text-align: center;
                font-weight: bold;
            }

            .layout-item.mobile {
                grid-template-columns: 1fr;
                background: #fff3e0;
                border-color: #FF5722;
            }

            .layout-item.tablet {
                grid-template-columns: repeat(2, 1fr);
                background: #fff8e1;
                border-color: #FF9800;
            }

            .layout-item.desktop {
                grid-template-columns: repeat(3, 1fr);
                background: #f1f8e9;
                border-color: #4CAF50;
            }

            .layout-item.large {
                grid-template-columns: repeat(4, 1fr);
                background: #e3f2fd;
                border-color: #2196F3;
            }
        `;
    }

    updateDeviceInfo = () => {
        this.deviceInfo = {
            width: window.innerWidth,
            height: window.innerHeight,
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
            pixelRatio: window.devicePixelRatio || 1
        };
    };

    handleMediaChange = (query: string) => (matches: boolean) => {
        this.mediaQueries = { ...this.mediaQueries, [query]: matches };
        
        // Update current breakpoint
        if (matches) {
            if (query.includes('max-width: 768px')) this.currentBreakpoint = 'mobile';
            else if (query.includes('max-width: 1024px')) this.currentBreakpoint = 'tablet';
            else if (query.includes('max-width: 1440px')) this.currentBreakpoint = 'desktop';
            else if (query.includes('min-width: 1441px')) this.currentBreakpoint = 'large';
        }
    };

    connectedCallback() {
        super.connectedCallback();
        this.updateDeviceInfo();
        window.addEventListener('resize', this.updateDeviceInfo);
        window.addEventListener('orientationchange', this.updateDeviceInfo);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('resize', this.updateDeviceInfo);
        window.removeEventListener('orientationchange', this.updateDeviceInfo);
    }

    protected override template() {
        return html`
            <div class="media-demo">
                <h2>📱 Media Directive Demo</h2>
                <p>Responsive design with media queries and device detection.</p>

                <!-- Device Information -->
                <div class="device-info">
                    <div class="info-row">
                        <span>Current Breakpoint:</span>
                        <span class="breakpoint-indicator">${this.currentBreakpoint}</span>
                    </div>
                    <div class="info-row">
                        <span>Screen Width:</span>
                        <span>${this.deviceInfo.width}px</span>
                    </div>
                    <div class="info-row">
                        <span>Screen Height:</span>
                        <span>${this.deviceInfo.height}px</span>
                    </div>
                    <div class="info-row">
                        <span>Orientation:</span>
                        <span class="orientation-indicator">${this.deviceInfo.orientation}</span>
                    </div>
                    <div class="info-row">
                        <span>Pixel Ratio:</span>
                        <span>${this.deviceInfo.pixelRatio}x</span>
                    </div>
                </div>

                <!-- Media Query Status -->
                <div class="demo-section">
                    <h3>📊 Media Query Status</h3>
                    <div class="media-status">
                        <span class="status-badge ${this.mediaQueries['(max-width: 768px)'] ? 'active' : 'inactive'}">
                            📱 Mobile (≤768px)
                        </span>
                        <span class="status-badge ${this.mediaQueries['(min-width: 769px) and (max-width: 1024px)'] ? 'active' : 'inactive'}">
                            📱 Tablet (769px-1024px)
                        </span>
                        <span class="status-badge ${this.mediaQueries['(min-width: 1025px) and (max-width: 1440px)'] ? 'active' : 'inactive'}">
                            💻 Desktop (1025px-1440px)
                        </span>
                        <span class="status-badge ${this.mediaQueries['(min-width: 1441px)'] ? 'active' : 'inactive'}">
                            🖥️ Large (≥1441px)
                        </span>
                        <span class="status-badge ${this.mediaQueries['(orientation: landscape)'] ? 'active' : 'inactive'}">
                            🌄 Landscape
                        </span>
                        <span class="status-badge ${this.mediaQueries['(orientation: portrait)'] ? 'active' : 'inactive'}">
                            📱 Portrait
                        </span>
                    </div>
                </div>

                <!-- Responsive Cards -->
                <div class="demo-section">
                    <h3>🎨 Responsive Cards</h3>
                    <p>Cards that adapt their styling based on screen size.</p>
                    
                    <div class="responsive-grid">
                        <div 
                            class="responsive-card"
                            #media=${{
                                queries: {
                                    mobile: '(max-width: 768px)',
                                    tablet: '(min-width: 769px) and (max-width: 1024px)',
                                    desktop: '(min-width: 1025px) and (max-width: 1440px)',
                                    large: '(min-width: 1441px)'
                                },
                                onMatch: (breakpoint: string) => {
                                    console.log(`Card matched: ${breakpoint}`);
                                }
                            }}
                        >
                            <div class="card-title">Adaptive Card 1</div>
                            <div class="card-content">
                                This card adapts its styling based on the current screen size.
                                The border color and background change to indicate the active breakpoint.
                            </div>
                        </div>
                        
                        <div 
                            class="responsive-card"
                            #media=${{
                                queries: {
                                    mobile: '(max-width: 768px)',
                                    tablet: '(min-width: 769px) and (max-width: 1024px)',
                                    desktop: '(min-width: 1025px) and (max-width: 1440px)',
                                    large: '(min-width: 1441px)'
                                }
                            }}
                        >
                            <div class="card-title">Adaptive Card 2</div>
                            <div class="card-content">
                                Another responsive card that changes appearance based on device size.
                                Perfect for creating adaptive layouts.
                            </div>
                        </div>
                        
                        <div 
                            class="responsive-card"
                            #media=${{
                                queries: {
                                    mobile: '(max-width: 768px)',
                                    tablet: '(min-width: 769px) and (max-width: 1024px)',
                                    desktop: '(min-width: 1025px) and (max-width: 1440px)',
                                    large: '(min-width: 1441px)'
                                }
                            }}
                        >
                            <div class="card-title">Adaptive Card 3</div>
                            <div class="card-content">
                                Responsive design ensures optimal user experience across all devices.
                                Each breakpoint provides appropriate styling and layout.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Responsive Elements -->
                <div class="demo-section">
                    <h3>🎯 Responsive Elements</h3>
                    <p>Elements that show/hide or change based on media queries.</p>
                    
                    <div class="media-examples">
                        <div class="example-card">
                            <div class="example-title">Conditional Display</div>
                            <div class="example-description">Elements that show only on specific screen sizes</div>
                            
                            <div 
                                class="responsive-element"
                                #media=${{
                                    queries: {
                                        mobile: '(max-width: 768px)',
                                        tablet: '(min-width: 769px) and (max-width: 1024px)',
                                        desktop: '(min-width: 1025px) and (max-width: 1440px)',
                                        large: '(min-width: 1441px)'
                                    },
                                    onMatch: (breakpoint: string) => {
                                        console.log(`Element visible on: ${breakpoint}`);
                                    }
                                }}
                            >
                                📱 Mobile Only
                            </div>
                            
                            <div 
                                class="responsive-element"
                                #media=${{
                                    queries: {
                                        tablet: '(min-width: 769px) and (max-width: 1024px)'
                                    }
                                }}
                            >
                                📱 Tablet Only
                            </div>
                            
                            <div 
                                class="responsive-element"
                                #media=${{
                                    queries: {
                                        desktop: '(min-width: 1025px) and (max-width: 1440px)'
                                    }
                                }}
                            >
                                💻 Desktop Only
                            </div>
                            
                            <div 
                                class="responsive-element"
                                #media=${{
                                    queries: {
                                        large: '(min-width: 1441px)'
                                    }
                                }}
                            >
                                🖥️ Large Screen Only
                            </div>
                        </div>
                        
                        <div class="example-card">
                            <div class="example-title">Orientation Detection</div>
                            <div class="example-description">Elements that respond to device orientation</div>
                            
                            <div 
                                class="responsive-element"
                                #media=${{
                                    queries: {
                                        landscape: '(orientation: landscape)',
                                        portrait: '(orientation: portrait)'
                                    }
                                }}
                            >
                                🌄 Landscape Mode
                            </div>
                            
                            <div 
                                class="responsive-element"
                                #media=${{
                                    queries: {
                                        portrait: '(orientation: portrait)'
                                    }
                                }}
                            >
                                📱 Portrait Mode
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Responsive Layout -->
                <div class="demo-section">
                    <h3>📐 Responsive Layout</h3>
                    <p>Grid layout that adapts columns based on screen size.</p>
                    
                    <div 
                        class="responsive-layout"
                        #media=${{
                            queries: {
                                mobile: '(max-width: 768px)',
                                tablet: '(min-width: 769px) and (max-width: 1024px)',
                                desktop: '(min-width: 1025px) and (max-width: 1440px)',
                                large: '(min-width: 1441px)'
                            }
                        }}
                    >
                        <div class="layout-item">Item 1</div>
                        <div class="layout-item">Item 2</div>
                        <div class="layout-item">Item 3</div>
                        <div class="layout-item">Item 4</div>
                        <div class="layout-item">Item 5</div>
                        <div class="layout-item">Item 6</div>
                    </div>
                </div>

                <!-- Code Examples -->
                <div class="demo-section">
                    <h3>💻 Code Examples</h3>
                    
                    <div class="code-example">
// Basic media query
&lt;div #media=\${{
  queries: {
    mobile: '(max-width: 768px)',
    desktop: '(min-width: 769px)'
  },
  onMatch: (breakpoint) => console.log('Matched:', breakpoint)
}}&gt;
  Responsive content
&lt;/div&gt;

// Conditional display
&lt;div #media=\${{
  queries: {
    mobile: '(max-width: 768px)'
  }
}}&gt;
  Only visible on mobile
&lt;/div&gt;

// Orientation detection
&lt;div #media=\${{
  queries: {
    landscape: '(orientation: landscape)',
    portrait: '(orientation: portrait)'
  }
}}&gt;
  Adapts to orientation
&lt;/div&gt;

// Complex queries
&lt;div #media=\${{
  queries: {
    tablet: '(min-width: 769px) and (max-width: 1024px)',
    highDpi: '(min-resolution: 2dppx)'
  }
}}&gt;
  Tablet and high DPI
&lt;/div&gt;
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('media-directive-demo', MediaDirectiveDemo);

const meta: Meta<MediaDirectiveDemo> = {
    title: 'Miura/Directives/Utility/11. Media Queries',
    component: 'media-directive-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Media Directive (#media)

The media directive provides powerful media query capabilities for responsive design, device detection, and adaptive layouts.

## Features

- **Multiple Queries**: Support for multiple media queries per element
- **Real-time Updates**: Automatically responds to window resize and orientation changes
- **Device Detection**: Screen size, orientation, and pixel ratio detection
- **Event Callbacks**: onMatch, onUnmatch, and onChange events
- **Performance Optimized**: Efficient query matching and updates

## Basic Usage

\`\`\`typescript
<div #media=\${{
  queries: {
    mobile: '(max-width: 768px)',
    desktop: '(min-width: 769px)'
  },
  onMatch: (breakpoint) => console.log('Matched:', breakpoint)
}}>
  Responsive content
</div>
\`\`\`

## Media Query Types

- **Screen Size**: Width and height based queries
- **Orientation**: Portrait and landscape detection
- **Resolution**: Pixel density and resolution queries
- **Device Type**: Touch, hover, and device capability queries
- **Custom Queries**: Any valid CSS media query

## Common Breakpoints

- **Mobile**: (max-width: 768px)
- **Tablet**: (min-width: 769px) and (max-width: 1024px)
- **Desktop**: (min-width: 1025px) and (max-width: 1440px)
- **Large**: (min-width: 1441px)

## Options

- \`queries\`: Object - Media query definitions
- \`onMatch\`: Function - Called when a query matches
- \`onUnmatch\`: Function - Called when a query no longer matches
- \`onChange\`: Function - Called when any query state changes
- \`debounce\`: Number - Debounce time for resize events (ms)

## Device Information

The directive provides access to:
- **Screen Dimensions**: Width and height
- **Orientation**: Portrait or landscape
- **Pixel Ratio**: Device pixel density
- **Viewport**: Viewport dimensions and scaling

## Use Cases

- **Responsive Design**: Adapt layouts to different screen sizes
- **Progressive Enhancement**: Show/hide features based on capabilities
- **Performance Optimization**: Load different content for different devices
- **Touch Interfaces**: Adapt interactions for touch devices
- **Print Styles**: Optimize content for printing

## Best Practices

1. Use mobile-first approach for responsive design
2. Test on actual devices, not just browser dev tools
3. Consider performance implications of complex queries
4. Use appropriate breakpoints for your content
5. Handle orientation changes gracefully
                `
            }
        }
    }
};

export default meta;
type Story = StoryObj<MediaDirectiveDemo>;

export const Default: Story = {
    args: {}
}; 