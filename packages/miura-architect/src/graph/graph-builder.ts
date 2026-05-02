import type {
  ArchitectureCardItem,
  ArchitectureCardSection,
  ArchitectureGraphConfig,
  ApplicationManifest,
  ApplicationManifestComponent,
  AppSnapshot,
  ComponentInfo,
  FilterOptions,
  GraphData,
  NodeCanvasConnector,
  NodeCanvasNode,
  SignalInfo,
} from '../types.js';
import { applyDefaultLayout } from './layout.js';

export function buildGraph(
  snapshot: AppSnapshot,
  _selectedNodeId: string,
  filters: FilterOptions,
  config: ArchitectureGraphConfig = {},
  manifest?: ApplicationManifest | null,
): GraphData {
  const nodes: NodeCanvasNode[] = [];
  const connectors: NodeCanvasConnector[] = [];
  const componentsById = new Map(snapshot.components.map((component) => [component.id, component]));
  const manifestByTag = new Map((manifest?.components ?? []).map((component) => [component.tag, component]));
  const componentNodeIdsByTag = new Map<string, string[]>();
  const cardDepthById = new Map<string, number>();
  const runtimeGlobalSignals: SignalInfo[] = [];

  // 1. Calculate Component Depths
  const componentDepths = new Map<string, number>();
  const calculateDepth = (id: string): number => {
    if (componentDepths.has(id)) return componentDepths.get(id)!;
    
    const comp = snapshot.components.find(c => c.id === id);
    if (!comp) {
      componentDepths.set(id, 0);
      return 0;
    }

    // Try formal parentId first (runtime)
    if (comp.parentId) {
      const depth = calculateDepth(comp.parentId) + 1;
      componentDepths.set(id, depth);
      return depth;
    }

    // Fallback: Check manifest for static parent relationships
    const potentialManifestParents = manifest?.components.filter(m => m.children.includes(comp.tag)) || [];
    if (potentialManifestParents.length > 0) {
      // Find all instances of these parents that exist in the snapshot
      const parentInstances = potentialManifestParents
        .map(mp => snapshot.components.find(c => c.tag === mp.tag))
        .filter((c): c is ComponentInfo => !!c && c.id !== id);

      if (parentInstances.length > 0) {
        // Calculate depths for all parents and pick the maximum
        const depths = parentInstances.map(pi => calculateDepth(pi.id));
        const maxDepth = Math.max(...depths);
        
        componentDepths.set(id, maxDepth + 1);
        return maxDepth + 1;
      }
      
      componentDepths.set(id, 1);
      return 1;
    }

    componentDepths.set(id, 0);
    return 0;
  };

  snapshot.components.forEach(c => {
    calculateDepth(c.id);
  });

  componentDepths.forEach((depth, id) => cardDepthById.set(id, depth));
  const componentRoles = classifyComponents(snapshot, config, manifestByTag);
  const nearestCardByComponentId = new Map<string, string>();
  for (const component of snapshot.components) {
    nearestCardByComponentId.set(component.id, nearestCardComponentId(component, componentsById, componentRoles));
  }
  const inlineChildrenByCardId = groupInlineChildren(snapshot.components, componentRoles, nearestCardByComponentId);

  // 2. Build Component Nodes
  if (filters.showComponents) {
    const runtimeTags = new Set<string>();
    for (const component of snapshot.components) {
      if (componentRoles.get(component.id) === 'inline') continue;
      runtimeTags.add(component.tag);
      const depth = componentDepths.get(component.id) || 0;
      cardDepthById.set(component.id, depth);
      appendMapList(componentNodeIdsByTag, component.tag, component.id);
      const componentSignals = signalsForComponent(snapshot.signals, component.id);
      const consumedContexts = snapshot.contexts.filter((context) => context.consumerIds?.includes(component.id));
      const inlineChildren = inlineChildrenByCardId.get(component.id) ?? [];
      const manifestComponent = manifestByTag.get(component.tag);
      nodes.push({
        id: component.id,
        title: component.tag,
        subtitle: component.parentId ? `${component.updateCount ?? 0} updates` : 'app root',
        type: component.parentId ? 'component' : 'app',
        icon: component.parentId ? 'puzzle' : 'panel-top',
        tone: component.parentId ? 'component' : 'app',
        x: 0,
        y: 0,
        depth,
        sections: componentSections(component, componentSignals, consumedContexts, inlineChildren, manifestComponent),
        nodeData: component,
      });

      const parentCardId = component.parentId ? nearestCardByComponentId.get(component.parentId) : '';
      if (parentCardId && parentCardId !== component.id) {
        connectors.push({
          id: `parent:${parentCardId}->${component.id}`,
          from: parentCardId,
          fromItemId: itemId('ui-elements', component.tag),
          to: component.id,
          type: 'data-flow',
          tone: 'neutral',
          label: 'child',
        });
      } else {
        // Fallback: Use manifest parents for connectors if runtime parent is missing
        const potentialManifestParents = manifest?.components.filter(m => m.children.includes(component.tag)) || [];
        for (const manifestParent of potentialManifestParents) {
          const parentInstances = snapshot.components.filter(c => c.tag === manifestParent.tag);
          for (const parentInstance of parentInstances) {
            if (parentInstance.id !== component.id) {
              connectors.push({
                id: `struct:${parentInstance.id}->${component.id}`,
                from: parentInstance.id,
                fromItemId: itemId('ui-elements', component.tag),
                to: component.id,
                type: 'data-flow',
                tone: 'accent',
                label: 'structure',
              });
            }
          }
        }
      }
    }

    for (const manifestComponent of manifest?.components ?? []) {
      if (runtimeTags.has(manifestComponent.tag)) continue;
      if (matchesAny(manifestComponent.tag, config.inlineComponentPatterns ?? [])) continue;
      const isManifestApp = matchesAny(manifestComponent.tag, ['*-app']);
      const id = `manifest:${manifestComponent.tag}`;
      const depth = isManifestApp ? 0 : 1;
      cardDepthById.set(id, depth);
      appendMapList(componentNodeIdsByTag, manifestComponent.tag, id);
      nodes.push({
        id,
        title: manifestComponent.tag,
        subtitle: manifestComponent.file,
        type: isManifestApp ? 'app' : 'component',
        icon: isManifestApp ? 'panel-top' : 'puzzle',
        tone: isManifestApp ? 'app' : 'neutral',
        x: 0,
        y: 0,
        depth,
        sections: componentSections(
          {
            id: `manifest:${manifestComponent.tag}`,
            tag: manifestComponent.tag,
            parentId: null,
            properties: {},
            state: {},
          },
          [],
          [],
          [],
          manifestComponent,
        ),
        nodeData: manifestComponent,
      });
    }
  }

  const apiNodes = buildManifestApiNodes(manifest, componentNodeIdsByTag, cardDepthById);
  nodes.push(...apiNodes.nodes);
  connectors.push(...apiNodes.connectors);

  // 3. Build Signal Relations
  if (filters.showSignals) {
    for (const signal of snapshot.signals) {
      const writerCardIds = unique((signal.writers ?? []).map((id) => nearestCardByComponentId.get(id) ?? id));
      const subscriberCardIds = unique((signal.subscribers ?? []).map((id) => nearestCardByComponentId.get(id) ?? id));

      if (writerCardIds.length === 0 && (subscriberCardIds.length === 0 || subscriberCardIds.length > 1)) {
        runtimeGlobalSignals.push(signal);
      }

      if (writerCardIds.length === 0) {
        const fromGlobal = subscriberCardIds.length > 1 || subscriberCardIds.length === 0;
        if (!fromGlobal) continue;
        for (const subscriberCardId of subscriberCardIds) {
          connectors.push({
            id: `read:runtime-globals:${signal.id}->${subscriberCardId}`,
            from: 'runtime:globals',
            to: subscriberCardId,
            fromItemId: itemId('signals', signalName(signal)),
            toItemId: signalAnchorItemId(signal, componentById(componentsById, subscriberCardId), manifestByTag),
            type: 'dependency',
            tone: 'accent',
            label: 'reads',
            activity: signalActivity(signal),
          });
        }
        continue;
      }

      for (const writerCardId of writerCardIds) {
        for (const subscriberCardId of subscriberCardIds) {
          if (writerCardId === subscriberCardId) continue;
          connectors.push({
            id: `signal:${signal.id}:${writerCardId}->${subscriberCardId}`,
            from: writerCardId,
            to: subscriberCardId,
            fromItemId: signalAnchorItemId(signal, componentById(componentsById, writerCardId), manifestByTag),
            toItemId: signalAnchorItemId(signal, componentById(componentsById, subscriberCardId), manifestByTag),
            type: 'dependency',
            tone: 'accent',
            label: 'signal',
            activity: signalActivity(signal),
          });
        }
      }
    }
  }

  if (filters.showSignals && runtimeGlobalSignals.length) {
    nodes.push({
      id: 'runtime:globals',
      title: 'globals',
      subtitle: `${runtimeGlobalSignals.length} signals`,
      type: 'external',
      icon: 'globe',
      tone: 'external',
      x: 0,
      y: 0,
      depth: 0.65,
      sections: [
        listSection('signals', 'signals', runtimeGlobalSignals.map((signal) => ({
          id: itemId('signals', signalName(signal)),
          name: signalName(signal),
          valuePreview: preview(signal.value),
          type: signal.type ?? 'writable',
          source: 'runtime',
          activity: signalActivity(signal),
        })), 'no global signals'),
      ],
      nodeData: { type: 'runtime-globals', signals: runtimeGlobalSignals },
    });
  }

  // 4. Build Store Nodes
  if (filters.showStores) {
    const allStoreKeys = new Set(snapshot.stores.map((s) => s.key));
    if (manifest) {
      manifest.components.forEach((c) => {
        if (c.stores) c.stores.forEach((s) => allStoreKeys.add(s));
      });
    }

    for (const storeKey of allStoreKeys) {
      const runtimeStore = snapshot.stores.find((s) => s.key === storeKey);
      const isRuntime = !!runtimeStore;
      
      // Collect IDs of cards that should connect to this store
      const relatedCardIds = new Set<string>();
      if (runtimeStore?.subscribers) {
        runtimeStore.subscribers.forEach(id => {
          const cardId = nearestCardByComponentId.get(id) ?? id;
          if (cardId) relatedCardIds.add(cardId);
        });
      }
      
      // Also check if any components explicitly mention this store in their manifest or runtime state
      for (const component of snapshot.components) {
        const manifestForNode = manifestByTag.get(component.tag);
        if (manifestForNode?.stores?.includes(storeKey) || (component.properties as any)?.stores?.includes?.(storeKey)) {
          const cardId = nearestCardByComponentId.get(component.id) ?? component.id;
          relatedCardIds.add(cardId);
        }
      }

      nodes.push({
        id: storeKey,
        title: storeKey,
        subtitle: isRuntime ? `${Object.keys(runtimeStore.state ?? {}).length} keys` : 'static (manifest)',
        type: 'store',
        icon: 'columns',
        tone: isRuntime ? 'store' : 'neutral',
        x: 0,
        y: 0,
        depth: relatedDepth(cardDepthById, [...relatedCardIds], 1) + 0.1,
        sections: runtimeStore ? [
          fieldSection('state', 'state', runtimeStore.state, 'no state keys'),
          listSection('actions', 'actions', (runtimeStore.dispatchHistory ?? []).map((entry) => ({
            name: entry.action,
            valuePreview: `${entry.duration ?? 0}ms`,
            source: 'runtime',
            activity: { updates: 1, lastActiveTime: entry.timestamp },
          }))),
        ] : [
          {
            id: 'manifest',
            title: 'manifest',
            items: [{ name: 'Defined in source', source: 'manifest' }],
          },
        ],
        nodeData: runtimeStore || { key: storeKey, manifestOnly: true },
      });

      // Add connectors for runtime stores
      if (runtimeStore) {
        for (const cardId of [...relatedCardIds]) {
          connectors.push({
            id: `store-link:${cardId}->${storeKey}`,
            from: cardId,
            fromItemId: itemId('stores', storeKey),
            to: storeKey,
            toItemId: itemId('state', 'value'), // Connect to the state header of the store
            type: 'binding',
            tone: 'store',
          });
        }
      }
    }
  }

  // 5. Build Context Nodes
  if (filters.showContext) {
    const allContextKeys = new Set(snapshot.contexts.map((c) => c.key));
    if (manifest) {
      manifest.components.forEach((c) => {
        if (c.contexts) c.contexts.forEach((ctx) => allContextKeys.add(ctx.key));
      });
    }

    for (const contextKey of allContextKeys) {
      const runtimeContext = snapshot.contexts.find((c) => c.key === contextKey);
      const isRuntime = !!runtimeContext;
      const id = `ctx:${contextKey}`;
      
      const relatedCardIds = unique(isRuntime ? [
        runtimeContext.providerId ? nearestCardByComponentId.get(runtimeContext.providerId) ?? runtimeContext.providerId : '',
        ...(runtimeContext.consumerIds ?? []).map((id) => nearestCardByComponentId.get(id) ?? id),
      ].filter(Boolean) : (manifest?.components.filter((c) => c.contexts?.some(ctx => ctx.key === contextKey)) ?? [])
            .flatMap((c) => componentNodeIdsByTag.get(c.tag) || []));

      nodes.push({
        id,
        title: contextKey,
        subtitle: isRuntime ? `${runtimeContext.consumerIds?.length ?? 0} consumers` : 'static (manifest)',
        type: 'context',
        icon: 'box',
        tone: isRuntime ? 'context' : 'neutral',
        x: 0,
        y: 0,
        depth: relatedDepth(cardDepthById, relatedCardIds, 1) + 0.1,
        sections: isRuntime ? [
          {
            id: 'value',
            title: 'current value',
            items: [{ name: 'value', valuePreview: preview(runtimeContext.value), source: 'runtime' }],
          },
          listSection('consumers', 'consumers', (runtimeContext.consumerIds ?? []).map(cid => ({
            name: componentsById.get(cid)?.tag || cid,
            source: 'runtime'
          })))
        ] : [
          {
            id: 'manifest',
            title: 'manifest',
            items: [{ name: 'Defined in source', source: 'manifest' }],
          }
        ],
        nodeData: runtimeContext || { key: contextKey, manifestOnly: true },
      });

      if (isRuntime) {
        if (runtimeContext.providerId) {
          const providerCardId = nearestCardByComponentId.get(runtimeContext.providerId) ?? runtimeContext.providerId;
          connectors.push({
            id: `ctx-prov:${providerCardId}->${id}`,
            from: providerCardId,
            to: id,
            toItemId: itemId('current-value', 'value'),
            type: 'data-flow',
            tone: 'context',
            label: 'provides',
          });
        }
        for (const consumerId of runtimeContext.consumerIds ?? []) {
          const consumerCardId = nearestCardByComponentId.get(consumerId) ?? consumerId;
          const consumerTag = componentsById.get(consumerId)?.tag || consumerId;
          connectors.push({
            id: `ctx-cons:${consumerCardId}->${id}`,
            from: consumerCardId,
            fromItemId: itemId('contexts', contextKey),
            to: id,
            toItemId: itemId('consumers', consumerTag),
            type: 'consume',
            tone: 'context',
            label: 'consumes',
          });
        }
      }
    }
  }

  return {
    nodes: applyDefaultLayout(nodes),
    connectors,
  };
}

function componentSections(
  component: ComponentInfo,
  signals: SignalInfo[],
  contexts: Array<{ key: string; providerId?: string }>,
  inlineChildren: ArchitectureCardItem[],
  manifestComponent?: ApplicationManifestComponent,
): ArchitectureCardSection[] {
  const stateNames = fieldNameSet(component.state ?? {}, manifestComponent?.state ?? []);
  const propertyNames = fieldNameSet(component.properties ?? {}, manifestComponent?.properties ?? []);
  const fieldActivity = signalActivityByName(signals);
  const standaloneSignals = signals.filter((signal) => {
    const name = signalName(signal);
    return !stateNames.has(name) && !propertyNames.has(name);
  });

  return [
    mergedFieldSection('state', 'state', component.state ?? {}, manifestComponent?.state ?? [], 'waiting for state metadata', fieldActivity),
    mergedFieldSection('properties', 'properties', component.properties ?? {}, manifestComponent?.properties ?? [], 'waiting for property metadata', fieldActivity),
    listSection('ui-elements', 'ui elements', inlineChildren, 'no inline elements'),
    listSection('signals', 'signals', mergeSignals(standaloneSignals, manifestComponent), 'no observed signals'),
    listSection('stores', 'stores', (manifestComponent?.stores ?? []).map((store) => ({
      id: itemId('stores', store),
      name: store,
      valuePreview: 'store',
      source: 'manifest',
    })), 'no stores detected'),
    listSection('contexts', 'contexts', mergeContexts(contexts, manifestComponent), 'no observed contexts'),
    listSection('api', 'api', (manifestComponent?.api ?? []).map((endpoint) => ({
      name: endpoint.path,
      valuePreview: endpoint.method ?? endpoint.source,
      source: 'manifest',
    })), 'no api endpoints detected'),
  ];
}

function classifyComponents(
  snapshot: AppSnapshot,
  config: ArchitectureGraphConfig,
  manifestByTag: Map<string, ApplicationManifestComponent>,
): Map<string, 'card' | 'inline'> {
  const result = new Map<string, 'card' | 'inline'>();
  for (const component of snapshot.components) {
    result.set(component.id, shouldRenderComponentCard(component, snapshot, config, manifestByTag.get(component.tag)) ? 'card' : 'inline');
  }
  return result;
}

function shouldRenderComponentCard(
  component: ComponentInfo,
  snapshot: AppSnapshot,
  config: ArchitectureGraphConfig,
  manifestComponent?: ApplicationManifestComponent,
): boolean {
  if (!component.parentId) return true;
  if (manifestComponent?.architect?.display === 'inline') return false;
  if (manifestComponent?.architect?.display === 'card') return true;
  if (manifestComponent?.architect?.type === 'ui' || manifestComponent?.architect?.type === 'inline') return false;
  if (['application', 'layout', 'page', 'service', 'provider', 'router', 'store'].includes(manifestComponent?.architect?.type ?? '')) return true;
  if (matchesAny(component.tag, config.inlineComponentPatterns ?? [])) return false;
  if (matchesAny(component.tag, config.cardComponentPatterns ?? [])) return true;
  if (hasOwnedRuntimeData(component, snapshot)) return true;
  return true;
}

function hasOwnedRuntimeData(component: ComponentInfo, snapshot: AppSnapshot): boolean {
  if (Object.keys(component.properties ?? {}).length > 0) return true;
  if (Object.keys(component.state ?? {}).length > 0) return true;
  if (snapshot.signals.some((signal) => signal.subscribers?.includes(component.id) || signal.writers?.includes(component.id))) return true;
  if (snapshot.contexts.some((context) => context.providerId === component.id || context.consumerIds?.includes(component.id))) return true;
  return false;
}

function nearestCardComponentId(
  component: ComponentInfo,
  componentsById: Map<string, ComponentInfo>,
  componentRoles: Map<string, 'card' | 'inline'>,
): string {
  let current: ComponentInfo | undefined = component;
  while (current) {
    if (componentRoles.get(current.id) === 'card') return current.id;
    current = current.parentId ? componentsById.get(current.parentId) : undefined;
  }
  return component.id;
}

function groupInlineChildren(
  components: ComponentInfo[],
  componentRoles: Map<string, 'card' | 'inline'>,
  nearestCardByComponentId: Map<string, string>,
): Map<string, ArchitectureCardItem[]> {
  const countsByCard = new Map<string, Map<string, number>>();
  for (const component of components) {
    if (componentRoles.get(component.id) !== 'inline') continue;
    const ownerId = nearestCardByComponentId.get(component.id);
    if (!ownerId || ownerId === component.id) continue;
    const counts = countsByCard.get(ownerId) ?? new Map<string, number>();
    counts.set(component.tag, (counts.get(component.tag) ?? 0) + 1);
    countsByCard.set(ownerId, counts);
  }

  const result = new Map<string, ArchitectureCardItem[]>();
  for (const [ownerId, counts] of countsByCard) {
    result.set(ownerId, [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({
        name,
        valuePreview: `x${count}`,
        source: 'runtime',
      })));
  }
  return result;
}

function buildManifestApiNodes(
  manifest: ApplicationManifest | null | undefined,
  componentNodeIdsByTag: Map<string, string[]>,
  cardDepthById: Map<string, number>,
): { nodes: NodeCanvasNode[]; connectors: NodeCanvasConnector[] } {
  const nodesByEndpoint = new Map<string, NodeCanvasNode>();
  const ownersByEndpoint = new Map<string, Set<string>>();
  const connectors: NodeCanvasConnector[] = [];

  for (const component of manifest?.components ?? []) {
    const ownerIds = componentNodeIdsByTag.get(component.tag) ?? [];
    for (const endpoint of component.api ?? []) {
      const endpointKey = apiEndpointKey(endpoint.method, endpoint.path);
      const ownerSet = ownersByEndpoint.get(endpointKey) ?? new Set<string>();
      for (const ownerId of ownerIds) ownerSet.add(ownerId);
      ownersByEndpoint.set(endpointKey, ownerSet);

      if (!nodesByEndpoint.has(endpointKey)) {
        nodesByEndpoint.set(endpointKey, {
          id: `api:${endpointKey}`,
          title: endpoint.path,
          subtitle: endpoint.method ?? endpoint.source ?? 'api',
          type: 'api',
          icon: 'plug',
          tone: 'api',
          x: 0,
          y: 0,
          depth: 2,
          sections: [
            listSection('info', 'info', [
              { name: 'source', valuePreview: endpoint.source ?? 'detected', source: 'manifest' },
              { name: 'file', valuePreview: endpoint.file ?? component.file, source: 'manifest' },
            ]),
          ],
          nodeData: endpoint,
        });
      }
    }
  }

  const nodes = [...nodesByEndpoint.values()].map((node) => {
    const ownerIds = [...(ownersByEndpoint.get(node.id.slice(4)) ?? [])];
    return {
      ...node,
      subtitle: `${ownerIds.length} owner${ownerIds.length === 1 ? '' : 's'}`,
      depth: relatedDepth(cardDepthById, ownerIds, 1) + 0.75,
    };
  });

  for (const [endpointKey, ownerIds] of ownersByEndpoint) {
    for (const ownerId of ownerIds) {
      connectors.push({
        id: `api:${ownerId}->${endpointKey}`,
        from: ownerId,
        to: `api:${endpointKey}`,
        type: 'dependency',
        tone: 'success',
        label: 'api',
      });
    }
  }

  return { nodes, connectors };
}


function appendMapList<T>(map: Map<string, T[]>, key: string, value: T): void {
  const list = map.get(key) ?? [];
  list.push(value);
  map.set(key, list);
}

function relatedDepth(cardDepthById: Map<string, number>, cardIds: string[], fallback: number): number {
  const depths = cardIds
    .map((id) => cardDepthById.get(id))
    .filter((depth): depth is number => typeof depth === 'number');
  if (!depths.length) return fallback;
  return Math.min(...depths);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function apiEndpointKey(method: string | undefined, path: string): string {
  return `${method ?? 'ANY'} ${path}`;
}

function matchesAny(value: string, patterns: string[]): boolean {
  return patterns.some((pattern) => globToRegExp(pattern).test(value));
}

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

function signalsForComponent(signals: SignalInfo[], componentId: string): SignalInfo[] {
  return signals.filter((signal) =>
    signal.subscribers?.includes(componentId) ||
    signal.writers?.includes(componentId) ||
    signal.dependencies?.includes(componentId),
  );
}

function fieldSection(id: string, title: string, fields: Record<string, unknown>, emptyLabel: string): ArchitectureCardSection {
  return listSection(
    id,
    title,
    Object.entries(fields).map(([name, value]) => ({
      id: itemId(id, name),
      name,
      valuePreview: preview(value),
      source: 'runtime',
    })),
    emptyLabel,
  );
}

function mergedFieldSection(
  id: string,
  title: string,
  runtimeFields: Record<string, unknown>,
  manifestFields: Array<{ name: string; source?: string }>,
  emptyLabel: string,
  activityByName = new Map<string, ArchitectureCardItem['activity']>(),
): ArchitectureCardSection {
  const items = new Map<string, ArchitectureCardItem>();
  for (const field of manifestFields) {
    items.set(field.name, {
      id: itemId(id, field.name),
      name: field.name,
      valuePreview: field.source,
      source: 'manifest',
      activity: activityByName.get(field.name),
    });
  }
  for (const [name, value] of Object.entries(runtimeFields)) {
    items.set(name, {
      id: itemId(id, name),
      name,
      valuePreview: preview(value),
      source: items.has(name) ? 'merged' : 'runtime',
      activity: activityByName.get(name),
    });
  }
  return listSection(id, title, [...items.values()], emptyLabel);
}

function mergeSignals(signals: SignalInfo[], manifestComponent?: ApplicationManifestComponent): ArchitectureCardItem[] {
  const items = new Map<string, ArchitectureCardItem>();
  for (const field of manifestComponent?.signals ?? []) {
    items.set(field.name, {
      id: itemId('signals', field.name),
      name: field.name,
      type: field.source,
      valuePreview: field.source,
      source: 'manifest',
    });
  }
  for (const signal of signals) {
    const name = signalName(signal);
    items.set(name, {
      id: itemId('signals', name),
      name,
      valuePreview: preview(signal.value),
      type: signal.type,
      source: items.has(name) ? 'merged' : 'runtime',
      activity: signalActivity(signal),
    });
  }
  return [...items.values()];
}

function mergeContexts(
  contexts: Array<{ key: string; providerId?: string }>,
  manifestComponent?: ApplicationManifestComponent,
): ArchitectureCardItem[] {
  const items = new Map<string, ArchitectureCardItem>();
  for (const context of manifestComponent?.contexts ?? []) {
    items.set(`${context.role}:${context.key}`, {
      id: itemId('contexts', context.key),
      name: context.key,
      valuePreview: context.role,
      source: 'manifest',
    });
  }
  for (const context of contexts) {
    items.set(`consumer:${context.key}`, {
      id: itemId('contexts', context.key),
      name: context.key,
      valuePreview: context.providerId ? `from ${context.providerId}` : 'provider unknown',
      source: items.has(`consumer:${context.key}`) ? 'merged' : 'runtime',
    });
  }
  return [...items.values()];
}

function listSection(
  id: string,
  title: string,
  items: ArchitectureCardItem[],
  emptyLabel = 'empty',
): ArchitectureCardSection {
  return {
    id,
    title,
    items: items.slice(0, 8).map((item) => ({
      ...item,
      id: item.id ?? itemId(id, item.name),
    })),
    emptyLabel,
    collapsed: items.length === 0,
  };
}

function signalName(signal: SignalInfo): string {
  return signal.label || signal.id;
}

function signalActivity(signal: SignalInfo): ArchitectureCardItem['activity'] {
  return {
    reads: signal.readCount ?? 0,
    writes: signal.writeCount ?? 0,
    lastActiveTime: Math.max(signal.lastReadTime ?? 0, signal.lastWriteTime ?? 0) || undefined,
  };
}

function signalActivityByName(signals: SignalInfo[]): Map<string, ArchitectureCardItem['activity']> {
  const result = new Map<string, ArchitectureCardItem['activity']>();
  for (const signal of signals) {
    const name = signalName(signal);
    const current = result.get(name) ?? {};
    result.set(name, {
      reads: (current.reads ?? 0) + (signal.readCount ?? 0),
      writes: (current.writes ?? 0) + (signal.writeCount ?? 0),
      lastActiveTime: Math.max(current.lastActiveTime ?? 0, signal.lastReadTime ?? 0, signal.lastWriteTime ?? 0) || undefined,
    });
  }
  return result;
}

function fieldNameSet(
  runtimeFields: Record<string, unknown>,
  manifestFields: Array<{ name: string }>,
): Set<string> {
  return new Set([
    ...Object.keys(runtimeFields),
    ...manifestFields.map((field) => field.name),
  ]);
}

function signalAnchorItemId(
  signal: SignalInfo,
  component: ComponentInfo | undefined,
  manifestByTag: Map<string, ApplicationManifestComponent>,
): string {
  const name = signalName(signal);
  const manifestComponent = component ? manifestByTag.get(component.tag) : undefined;
  if (component && fieldNameSet(component.state ?? {}, manifestComponent?.state ?? []).has(name)) return itemId('state', name);
  if (component && fieldNameSet(component.properties ?? {}, manifestComponent?.properties ?? []).has(name)) return itemId('properties', name);
  return itemId('signals', name);
}

function componentById(componentsById: Map<string, ComponentInfo>, id: string): ComponentInfo | undefined {
  return componentsById.get(id);
}

function itemId(sectionId: string, name: string): string {
  return `${sectionId}:${name}`;
}

function preview(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return value.length > 28 ? `${value.slice(0, 25)}...` : value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return `[${value.length}]`;
  if (typeof value === 'object') return '{...}';
  return String(value);
}
