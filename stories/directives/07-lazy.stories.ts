import { MiuraElement, html, css } from '@miurajsjs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

class LazyDirectiveDemo extends MiuraElement {
    declare lazyLoadCount: number;
    declare loadedImages: string[];

    static properties = {
        lazyLoadCount: { type: Number, default: 0, state: true },
        loadedImages: { type: Array, default: () => [], state: true }
    };

    static get styles() {
        return css`
            :host {
                display: block;
                font-family: 'Helvetica Neue', Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }

            .lazy-demo {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                padding: 20px;
            }

            .demo-section {
                margin-bottom: 20px;
                padding: 15px;
                border: 1px solid #eee;
                border-radius: 4px;
            }

            h3 {
                color: #2196F3;
                margin-top: 0;
            }

            .lazy-container {
                height: 500px;
                overflow-y: auto;
                border: 1px solid #ddd;
                padding: 10px;
                background: #f5f5f5;
            }

            .lazy-item {
                height: 250px;
                margin: 15px 0;
                background: white;
                border: 1px solid #ccc;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                color: #666;
                border-radius: 8px;
                transition: all 0.3s ease;
            }

            .lazy-item.loaded {
                background: #e8f5e8;
                border-color: #4caf50;
                color: #2e7d32;
                box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
            }

            .lazy-image {
                width: 100%;
                height: 200px;
                object-fit: cover;
                border-radius: 4px;
                transition: opacity 0.3s ease;
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

            .loaded-list {
                max-height: 150px;
                overflow-y: auto;
                background: #f9f9f9;
                padding: 10px;
                border-radius: 4px;
                font-size: 12px;
            }

            .loaded-item {
                padding: 2px 4px;
                margin: 2px 0;
                background: white;
                border-radius: 2px;
                border-left: 3px solid #4caf50;
            }

            button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
                margin: 5px;
            }

            button:hover {
                background: #45a049;
            }

            .placeholder {
                background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #999;
                font-style: italic;
            }
        `;
    }

    handleLazyLoad = (imageId: string) => () => {
        this.lazyLoadCount++;
        this.loadedImages = [...this.loadedImages, imageId];
        console.log(`Lazy loaded: ${imageId} (Total: ${this.lazyLoadCount})`);
    };

    handleLazyError = (imageId: string) => (error: Error) => {
        console.error(`Failed to load ${imageId}:`, error);
    };

    resetStats = () => {
        this.lazyLoadCount = 0;
        this.loadedImages = [];
    };

    protected override template() {
        return html`
            <div class="lazy-demo">
                <h2>🦥 Lazy Loading Directive Demo</h2>
                <p>Automatically loads content when it comes into view, perfect for performance optimization.</p>

                <!-- Statistics -->
                <div class="stats">
                    <div class="stats-row">
                        <span>Total Lazy Loads:</span>
                        <span>${this.lazyLoadCount}</span>
                    </div>
                    <div class="stats-row">
                        <span>Loaded Images:</span>
                        <span>${this.loadedImages.length}</span>
                    </div>
                    <div class="stats-row">
                        <span>Success Rate:</span>
                        <span>${this.lazyLoadCount > 0 ? '100%' : '0%'}</span>
                    </div>
                </div>

                <button @click="${this.resetStats}">Reset Statistics</button>

                <!-- Lazy Loading Demo -->
                <div class="demo-section">
                    <h3>Scroll to Load Images</h3>
                    <p>Scroll down to see images load automatically as they come into view.</p>
                    
                    <div class="lazy-container">
                        <div class="lazy-item">
                            <div class="placeholder">
                                <p>Scroll down to see lazy loading in action...</p>
                            </div>
                        </div>
                        
                        <div class="lazy-item">
                            <img 
                                #lazy=${{
                                    threshold: 0.1,
                                    rootMargin: '50px',
                                    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
                                    onLoad: this.handleLazyLoad('Nature Scene 1'),
                                    onError: this.handleLazyError('Nature Scene 1')
                                }}
                                data-src="https://picsum.photos/400/200?random=1"
                                alt="Nature Scene 1"
                                class="lazy-image"
                            />
                            <p style="text-align: center; margin-top: 10px; font-weight: bold;">
                                Nature Scene 1
                            </p>
                        </div>
                        
                        <div class="lazy-item">
                            <img 
                                #lazy=${{
                                    threshold: 0.1,
                                    rootMargin: '50px',
                                    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
                                    onLoad: this.handleLazyLoad('City View 2'),
                                    onError: this.handleLazyError('City View 2')
                                }}
                                data-src="https://picsum.photos/400/200?random=2"
                                alt="City View 2"
                                class="lazy-image"
                            />
                            <p style="text-align: center; margin-top: 10px; font-weight: bold;">
                                City View 2
                            </p>
                        </div>
                        
                        <div class="lazy-item">
                            <img 
                                #lazy=${{
                                    threshold: 0.1,
                                    rootMargin: '50px',
                                    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
                                    onLoad: this.handleLazyLoad('Mountain Landscape 3'),
                                    onError: this.handleLazyError('Mountain Landscape 3')
                                }}
                                data-src="https://picsum.photos/400/200?random=3"
                                alt="Mountain Landscape 3"
                                class="lazy-image"
                            />
                            <p style="text-align: center; margin-top: 10px; font-weight: bold;">
                                Mountain Landscape 3
                            </p>
                        </div>
                        
                        <div class="lazy-item">
                            <img 
                                #lazy=${{
                                    threshold: 0.1,
                                    rootMargin: '50px',
                                    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
                                    onLoad: this.handleLazyLoad('Ocean View 4'),
                                    onError: this.handleLazyError('Ocean View 4')
                                }}
                                data-src="https://picsum.photos/400/200?random=4"
                                alt="Ocean View 4"
                                class="lazy-image"
                            />
                            <p style="text-align: center; margin-top: 10px; font-weight: bold;">
                                Ocean View 4
                            </p>
                        </div>
                        
                        <div class="lazy-item">
                            <img 
                                #lazy=${{
                                    threshold: 0.1,
                                    rootMargin: '50px',
                                    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
                                    onLoad: this.handleLazyLoad('Forest Scene 5'),
                                    onError: this.handleLazyError('Forest Scene 5')
                                }}
                                data-src="https://picsum.photos/400/200?random=5"
                                alt="Forest Scene 5"
                                class="lazy-image"
                            />
                            <p style="text-align: center; margin-top: 10px; font-weight: bold;">
                                Forest Scene 5
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Loaded Images List -->
                <div class="demo-section">
                    <h3>Loaded Images</h3>
                    <div class="loaded-list">
                        ${this.loadedImages.length > 0 ? 
                            this.loadedImages.map(image => html`
                                <div class="loaded-item">✅ ${image}</div>
                            `) : 
                            html`<p style="color: #999; font-style: italic;">No images loaded yet. Scroll down to see lazy loading in action!</p>`
                        }
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('lazy-directive-demo', LazyDirectiveDemo);

const meta: Meta<LazyDirectiveDemo> = {
    title: 'Miura/Directives/Utility/08. Lazy Loading',
    component: 'lazy-directive-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Lazy Loading Directive (#lazy)

The lazy loading directive automatically loads content when it comes into view, perfect for performance optimization and reducing initial page load times.

## Features

- **Intersection Observer**: Uses modern browser APIs for efficient detection
- **Placeholder Support**: Shows placeholder content while loading
- **Error Handling**: Graceful fallback for failed loads
- **Configurable Threshold**: Adjust when content starts loading
- **Root Margin**: Control the loading trigger point

## Basic Usage

\`\`\`typescript
<img #lazy=\${{
  threshold: 0.1,
  placeholder: 'data:image/svg+xml,...',
  onLoad: () => console.log('Image loaded'),
  onError: (error) => console.error('Load failed', error)
}} data-src="heavy-image.jpg" />
\`\`\`

## Options

- \`threshold\`: Number (0-1) - How much of the element must be visible (default: 0.1)
- \`rootMargin\`: String - CSS margin around the root (default: '50px')
- \`placeholder\`: String - Placeholder content while loading
- \`onLoad\`: Function - Called when content loads successfully
- \`onError\`: Function - Called when loading fails

## Use Cases

- **Image Galleries**: Load images as users scroll
- **Infinite Scroll**: Load more content dynamically
- **Heavy Components**: Defer loading of complex UI elements
- **Performance Optimization**: Reduce initial bundle size

## Best Practices

1. Always provide meaningful placeholders
2. Set appropriate thresholds for your use case
3. Handle loading errors gracefully
4. Use with images, iframes, and other heavy content
5. Consider network conditions when setting thresholds
                `
            }
        }
    }
};

export default meta;
type Story = StoryObj<LazyDirectiveDemo>;

export const Default: Story = {
    args: {}
}; 