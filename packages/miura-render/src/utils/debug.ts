/**
 * Re-export debug utilities from @miura/miura-debugger.
 * This file exists for backwards compatibility — all debug logic
 * now lives in the miura-debugger package (the canonical source).
 */
export {
    type DebugConfig,
    debugConfig,
    enableDebug,
    disableDebug,
    debugLog,
    DebugType
} from '@miura/miura-debugger';

