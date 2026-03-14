import { MuiSkeleton, registerMuiSkeleton } from './skeleton.js';

/**
 * Shimmer variant built on top of MuiSkeleton with forced animation.
 */
export class MuiShimmer extends MuiSkeleton {
    constructor() {
        super();
        this.animated = true;
    }
}

export function registerMuiShimmer() {
    registerMuiSkeleton();
    if (!customElements.get('mui-shimmer')) {
        customElements.define('mui-shimmer', MuiShimmer);
    }
}

registerMuiShimmer();