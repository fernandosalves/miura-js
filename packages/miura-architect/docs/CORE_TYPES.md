# Types and Data Structures

## Core Message Types

### WebSocket Message Format

All messages follow this envelope:

```typescript
interface DevToolsMessage {
  type: string;
  payload: any;
  timestamp?: number;
  sessionId?: string;
  sequenceId?: number;
}
```

## Bridge Events

### Component Events

```typescript
interface ComponentDiscoveredEvent {
  type: 'component:discovered';
  payload: {
    id: string;                    // Unique component ID
    tag: string;                   // HTML tag name
    parentId: string | null;        // Parent component ID
    timestamp: number;
    
    metadata?: {
      renderTime?: number;          // Last render duration (ms)
      updateCount?: number;         // Total updates since mount
      isConnected: boolean;         // Currently in DOM
    };
  };
}

interface ComponentUpdatedEvent {
  type: 'component:updated';
  payload: {
    id: string;
    changedProperties: string[];   // Which @property/@state changed
    renderTime: number;            // Duration of this update (ms)
    timestamp: number;
  };
}

interface ComponentRemovedEvent {
  type: 'component:removed';
  payload: {
    id: string;
    timestamp: number;
  };
}
```

### Signal Events

```typescript
interface SignalWrittenEvent {
  type: 'signal:written';
  payload: {
    id: string;                    // Unique signal ID
    label?: string;                // Property name or signal name
    oldValue: any;
    newValue: any;
    timestamp: number;
    writerId?: string;             // Component/computed that wrote it
  };
}

interface SignalReadEvent {
  type: 'signal:read';
  payload: {
    id: string;
    label?: string;
    readerId?: string;             // Component/computed that reads it
    timestamp: number;
  };
}
```

### Store & Action Events

```typescript
interface StoreDispatchedEvent {
  type: 'store:dispatched';
  payload: {
    storeKey: string;              // Store identifier
    action: string;                // Action name
    args: any[];                   // Action arguments
    timestamp: number;
    
    beforeState?: Record<string, any>;
    afterState?: Record<string, any>;
    duration?: number;             // Action execution time (ms)
  };
}

interface StoreStateChangedEvent {
  type: 'store:state-changed';
  payload: {
    storeKey: string;
    changes: Record<string, any>;  // What changed
    timestamp: number;
  };
}
```

### Context Events

```typescript
interface ConsumeResolvedEvent {
  type: 'consume:resolved';
  payload: {
    consumerComponentId: string;   // Component doing @consume
    contextKey: string;            // Context key name
    providerId: string;            // Component providing context
    value: any;                    // Context value
    timestamp: number;
  };
}

interface ContextProvidedEvent {
  type: 'context:provided';
  payload: {
    providerId: string;
    contextKey: string;
    value: any;
    timestamp: number;
  };
}
```

### Binding Events

```typescript
interface BindingCreatedEvent {
  type: 'binding:created';
  payload: {
    componentId: string;
    bindingType: 'property' | 'event' | 'attribute' | 'boolean' | 'class' | 'style' | 
                 'reference' | 'directive' | 'bind' | 'spread' | 'async' | 'utility' | 'node';
    targetElement?: string;        // Which DOM element
    targetProperty?: string;       // Which property/attribute
    timestamp: number;
  };
}

interface BindingUpdatedEvent {
  type: 'binding:updated';
  payload: {
    componentId: string;
    bindingType: string;
    oldValue: any;
    newValue: any;
    timestamp: number;
  };
}
```

## State Snapshot Types

### AppSnapshot

Complete state of the running application:

```typescript
interface AppSnapshot {
  components: ComponentInfo[];
  signals: SignalInfo[];
  stores: StoreInfo[];
  contexts: ContextInfo[];
  timestamp: number;
  appVersion?: string;
  recordingSessionId?: string;
}
```

## Architecture Manifest Types

Runtime snapshots should be merged with optional build-time manifest data. The manifest fills gaps that runtime inspection cannot reliably provide, such as declared prop names, source files, and API endpoints.

```typescript
interface ApplicationManifest {
  version: 1;
  generatedAt: number;
  rootDir?: string;
  components: ManifestComponent[];
  stores?: ManifestStore[];
  apiEndpoints?: ManifestApiEndpoint[];
}

interface ManifestComponent {
  tag: string;
  className?: string;
  file?: string;
  route?: string;
  properties: ManifestField[];
  state: ManifestField[];
  signals: ManifestField[];
  contexts: ManifestContextUsage[];
  stores: string[];
  api: ManifestApiEndpoint[];
}

interface ManifestField {
  name: string;
  type?: string;
  defaultValue?: unknown;
  readonly?: boolean;
  source?: 'static-properties' | 'state' | 'signal' | 'computed' | 'inferred';
}

interface ManifestContextUsage {
  key: string;
  role: 'provider' | 'consumer';
}

interface ManifestStore {
  key: string;
  file?: string;
  actions?: string[];
  stateKeys?: string[];
}

interface ManifestApiEndpoint {
  id?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string;
  path: string;
  source?: string;
  file?: string;
}
```

## Architecture Graph Types

The architecture graph is richer than the current low-level canvas node shape.

```typescript
interface ArchitectureCardSection {
  id: 'state' | 'properties' | 'signals' | 'contexts' | 'stores' | 'api' | string;
  title: string;
  items: Array<{
    name: string;
    valuePreview?: string;
    type?: string;
    source?: 'runtime' | 'manifest' | 'merged';
  }>;
  collapsed?: boolean;
}

interface ArchitectureNode {
  id: string;
  type: 'app' | 'component' | 'store' | 'context' | 'signal' | 'api' | 'external';
  title: string;
  subtitle?: string;
  tone: 'app' | 'component' | 'store' | 'context' | 'signal' | 'api' | 'external';
  x: number;
  y: number;
  width: number;
  sections: ArchitectureCardSection[];
  nodeData?: unknown;
}
```

### ComponentInfo

```typescript
interface ComponentInfo {
  id: string;
  tag: string;
  parentId: string | null;
  childIds: string[];
  
  // Properties and State
  properties: Record<string, PropertyDescriptor>;
  state: Record<string, PropertyDescriptor>;
  localSignals: Record<string, SignalDescriptor>;
  
  // Metadata
  renderTime: number;              // Last render duration (ms)
  updateCount: number;             // Total updates
  subscriberCount: number;         // How many subscriptions to this component's signals
  
  // Lifecycle
  mounted: boolean;
  connected: boolean;
  connectedTime: number;           // When it was connected
  
  // Performance
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
}

interface PropertyDescriptor {
  label: string;
  value: any;
  type: 'property' | 'state' | 'signal' | 'global' | 'computed';
  readonly?: boolean;
  reflect?: boolean;              // If @property has reflect: true
}
```

### SignalInfo

```typescript
interface SignalInfo {
  id: string;
  label?: string;
  type: 'writable' | 'computed' | 'shared' | 'global';
  
  value: any;
  
  // Reactivity
  subscribers: string[];           // Component/computed IDs that subscribe
  dependencies: string[];          // If computed: which signals it depends on
  
  // Metadata
  createdTime: number;
  lastWriteTime?: number;
  writeCount: number;
  readCount: number;
  
  // Performance
  averageWriteLatency?: number;    // Time to notify subscribers
}
```

### StoreInfo

```typescript
interface StoreInfo {
  key: string;
  state: Record<string, any>;
  
  actions: Record<string, {
    name: string;
    callCount: number;
    lastCalled?: number;
    averageDuration?: number;
  }>;
  
  subscribers: string[];           // Component IDs subscribed to store changes
  
  // History (last N dispatches)
  dispatchHistory: DispatchRecord[];
}

interface DispatchRecord {
  action: string;
  args: any[];
  timestamp: number;
  duration: number;
  beforeState: Record<string, any>;
  afterState: Record<string, any>;
}
```

### ContextInfo

```typescript
interface ContextInfo {
  key: string;
  value: any;
  providerId: string;              // Component providing it
  consumerIds: string[];           // Components consuming it
  createdTime: number;
}
```

## Visual Graph Types

### Node Canvas Data

```typescript
interface NodeCanvasNode {
  id: string;
  x: number;                       // Absolute position
  y: number;
  width?: number;                  // Default 220px
  
  // Display
  title: string;                   // Component tag or signal name
  subtitle?: string;               // Property count or "Computed(2 deps)"
  icon?: string;                   // Icon name from registry
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  
  // Metadata
  type: 'component' | 'signal' | 'store' | 'context';
  nodeData?: any;                  // Full ComponentInfo, SignalInfo, etc.
  
  // Visual feedback
  isSelected?: boolean;
  isHighlighted?: boolean;
  pulseAnimation?: boolean;        // For recently updated nodes
  color?: string;                  // Performance-based: red (slow), green (fast)
}

interface NodeCanvasConnector {
  id: string;
  from: string;                    // Source node ID
  to: string;                      // Target node ID
  
  // Display
  label?: string;                  // "reads", "updates", "@consume", etc.
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  style?: 'solid' | 'dashed' | 'dotted';
  
  // Type
  type: 'dependency' | 'binding' | 'consume' | 'data-flow' | 'action';
}

interface GraphData {
  nodes: NodeCanvasNode[];
  connectors: NodeCanvasConnector[];
  viewport?: {
    centerX: number;
    centerY: number;
    zoom: number;
  };
}
```

## Inspector State Types

### SelectedNode State

```typescript
interface SelectedNode {
  id: string;
  type: 'component' | 'signal' | 'store' | 'context';
  
  // Component details
  component?: {
    info: ComponentInfo;
    bindings: BindingDetail[];
    consumedContexts: ContextInfo[];
  };
  
  // Signal details
  signal?: {
    info: SignalInfo;
    valueHistory: { value: any; timestamp: number }[];  // Last 5
    consumers: ComponentInfo[];
    sources: SignalInfo[];           // If computed
  };
  
  // Store details
  store?: {
    info: StoreInfo;
    recentActions: DispatchRecord[];  // Last 10
  };
}

interface BindingDetail {
  type: string;                   // 'property', 'event', etc.
  targetElement: string;
  targetProperty: string;
  sourceSignal?: string;
  value?: any;
}
```

## Session and Replay Types

### SessionMetadata

```typescript
interface SessionMetadata {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  isRecording: boolean;
  
  eventCount: number;
  appVersion?: string;
  
  // For replay
  initialState: AppSnapshot;
  events: DevToolsMessage[];      // All events in order
}

interface ReplayState {
  currentTime: number;            // Timestamp in replay
  currentIndex: number;           // Which event we're at
  playbackSpeed: number;          // 0.5, 1, 2, etc.
  isPlaying: boolean;
  
  // Current state at this point in time
  snapshot: AppSnapshot;
}
```

## UI State Types

### FilterOptions

```typescript
interface FilterOptions {
  hideInternal: boolean;           // Hide signals starting with __
  collapseUnused: boolean;         // Hide components with no recent updates
  onlyShowChanged: boolean;        // Only show nodes modified in last N seconds
  searchTerm: string;
  
  // By type
  showComponents: boolean;
  showSignals: boolean;
  showStores: boolean;
  showContext: boolean;
  
  // Performance
  minRenderTime?: number;          // (ms) Show only components slower than this
  
  hideConnectorTypes?: string[];   // Hide certain connector types
}

interface UIState {
  selectedNodeId: string | null;
  filterOptions: FilterOptions;
  isConnected: boolean;
  recordingSession: SessionMetadata | null;
  
  // Graph viewport
  graphZoom: number;
  graphCenterX: number;
  graphCenterY: number;
  
  // Panels
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  activeTab: 'timeline' | 'graph' | 'state';
  
  // Visibility
  showBindings: boolean;
  showPerformanceMetrics: boolean;
  showBindingTypes: string[];      // Which binding types to highlight
}
```

## API Response Types

### GET /api/sessions

```typescript
interface SessionsListResponse {
  sessions: SessionMetadata[];
}
```

### POST /api/sessions/{id}/record

```typescript
interface RecordRequestPayload {
  enabled: boolean;
}

interface RecordResponse {
  session: SessionMetadata;
  status: 'recording' | 'stopped';
}
```

### GET /api/sessions/{id}/events

```typescript
interface SessionEventsResponse {
  sessionId: string;
  events: DevToolsMessage[];
  from: number;                    // Timestamp
  to: number;
}
```

## Type Guards & Helpers

```typescript
// Type guards
function isComponentEvent(msg: DevToolsMessage): msg is DevToolsMessage & { payload: ComponentDiscoveredEvent['payload'] } {
  return msg.type.startsWith('component:');
}

function isSignalEvent(msg: DevToolsMessage): msg is DevToolsMessage & { payload: SignalWrittenEvent['payload'] } {
  return msg.type.startsWith('signal:');
}

function isComponentInfo(data: any): data is ComponentInfo {
  return data?.id && data?.tag && Array.isArray(data?.properties);
}

function isSignalInfo(data: any): data is SignalInfo {
  return data?.id && (data?.type === 'writable' || data?.type === 'computed');
}

// Serialization
function serializeSnapshot(snapshot: AppSnapshot): string {
  // Custom serializer that handles circular refs
}

function deserializeSnapshot(json: string): AppSnapshot {
  // Custom deserializer with type validation
}
```

## Notes

- All timestamps are epoch milliseconds
- IDs are unique per session
- Values may contain circular references; use `serializeUnknown()` from debugger
- For large apps, some arrays (bindingHistory, dispatchHistory) are capped to last N items
