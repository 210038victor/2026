import type { Circuit } from '../types/circuit';

export interface ConnectedComponent {
  terminalIds: Set<string>;
}

export function buildAdjacencyMap(circuit: Circuit): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();

  for (const comp of circuit.components) {
    for (const t of comp.terminals) {
      if (!adj.has(t.id)) adj.set(t.id, new Set());
    }
  }

  for (const wire of circuit.wires) {
    const a = wire.from.terminalId;
    const b = wire.to.terminalId;
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  }

  return adj;
}

export function findConnectedComponents(circuit: Circuit): ConnectedComponent[] {
  const adj = buildAdjacencyMap(circuit);
  const visited = new Set<string>();
  const result: ConnectedComponent[] = [];

  for (const startId of adj.keys()) {
    if (visited.has(startId)) continue;
    const component = new Set<string>();
    const queue = [startId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      component.add(current);
      for (const neighbor of adj.get(current) ?? []) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }
    result.push({ terminalIds: component });
  }

  return result;
}

export function findFloatingNodes(circuit: Circuit): string[] {
  const floating: string[] = [];
  for (const comp of circuit.components) {
    if (comp.type === 'ground') continue;
    for (const terminal of comp.terminals) {
      // A terminal is floating if no wire connects to it
      const hasWire = circuit.wires.some(
        w => w.from.terminalId === terminal.id || w.to.terminalId === terminal.id
      );
      if (!hasWire) floating.push(terminal.id);
    }
  }
  return floating;
}
